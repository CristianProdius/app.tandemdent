"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "react-datepicker/dist/react-datepicker.css";

import { PatientSearchSelect } from "@/components/admin/PatientSearchSelect";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAppointment } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { getServices } from "@/lib/actions/service.actions";
import { Doctor, Patient, Service } from "@/types/appwrite.types";

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Selectați un pacient"),
  doctorId: z.string().min(1, "Selectați un medic"),
  schedule: z.date({ required_error: "Selectați data și ora" }),
  reason: z.string().min(2, "Introduceți motivul programării"),
  note: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const NewAppointmentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");

  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: preselectedPatientId || "",
      doctorId: "",
      schedule: new Date(),
      reason: "",
      note: "",
    },
  });

  // Load doctors and services on mount
  useEffect(() => {
    const loadData = async () => {
      const [doctorsList, servicesList] = await Promise.all([
        getDoctors(),
        getServices(),
      ]);
      setDoctors(doctorsList);
      setServices(servicesList);
    };
    loadData();
  }, []);

  // Load preselected patient
  useEffect(() => {
    const loadPatient = async () => {
      if (preselectedPatientId) {
        const patient = await getPatientById(preselectedPatientId);
        if (patient) {
          setSelectedPatient(patient);
        }
      }
    };
    loadPatient();
  }, [preselectedPatientId]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.$id);
  };

  const onSubmit = async (values: AppointmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedDoctor = doctors.find((d) => d.$id === values.doctorId);

      const appointment = await createAppointment({
        userId: selectedPatient?.userId || "",
        patient: values.patientId,
        primaryPhysician: selectedDoctor?.name || "",
        schedule: values.schedule,
        reason: values.reason,
        note: values.note,
        status: "scheduled",
      });

      if (appointment) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "A apărut o eroare la crearea programării");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programare nouă</h1>
        <p className="text-gray-500">
          Creați o programare pentru un pacient
        </p>
      </div>

      <GlassCard variant="default" padding="lg" className="max-w-2xl">
        <GlassCardHeader className="pb-4">
          <GlassCardTitle>Detalii programare</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 backdrop-blur-sm p-4 border border-red-200/50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pacient</FormLabel>
                  <FormControl>
                    {selectedPatient ? (
                      <div className="flex items-center justify-between rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-gold-100/80 backdrop-blur-sm text-gold-700">
                            {selectedPatient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                            <p className="text-sm text-gray-500">
                              {selectedPatient.email} • {selectedPatient.phone}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shad-gray-btn"
                          onClick={() => {
                            setSelectedPatient(null);
                            form.setValue("patientId", "");
                          }}
                        >
                          Schimbă
                        </Button>
                      </div>
                    ) : (
                      <PatientSearchSelect onSelect={handlePatientSelect} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Doctor Selection */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medic stomatolog</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="shad-select-trigger">
                        <SelectValue placeholder="Selectați un medic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="shad-select-content">
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.$id} value={doctor.$id}>
                          <div className="flex items-center gap-2">
                            {doctor.image ? (
                              <Image
                                src={doctor.image}
                                alt={doctor.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                                {doctor.name.charAt(0)}
                              </div>
                            )}
                            <span>Dr. {doctor.name}</span>
                            {doctor.specialty && (
                              <span className="text-gray-400">
                                - {doctor.specialty}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data și ora programării</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={30}
                      dateFormat="dd/MM/yyyy - HH:mm"
                      minDate={new Date()}
                      className="shad-input w-full cursor-pointer"
                      placeholderText="Selectați data și ora"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service/Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviciu</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="shad-select-trigger">
                        <SelectValue placeholder="Selectați serviciul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="shad-select-content">
                      {services.map((service) => (
                        <SelectItem key={service.$id} value={service.name}>
                          <div className="flex items-center gap-3">
                            <span>{service.name}</span>
                            <span className="text-gray-400">
                              ({service.duration} min)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observații (opțional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observații suplimentare..."
                      className="shad-textArea"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="shad-gray-btn"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                className="shad-primary-btn"
                disabled={isLoading}
              >
                {isLoading ? "Se creează..." : "Creează programarea"}
              </Button>
            </div>
            </form>
          </Form>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};

export default NewAppointmentPage;
