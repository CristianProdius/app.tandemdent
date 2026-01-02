import { Calendar, Clock, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
};

const typeConfig = {
  appointments: {
    bgGradient: "from-teal-500/20 to-teal-600/10",
    iconBg: "bg-teal-500/20",
    iconColor: "text-teal-600",
    textColor: "text-teal-700",
    Icon: Calendar,
  },
  pending: {
    bgGradient: "from-gold-500/20 to-gold-600/10",
    iconBg: "bg-gold-500/20",
    iconColor: "text-gold-600",
    textColor: "text-gold-700",
    Icon: Clock,
  },
  cancelled: {
    bgGradient: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600",
    textColor: "text-red-700",
    Icon: XCircle,
  },
};

export const StatCard = ({ count = 0, label, type }: StatCardProps) => {
  const config = typeConfig[type];
  const { Icon } = config;

  return (
    <div
      className={cn(
        "stat-card relative overflow-hidden",
        `bg-gradient-to-br ${config.bgGradient}`
      )}
    >
      {/* Decorative gradient orb */}
      <div
        className={cn(
          "absolute -right-4 -top-4 size-24 rounded-full opacity-30 blur-2xl",
          config.iconBg
        )}
      />

      <div className="relative flex items-center gap-4">
        {/* Glass icon container */}
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl backdrop-blur-sm",
            config.iconBg
          )}
        >
          <Icon className={cn("size-6", config.iconColor)} />
        </div>
        <h2 className={cn("text-32-bold", config.textColor)}>{count}</h2>
      </div>

      <p className="relative text-14-regular text-gray-600">{label}</p>
    </div>
  );
};
