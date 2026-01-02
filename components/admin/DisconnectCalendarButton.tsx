"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { disconnectGoogleCalendar } from "@/lib/actions/doctor.actions";

interface DisconnectCalendarButtonProps {
  doctorId: string;
}

export const DisconnectCalendarButton = ({
  doctorId,
}: DisconnectCalendarButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm("Sigur doriți să deconectați Google Calendar?")) return;

    setIsLoading(true);
    try {
      await disconnectGoogleCalendar(doctorId);
      router.refresh();
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={handleDisconnect}
      disabled={isLoading}
    >
      {isLoading ? "Se deconectează..." : "Deconectează Google Calendar"}
    </Button>
  );
};
