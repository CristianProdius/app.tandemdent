"use client";

import { Check, Clock, Loader2, Stethoscope } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import {
  TOOTH_CONDITIONS,
  TOOTH_NAMES,
  TREATMENT_STATUS,
  TREATMENT_TYPES,
} from "@/constants";
import { cn } from "@/lib/utils";
import { Treatment } from "@/types/appwrite.types";

interface TreatmentCardProps {
  treatment: Treatment;
  compact?: boolean;
  showTooth?: boolean;
}

export function TreatmentCard({
  treatment,
  compact = false,
  showTooth = false,
}: TreatmentCardProps) {
  const date = new Date(treatment.date);
  const month = date.toLocaleDateString("ro-RO", { month: "short" }).toUpperCase();
  const day = date.getDate().toString().padStart(2, "0");

  const conditionInfo = TOOTH_CONDITIONS[treatment.condition as keyof typeof TOOTH_CONDITIONS];
  const treatmentInfo = TREATMENT_TYPES[treatment.treatment as keyof typeof TREATMENT_TYPES];
  const statusInfo = TREATMENT_STATUS[treatment.status as keyof typeof TREATMENT_STATUS];

  const StatusIcon = treatment.status === "done"
    ? Check
    : treatment.status === "in_progress"
    ? Loader2
    : Clock;

  if (compact) {
    return (
      <GlassCard variant="subtle" padding="sm" className="hover:bg-white/70">
        <div className="flex items-center gap-3">
          {/* Date Badge */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-gold-100/80 px-2 py-1 min-w-[48px]">
            <span className="text-[10px] font-medium text-gold-600">{month}</span>
            <span className="text-lg font-bold text-gold-700 leading-none">{day}</span>
          </div>

          {/* Treatment Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 text-sm">
                {conditionInfo?.label || treatment.condition}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-600 text-sm">
                {treatmentInfo?.label || treatment.treatment}
              </span>
            </div>
            {treatment.doctorName && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Stethoscope className="size-3" />
                Dr. {treatment.doctorName}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              statusInfo?.color || "bg-gray-100 text-gray-600"
            )}
          >
            <StatusIcon className={cn("size-3", treatment.status === "in_progress" && "animate-spin")} />
            {statusInfo?.label || treatment.status}
          </div>
        </div>

        {treatment.notes && (
          <p className="mt-2 text-xs text-gray-500 pl-[60px] italic">
            {treatment.notes}
          </p>
        )}
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" padding="default" className="hover:shadow-glass-lg">
      <div className="flex gap-4">
        {/* Date Badge */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-gold-100/80 backdrop-blur-sm px-3 py-2 min-w-[60px]">
          <span className="text-xs font-medium text-gold-600">{month}</span>
          <span className="text-2xl font-bold text-gold-700 leading-none">{day}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              {showTooth && (
                <p className="text-xs text-gray-500 mb-1">
                  Dinte #{treatment.toothNumber} - {TOOTH_NAMES[treatment.toothNumber]}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    conditionInfo?.color || "bg-gray-100",
                    "border border-gray-200/50"
                  )}
                >
                  {conditionInfo?.label || treatment.condition}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-gray-900">
                  {treatmentInfo?.label || treatment.treatment}
                </span>
              </div>
            </div>

            {/* Status */}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                statusInfo?.color || "bg-gray-100 text-gray-600"
              )}
            >
              <StatusIcon className={cn("size-3.5", treatment.status === "in_progress" && "animate-spin")} />
              {statusInfo?.label || treatment.status}
            </div>
          </div>

          {/* Doctor */}
          {treatment.doctorName && (
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
              <Stethoscope className="size-4 text-gray-400" />
              Dr. {treatment.doctorName}
            </p>
          )}

          {/* Notes */}
          {treatment.notes && (
            <div className="rounded-lg bg-gray-50/80 backdrop-blur-sm p-3 border border-gray-100">
              <p className="text-sm text-gray-600">{treatment.notes}</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
