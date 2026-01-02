"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getServices } from "@/lib/actions/service.actions";
import { Appointment, Doctor, Service } from "@/types/appwrite.types";

import { AppointmentForm } from "./forms/AppointmentForm";

import "react-datepicker/dist/react-datepicker.css";

export const AppointmentModal = ({
  patientId,
  userId,
  appointment,
  type,
}: {
  patientId: string;
  userId: string;
  appointment?: Appointment;
  type: "schedule" | "cancel";
  title: string;
  description: string;
}) => {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [doctorsList, servicesList] = await Promise.all([
        getDoctors(),
        getServices(),
      ]);
      setDoctors(doctorsList);
      setServices(servicesList);
    };
    if (open) {
      loadData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${type === "schedule" && "text-gold-500"}`}
        >
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">
            {type === "schedule" ? "Confirmă programarea" : "Anulează programarea"}
          </DialogTitle>
          <DialogDescription>
            {type === "schedule"
              ? "Vă rugăm să completați detaliile pentru a confirma programarea"
              : "Vă rugăm să completați detaliile pentru a anula programarea"}
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm
          userId={userId}
          patientId={patientId}
          type={type}
          appointment={appointment}
          setOpen={setOpen}
          doctors={doctors}
          services={services}
        />
      </DialogContent>
    </Dialog>
  );
};
