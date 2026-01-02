"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DayAvailability,
  getDoctorAvailability,
} from "@/lib/actions/appointment.actions";
import { cn } from "@/lib/utils";

// Romanian day names
const DAY_NAMES_SHORT = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const MONTH_NAMES = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

// Helper functions
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  return new Date(d.setDate(diff));
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

// Format time from hours and minutes
const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

interface AvailabilityCalendarProps {
  doctorId: string;
  selectedDate: Date | null;
  onSelectSlot: (date: Date) => void;
  requiredDuration?: number; // minutes needed for appointment
}

export function AvailabilityCalendar({
  doctorId,
  selectedDate,
  onSelectSlot,
  requiredDuration = 30,
}: AvailabilityCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate week end
  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  // Fetch availability when doctor or week changes
  const fetchAvailability = useCallback(async () => {
    if (!doctorId) return;

    setIsLoading(true);
    try {
      const startDate = formatDate(weekStart);
      const endDate = formatDate(weekEnd);

      const data = await getDoctorAvailability(
        doctorId,
        startDate,
        endDate,
        requiredDuration
      );
      setAvailability(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, weekStart, weekEnd, requiredDuration]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Navigation handlers
  const goToToday = () => setWeekStart(getWeekStart(new Date()));

  const goToPrevious = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goToNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  // Get header title
  const getHeaderTitle = (): string => {
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`;
    } else {
      return `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()].slice(0, 3)}`;
    }
  };

  // Generate time blocks based on duration
  // Working hours: 8:00 - 20:00 (720 minutes)
  // Each block = requiredDuration minutes
  const timeBlocks = useMemo(() => {
    const blocks: { hour: number; minute: number; label: string }[] = [];
    const startHour = 8;
    const endHour = 20;
    const totalMinutes = (endHour - startHour) * 60; // 720 minutes

    let currentMinutes = 0;
    while (currentMinutes + requiredDuration <= totalMinutes) {
      const hour = startHour + Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const endMinutes = currentMinutes + requiredDuration;
      const endHourCalc = startHour + Math.floor(endMinutes / 60);
      const endMinuteCalc = endMinutes % 60;

      blocks.push({
        hour,
        minute,
        label: `${formatTime(hour, minute)} - ${formatTime(endHourCalc, endMinuteCalc)}`,
      });

      currentMinutes += requiredDuration;
    }

    return blocks;
  }, [requiredDuration]);

  // Check if a time block is available for a specific day
  const isBlockAvailable = (dayIndex: number, hour: number, minute: number): { available: boolean; occupiedBy?: { patientName?: string; reason?: string } } => {
    const day = availability[dayIndex];
    if (!day || day.isClosed) return { available: false };

    // Check all 30-min slots that this block covers
    const slotsNeeded = Math.ceil(requiredDuration / 30);
    let blockStartTime = hour * 60 + minute;

    for (let i = 0; i < slotsNeeded; i++) {
      const slotHour = Math.floor(blockStartTime / 60);
      const slotMinute = blockStartTime % 60;

      const slot = day.slots.find((s) => {
        const slotDate = new Date(s.start);
        return slotDate.getHours() === slotHour && slotDate.getMinutes() === slotMinute;
      });

      if (!slot || !slot.available) {
        return {
          available: false,
          occupiedBy: slot ? { patientName: slot.patientName, reason: slot.reason } : undefined
        };
      }

      blockStartTime += 30;
    }

    return { available: true };
  };

  // Check if block is selected
  const isBlockSelected = (dayIndex: number, hour: number, minute: number): boolean => {
    if (!selectedDate) return false;

    const day = availability[dayIndex];
    if (!day) return false;

    const blockDate = new Date(day.date);
    blockDate.setHours(hour, minute, 0, 0);

    return blockDate.getTime() === selectedDate.getTime();
  };

  // Handle block click
  const handleBlockClick = (dayIndex: number, hour: number, minute: number) => {
    const day = availability[dayIndex];
    if (!day) return;

    const blockDate = new Date(day.date);
    blockDate.setHours(hour, minute, 0, 0);

    onSelectSlot(blockDate);
  };

  if (!doctorId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">
          Selectați un medic pentru a vedea disponibilitatea
        </p>
      </div>
    );
  }

  // Calculate block height based on duration (base height is 32px for 30min)
  const blockHeight = Math.max(32, Math.round((requiredDuration / 30) * 32));

  return (
    <div className="flex flex-col space-y-3">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="shad-gray-btn h-8 text-sm"
          >
            Astăzi
          </Button>
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-semibold text-gray-700">
            {getHeaderTitle()}
          </h3>
          <p className="text-xs text-gray-500">
            Blocuri de {requiredDuration} min
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
          </div>
        ) : (
          <TooltipProvider delayDuration={200}>
            <div className="min-w-[700px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50/50">
                <div className="p-2 text-xs font-medium text-gray-400 text-center">
                  Ora
                </div>
                {availability.map((day, idx) => {
                  const dayDate = new Date(day.date);
                  const today = isToday(dayDate);
                  const isSunday = day.isClosed;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 text-center border-l border-gray-200",
                        today && "bg-gold-50",
                        isSunday && "bg-gray-100"
                      )}
                    >
                      <div className={cn(
                        "text-xs font-medium",
                        today ? "text-gold-600" : isSunday ? "text-gray-400" : "text-gray-500"
                      )}>
                        {DAY_NAMES_SHORT[day.dayOfWeek]}
                      </div>
                      <div className={cn(
                        "text-lg font-semibold",
                        today ? "text-gold-700" : isSunday ? "text-gray-400" : "text-gray-900"
                      )}>
                        {dayDate.getDate()}
                      </div>
                      {isSunday && (
                        <div className="text-[10px] text-gray-400">Închis</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Blocks */}
              <div className="max-h-[400px] overflow-y-auto">
                {timeBlocks.map((block, blockIdx) => (
                  <div
                    key={blockIdx}
                    className="grid grid-cols-8 border-b border-gray-100"
                  >
                    {/* Time Label */}
                    <div
                      className="p-1.5 text-[10px] text-gray-400 text-center bg-gray-50/30 flex items-center justify-center"
                      style={{ height: `${blockHeight}px` }}
                    >
                      <span className="leading-tight">
                        {block.label.split(" - ").map((t, i) => (
                          <span key={i}>
                            {t}
                            {i === 0 && <br />}
                          </span>
                        ))}
                      </span>
                    </div>

                    {/* Day Columns */}
                    {availability.map((day, dayIdx) => {
                      const blockStatus = isBlockAvailable(dayIdx, block.hour, block.minute);
                      const isSelected = isBlockSelected(dayIdx, block.hour, block.minute);
                      const dayDate = new Date(day.date);
                      const today = isToday(dayDate);

                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "border-l border-gray-100 p-0.5",
                            today && "bg-gold-50/20"
                          )}
                          style={{ height: `${blockHeight}px` }}
                        >
                          {day.isClosed ? (
                            <div className="h-full rounded bg-gray-100 flex items-center justify-center">
                              <span className="text-[10px] text-gray-400">-</span>
                            </div>
                          ) : blockStatus.available ? (
                            <button
                              type="button"
                              onClick={() => handleBlockClick(dayIdx, block.hour, block.minute)}
                              className={cn(
                                "w-full h-full rounded text-xs font-medium transition-all flex items-center justify-center",
                                isSelected
                                  ? "bg-gold-500 text-white shadow-md"
                                  : "bg-white hover:bg-gold-50 hover:border-gold-300 border border-gray-200 text-gray-600 hover:text-gold-700"
                              )}
                            >
                              {isSelected && "✓"}
                            </button>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="w-full h-full rounded bg-gray-200/80 flex items-center justify-center cursor-not-allowed">
                                  <span className="text-[10px] text-gray-500 truncate px-1">
                                    {blockStatus.occupiedBy?.patientName?.split(" ")[0] || "Ocupat"}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  <span className="font-medium">Ocupat:</span> {blockStatus.occupiedBy?.patientName || "Programare"}
                                </p>
                                {blockStatus.occupiedBy?.reason && (
                                  <p className="text-xs text-gray-400">{blockStatus.occupiedBy.reason}</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border border-gray-200 bg-white" />
          <span>Disponibil</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-200" />
          <span>Ocupat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gold-500" />
          <span>Selectat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-100" />
          <span>Închis</span>
        </div>
      </div>

      {/* Selected time display */}
      {selectedDate && (
        <div className="rounded-lg bg-gold-50 border border-gold-200 p-3">
          <p className="text-sm text-gold-800">
            <span className="font-medium">Programare selectată:</span>{" "}
            {selectedDate.toLocaleDateString("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            de la{" "}
            {selectedDate.toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" până la "}
            {new Date(selectedDate.getTime() + requiredDuration * 60 * 1000).toLocaleTimeString("ro-RO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" "}
            <span className="text-gold-600">({requiredDuration} min)</span>
          </p>
        </div>
      )}
    </div>
  );
}
