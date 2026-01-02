"use client";

import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAppointmentsByDateRange } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { cn } from "@/lib/utils";
import { Appointment, Doctor } from "@/types/appwrite.types";

type CalendarView = "day" | "week";

// Color palette for different doctors
const DOCTOR_COLORS = [
  { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" },
  { bg: "bg-emerald-100", border: "border-emerald-400", text: "text-emerald-700" },
  { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700" },
  { bg: "bg-amber-100", border: "border-amber-400", text: "text-amber-700" },
  { bg: "bg-rose-100", border: "border-rose-400", text: "text-rose-700" },
  { bg: "bg-cyan-100", border: "border-cyan-400", text: "text-cyan-700" },
  { bg: "bg-indigo-100", border: "border-indigo-400", text: "text-indigo-700" },
  { bg: "bg-lime-100", border: "border-lime-400", text: "text-lime-700" },
];

// Status colors
const STATUS_STYLES = {
  scheduled: { indicator: "bg-emerald-500" },
  pending: { indicator: "bg-amber-500" },
  cancelled: { indicator: "bg-red-500" },
};

// Working hours (8 AM to 8 PM)
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

// Romanian day names
const DAY_NAMES_SHORT = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const DAY_NAMES_FULL = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

// Romanian month names
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

const getWeekDays = (startDate: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

interface AppointmentCalendarProps {
  initialAppointments?: Appointment[];
  initialDoctors?: Doctor[];
}

export function AppointmentCalendar({
  initialAppointments = [],
  initialDoctors = [],
}: AppointmentCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isLoading, setIsLoading] = useState(false);

  // Create doctor color map
  const doctorColorMap = useMemo(() => {
    const map = new Map<string, typeof DOCTOR_COLORS[0]>();
    doctors.forEach((doctor, index) => {
      map.set(doctor.$id, DOCTOR_COLORS[index % DOCTOR_COLORS.length]);
    });
    return map;
  }, [doctors]);

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    if (view === "day") {
      return {
        start: new Date(currentDate.setHours(0, 0, 0, 0)),
        end: new Date(currentDate.setHours(23, 59, 59, 999)),
        days: [currentDate],
      };
    } else {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return {
        start: weekStart,
        end: weekEnd,
        days: getWeekDays(weekStart),
      };
    }
  }, [view, currentDate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appointmentsData, doctorsData] = await Promise.all([
        getAppointmentsByDateRange(
          dateRange.start.toISOString(),
          dateRange.end.toISOString(),
          selectedDoctor !== "all" ? selectedDoctor : undefined
        ),
        doctors.length === 0 ? getDoctors() : Promise.resolve(doctors),
      ]);

      setAppointments(appointmentsData);
      if (doctors.length === 0) {
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, selectedDoctor, doctors.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation handlers
  const goToToday = () => setCurrentDate(new Date());

  const goToPrevious = () => {
    const d = new Date(currentDate);
    if (view === "day") {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const goToNext = () => {
    const d = new Date(currentDate);
    if (view === "day") {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  // Get appointments for a specific day and hour
  const getAppointmentsForSlot = (day: Date, hour: number): Appointment[] => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.schedule);
      return (
        isSameDay(aptDate, day) &&
        aptDate.getHours() === hour
      );
    });
  };

  // Format header title
  const getHeaderTitle = (): string => {
    if (view === "day") {
      const dayIndex = (currentDate.getDay() + 6) % 7;
      return `${DAY_NAMES_FULL[dayIndex]}, ${currentDate.getDate()} ${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const weekStart = dateRange.start;
      const weekEnd = dateRange.end;
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      } else {
        return `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="shad-gray-btn"
          >
            Astăzi
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[200px]">
            {getHeaderTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Doctor filter */}
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[180px] shad-input">
              <SelectValue placeholder="Toți medicii" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți medicii</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.$id} value={doctor.$id}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        doctorColorMap.get(doctor.$id)?.bg
                      )}
                    />
                    {doctor.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 bg-white/80 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("day")}
              className={cn(
                "px-3 h-7 text-sm",
                view === "day" && "bg-gold-100 text-gold-700"
              )}
            >
              Zi
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("week")}
              className={cn(
                "px-3 h-7 text-sm",
                view === "week" && "bg-gold-100 text-gold-700"
              )}
            >
              Săptămână
            </Button>
          </div>
        </div>
      </div>

      {/* Doctor Legend */}
      {selectedDoctor === "all" && doctors.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 px-1">
          {doctors.map((doctor) => {
            const colors = doctorColorMap.get(doctor.$id);
            return (
              <div key={doctor.$id} className="flex items-center gap-1.5 text-sm">
                <div className={cn("w-3 h-3 rounded-full", colors?.bg, colors?.border, "border")} />
                <span className="text-gray-600">{doctor.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200"
              style={{ gridTemplateColumns: `60px repeat(${dateRange.days.length}, 1fr)` }}
            >
              <div className="p-2 border-r border-gray-200" />
              {dateRange.days.map((day, idx) => {
                const dayIndex = (day.getDay() + 6) % 7;
                const today = isToday(day);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 text-center border-r border-gray-200 last:border-r-0",
                      today && "bg-gold-50"
                    )}
                  >
                    <div className={cn(
                      "text-xs font-medium",
                      today ? "text-gold-600" : "text-gray-500"
                    )}>
                      {DAY_NAMES_SHORT[dayIndex]}
                    </div>
                    <div className={cn(
                      "text-lg font-semibold",
                      today ? "text-gold-700" : "text-gray-900"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-gray-100"
                  style={{
                    gridTemplateColumns: `60px repeat(${dateRange.days.length}, 1fr)`,
                    minHeight: "60px"
                  }}
                >
                  {/* Time Label */}
                  <div className="p-1 text-xs text-gray-400 text-right pr-2 border-r border-gray-200">
                    {hour.toString().padStart(2, "0")}:00
                  </div>

                  {/* Day Columns */}
                  {dateRange.days.map((day, dayIdx) => {
                    const slotAppointments = getAppointmentsForSlot(day, hour);
                    const today = isToday(day);

                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          "border-r border-gray-100 last:border-r-0 p-0.5 relative",
                          today && "bg-gold-50/30"
                        )}
                      >
                        {slotAppointments.map((apt, aptIdx) => {
                          const doctorColors = doctorColorMap.get(apt.doctorId || "");
                          const statusStyle = STATUS_STYLES[apt.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.pending;

                          return (
                            <div
                              key={apt.$id}
                              className={cn(
                                "rounded-md p-1.5 mb-0.5 border-l-2 text-xs cursor-pointer transition-all hover:shadow-md",
                                doctorColors?.bg || "bg-gray-100",
                                doctorColors?.border || "border-gray-400",
                                doctorColors?.text || "text-gray-700"
                              )}
                              style={{
                                marginLeft: aptIdx * 4 + "px",
                              }}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", statusStyle.indicator)} />
                                <span className="font-medium truncate">
                                  {new Date(apt.schedule).toLocaleTimeString("ro-RO", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 truncate">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {apt.patient?.name || "Pacient"}
                                </span>
                              </div>
                              {apt.reason && (
                                <div className="text-[10px] opacity-75 truncate mt-0.5">
                                  {apt.reason}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Confirmat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>În așteptare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Anulat</span>
        </div>
      </div>
    </div>
  );
}
