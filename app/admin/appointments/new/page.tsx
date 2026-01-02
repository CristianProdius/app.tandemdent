"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AvailabilityCalendar } from "@/components/admin/AvailabilityCalendar";
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
import { cn } from "@/lib/utils";
import { Doctor, Patient, Service } from "@/types/appwrite.types";

// Selected service with quantity
interface SelectedService {
  service: Service;
  quantity: number;
}

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Selectați un pacient"),
  doctorId: z.string().min(1, "Selectați un medic"),
  schedule: z.date({ required_error: "Selectați data și ora" }),
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

  // Multi-service selection state
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: preselectedPatientId || "",
      doctorId: "",
      schedule: new Date(),
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

  // Calculate total duration
  const totalDuration = useMemo(() => {
    return selectedServices.reduce((total, item) => {
      return total + item.service.duration * item.quantity;
    }, 0);
  }, [selectedServices]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((total, item) => {
      return total + item.service.price * item.quantity;
    }, 0);
  }, [selectedServices]);

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Add service to selection (auto-add when selected from dropdown)
  const handleAddService = (serviceId: string) => {
    if (!serviceId) return;

    const service = services.find((s) => s.$id === serviceId);
    if (!service) return;

    // Check if service already exists
    const existingIndex = selectedServices.findIndex(
      (s) => s.service.$id === serviceId
    );

    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...selectedServices];
      updated[existingIndex].quantity += 1;
      setSelectedServices(updated);
    } else {
      // Add new service
      setSelectedServices([...selectedServices, { service, quantity: 1 }]);
    }
  };

  // Update quantity
  const handleQuantityChange = (serviceId: string, delta: number) => {
    setSelectedServices((prev) =>
      prev
        .map((item) => {
          if (item.service.$id === serviceId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedService[]
    );
  };

  // Remove service
  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.filter((item) => item.service.$id !== serviceId)
    );
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.$id);
  };

  const onSubmit = async (values: AppointmentFormValues) => {
    if (selectedServices.length === 0) {
      setError("Selectați cel puțin un serviciu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedDoctor = doctors.find((d) => d.$id === values.doctorId);

      // Build services summary for reason field
      const servicesSummary = selectedServices
        .map((s) =>
          s.quantity > 1
            ? `${s.service.name} (x${s.quantity})`
            : s.service.name
        )
        .join(", ");

      // Build detailed services JSON for storage
      const servicesData = JSON.stringify(
        selectedServices.map((s) => ({
          serviceId: s.service.$id,
          serviceName: s.service.name,
          quantity: s.quantity,
          duration: s.service.duration,
          price: s.service.price,
        }))
      );

      const appointment = await createAppointment({
        userId: selectedPatient?.userId || "",
        patient: values.patientId,
        primaryPhysician: selectedDoctor?.name || "",
        schedule: values.schedule,
        reason: servicesSummary,
        note: values.note
          ? `${values.note}\n\n---\nServicii: ${servicesData}`
          : `Servicii: ${servicesData}`,
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

  // Available services (not yet selected)
  const availableServices = services.filter(
    (s) => !selectedServices.find((ss) => ss.service.$id === s.$id)
  );

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programare nouă</h1>
        <p className="text-gray-500">Creați o programare pentru un pacient</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <GlassCard variant="default" padding="lg" className="lg:col-span-2">
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Patient Selection */}
                <FormField
                  control={form.control}
                  name="patientId"
                  render={() => (
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
                                <p className="font-medium text-gray-900">
                                  {selectedPatient.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {selectedPatient.email} •{" "}
                                  {selectedPatient.phone}
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

                {/* Services Selection - BEFORE Date/Time so duration is known */}
                <div className="space-y-3">
                  <FormLabel>Servicii</FormLabel>

                  {/* Add service dropdown - auto-adds on selection */}
                  <Select value="" onValueChange={handleAddService}>
                    <SelectTrigger className="shad-select-trigger">
                      <SelectValue placeholder="Adăugați un serviciu..." />
                    </SelectTrigger>
                    <SelectContent className="shad-select-content">
                      {availableServices.map((service) => (
                        <SelectItem key={service.$id} value={service.$id}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{service.name}</span>
                            <span className="text-gray-400 text-sm">
                              {service.duration} min • {service.price} MDL
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {availableServices.length === 0 && (
                        <div className="px-2 py-4 text-center text-sm text-gray-500">
                          Toate serviciile au fost adăugate
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Selected services list */}
                  {selectedServices.length > 0 ? (
                    <div className="space-y-2">
                      {selectedServices.map((item) => (
                        <div
                          key={item.service.$id}
                          className="flex items-center justify-between rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.service.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.service.duration} min • {item.service.price}{" "}
                              MDL
                              {item.quantity > 1 && (
                                <span className="ml-2 text-gold-600">
                                  × {item.quantity} ={" "}
                                  {item.service.duration * item.quantity} min •{" "}
                                  {item.service.price * item.quantity} MDL
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.service.$id, -1)
                                }
                                className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="size-4 text-gray-500" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.service.$id, 1)
                                }
                                className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="size-4 text-gray-500" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveService(item.service.$id)
                              }
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                      <p className="text-sm text-gray-500">
                        Nu ați selectat niciun serviciu.
                        <br />
                        Adăugați servicii din lista de mai sus.
                      </p>
                    </div>
                  )}
                </div>

                {/* Date and Time - Smart Availability Calendar */}
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data și ora programării</FormLabel>
                      <FormControl>
                        <AvailabilityCalendar
                          doctorId={form.watch("doctorId")}
                          selectedDate={field.value}
                          onSelectSlot={(date) => field.onChange(date)}
                          requiredDuration={totalDuration || 30}
                        />
                      </FormControl>
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
                    disabled={isLoading || selectedServices.length === 0}
                  >
                    {isLoading ? "Se creează..." : "Creează programarea"}
                  </Button>
                </div>
              </form>
            </Form>
          </GlassCardContent>
        </GlassCard>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <GlassCard variant="gold" padding="default">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Sumar programare</h3>

              {selectedServices.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {selectedServices.map((item) => (
                      <div
                        key={item.service.$id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.service.name}
                          {item.quantity > 1 && (
                            <span className="text-gray-400">
                              {" "}
                              × {item.quantity}
                            </span>
                          )}
                        </span>
                        <span className="text-gray-900">
                          {item.service.duration * item.quantity} min
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gold-200/50 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock className="size-4" />
                        Durată totală
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatDuration(totalDuration)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total estimat</span>
                      <span className="font-semibold text-gold-700">
                        {totalPrice} MDL
                      </span>
                    </div>
                  </div>

                  {/* End time estimate */}
                  {form.watch("schedule") && (
                    <div className="rounded-lg bg-gold-100/50 p-3 text-sm">
                      <p className="text-gray-600">
                        Ora finalizare estimată:{" "}
                        <span className="font-medium text-gray-900">
                          {new Date(
                            form.watch("schedule").getTime() +
                              totalDuration * 60000
                          ).toLocaleTimeString("ro-RO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Selectați serviciile pentru a vedea sumarul.
                </p>
              )}
            </div>
          </GlassCard>

          {/* Quick add common services */}
          <GlassCard variant="subtle" padding="default">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Servicii frecvente
            </h4>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 5).map((service) => {
                const isSelected = selectedServices.some(
                  (s) => s.service.$id === service.$id
                );
                return (
                  <button
                    key={service.$id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveService(service.$id);
                      } else {
                        setSelectedServices([
                          ...selectedServices,
                          { service, quantity: 1 },
                        ]);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      isSelected
                        ? "bg-gold-500 text-white"
                        : "bg-white/60 text-gray-600 hover:bg-white/80 border border-gray-200"
                    )}
                  >
                    {service.name}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentPage;
