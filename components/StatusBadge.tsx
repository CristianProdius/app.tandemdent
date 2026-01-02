import { CheckCircle, Clock, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const statusConfig = {
  scheduled: {
    label: "Confirmat",
    bgClass: "bg-teal-500/20 backdrop-blur-sm",
    textClass: "text-teal-700",
    dotClass: "bg-teal-500",
    Icon: CheckCircle,
  },
  pending: {
    label: "În așteptare",
    bgClass: "bg-gold-500/20 backdrop-blur-sm",
    textClass: "text-gold-700",
    dotClass: "bg-gold-500",
    Icon: Clock,
  },
  cancelled: {
    label: "Anulat",
    bgClass: "bg-red-500/20 backdrop-blur-sm",
    textClass: "text-red-700",
    dotClass: "bg-red-500",
    Icon: XCircle,
  },
};

export const StatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status];
  const { Icon } = config;

  return (
    <div
      className={cn(
        "status-badge border border-white/30",
        config.bgClass
      )}
    >
      <Icon className={cn("size-3.5", config.textClass)} />
      <p className={cn("text-12-semibold", config.textClass)}>
        {config.label}
      </p>
    </div>
  );
};
