import { Calendar, Clock, FileText, Stethoscope } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { GlassCard } from "@/components/ui/glass-card";
import { cn, formatDateTime } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: {
    $id: string;
    schedule: string;
    primaryPhysician: string;
    reason: string;
    status: "scheduled" | "pending" | "cancelled";
    note?: string;
    cancellationReason?: string;
  };
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { dateOnly, timeOnly } = formatDateTime(appointment.schedule);
  const isPast = new Date(appointment.schedule) < new Date();

  return (
    <GlassCard
      variant="default"
      padding="default"
      className={cn(
        isPast && appointment.status === "scheduled" && "opacity-75"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Status Row */}
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            {isPast && appointment.status === "scheduled" && (
              <span className="inline-flex items-center rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-600 backdrop-blur-sm">
                Trecut
              </span>
            )}
          </div>

          {/* Doctor Name */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gold-100/50 backdrop-blur-sm">
              <Stethoscope className="size-5 text-gold-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dr. {appointment.primaryPhysician}
            </h3>
          </div>

          {/* Appointment Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="size-4 text-gray-400" />
              <span className="font-medium">Data:</span> {dateOnly}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="size-4 text-gray-400" />
              <span className="font-medium">Ora:</span> {timeOnly}
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <FileText className="size-4 mt-0.5 text-gray-400" />
              <span>
                <span className="font-medium">Motiv:</span> {appointment.reason}
              </span>
            </div>
          </div>

          {/* Note */}
          {appointment.note && (
            <div className="mt-4 rounded-xl bg-gold-50/50 backdrop-blur-sm p-3 border border-gold-200/30">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notă:</span> {appointment.note}
              </p>
            </div>
          )}

          {/* Cancellation Reason */}
          {appointment.cancellationReason && (
            <div className="mt-4 rounded-xl bg-red-50/50 backdrop-blur-sm p-3 border border-red-200/30">
              <p className="text-sm text-red-700">
                <span className="font-medium">Motiv anulare:</span>{" "}
                {appointment.cancellationReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
