"use client";

import {
  Calendar,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDoctors } from "@/lib/actions/doctor.actions";
import {
  getPatientToothConditions,
  getTreatmentsByPatient,
  getTreatmentsByTooth,
} from "@/lib/actions/treatment.actions";
import { formatDateTime } from "@/lib/utils";
import {
  Appointment,
  Doctor,
  Patient,
  ToothCondition,
  Treatment,
} from "@/types/appwrite.types";

import { Odontogram } from "./Odontogram";
import { ToothDetailModal } from "./ToothDetailModal";
import { TreatmentCard } from "./TreatmentCard";

interface PatientTabsProps {
  patient: Patient;
  appointments: Appointment[];
}

export function PatientTabs({ patient, appointments }: PatientTabsProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothConditions, setToothConditions] = useState<Record<number, ToothCondition>>({});
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedToothTreatments, setSelectedToothTreatments] = useState<Treatment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [conditions, allTreatments, doctorsList] = await Promise.all([
        getPatientToothConditions(patient.$id),
        getTreatmentsByPatient(patient.$id),
        getDoctors(),
      ]);
      setToothConditions(conditions);
      setTreatments(allTreatments);
      setDoctors(doctorsList);
    };
    loadData();
  }, [patient.$id]);

  // Load treatments for selected tooth
  const handleToothClick = useCallback(async (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    const toothTreatments = await getTreatmentsByTooth(patient.$id, toothNumber);
    setSelectedToothTreatments(toothTreatments);
    setIsModalOpen(true);
  }, [patient.$id]);

  // Refresh data after adding treatment
  const handleTreatmentAdded = useCallback(async () => {
    const [conditions, allTreatments] = await Promise.all([
      getPatientToothConditions(patient.$id),
      getTreatmentsByPatient(patient.$id),
    ]);
    setToothConditions(conditions);
    setTreatments(allTreatments);

    // Also refresh selected tooth treatments
    if (selectedTooth) {
      const toothTreatments = await getTreatmentsByTooth(patient.$id, selectedTooth);
      setSelectedToothTreatments(toothTreatments);
    }
  }, [patient.$id, selectedTooth]);

  // Separate appointments into upcoming and past
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.schedule) >= now && a.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.schedule) < now || a.status === "cancelled"
  );

  return (
    <>
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger
            value="info"
            className="data-[state=active]:bg-gold-100 data-[state=active]:text-gold-700"
          >
            <User className="mr-2 size-4" />
            Informații pacient
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-gold-100 data-[state=active]:text-gold-700"
          >
            <Calendar className="mr-2 size-4" />
            Istoric programări
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="data-[state=active]:bg-gold-100 data-[state=active]:text-gold-700"
          >
            <FileText className="mr-2 size-4" />
            Fișă medicală
          </TabsTrigger>
        </TabsList>

        {/* Patient Information Tab */}
        <TabsContent value="info" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Personal Info */}
            <GlassCard variant="default" padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <User className="size-5 text-gold-600" />
                Informații personale
              </h3>
              <div className="space-y-3">
                <InfoRow icon={Mail} label="Email" value={patient.email} />
                <InfoRow icon={Phone} label="Telefon" value={patient.phone} />
                <InfoRow
                  icon={Calendar}
                  label="Data nașterii"
                  value={new Date(patient.birthDate).toLocaleDateString("ro-RO")}
                />
                <InfoRow icon={User} label="Gen" value={patient.gender} />
                <InfoRow icon={MapPin} label="Adresă" value={patient.address} />
              </div>
            </GlassCard>

            {/* Medical Info */}
            <GlassCard variant="default" padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Stethoscope className="size-5 text-gold-600" />
                Informații medicale
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={Stethoscope}
                  label="Medic primar"
                  value={patient.primaryPhysician || "Nespecificat"}
                />
                <InfoRow
                  icon={Shield}
                  label="Asigurare"
                  value={patient.insuranceProvider || "Nespecificat"}
                />
                {patient.allergies && (
                  <InfoRow
                    icon={Shield}
                    label="Alergii"
                    value={patient.allergies}
                    variant="warning"
                  />
                )}
                {patient.currentMedication && (
                  <InfoRow
                    icon={FileText}
                    label="Medicație curentă"
                    value={patient.currentMedication}
                  />
                )}
              </div>
            </GlassCard>

            {/* Emergency Contact */}
            {patient.emergencyContactName && (
              <GlassCard variant="subtle" padding="lg">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Phone className="size-5 text-gold-600" />
                  Contact de urgență
                </h3>
                <div className="space-y-3">
                  <InfoRow
                    icon={User}
                    label="Nume"
                    value={patient.emergencyContactName}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Telefon"
                    value={patient.emergencyContactNumber}
                  />
                </div>
              </GlassCard>
            )}

            {/* Registration Info */}
            <GlassCard variant="subtle" padding="lg">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="size-5 text-gold-600" />
                Informații înregistrare
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={Calendar}
                  label="Data înregistrării"
                  value={new Date(patient.$createdAt).toLocaleDateString("ro-RO")}
                />
                <InfoRow icon={FileText} label="ID Pacient" value={patient.$id} />
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-6">
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Programări viitoare ({upcomingAppointments.length})
                </h3>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard key={appointment.$id} appointment={appointment} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Istoric programări ({pastAppointments.length})
                </h3>
                <div className="space-y-3">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.$id}
                      appointment={appointment}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}

            {appointments.length === 0 && (
              <GlassCard variant="subtle" padding="lg">
                <p className="text-center text-gray-500 py-8">
                  Nu există programări înregistrate pentru acest pacient.
                </p>
              </GlassCard>
            )}
          </div>
        </TabsContent>

        {/* Medical Record Tab */}
        <TabsContent value="medical" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Odontogram */}
            <GlassCard variant="default" padding="lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Odontogramă
              </h3>
              <Odontogram
                toothConditions={toothConditions}
                selectedTooth={selectedTooth}
                onToothClick={handleToothClick}
              />
              <p className="mt-4 text-sm text-gray-500 text-center">
                Faceți clic pe un dinte pentru a vedea sau adăuga tratamente
              </p>
            </GlassCard>

            {/* Recent Treatments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tratamente recente ({treatments.length})
              </h3>
              {treatments.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {treatments.slice(0, 10).map((treatment) => (
                    <TreatmentCard
                      key={treatment.$id}
                      treatment={treatment}
                      showTooth
                    />
                  ))}
                </div>
              ) : (
                <GlassCard variant="subtle" padding="lg">
                  <p className="text-center text-gray-500 py-8">
                    Nu există tratamente înregistrate.
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tooth Detail Modal */}
      {selectedTooth && (
        <ToothDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTooth(null);
          }}
          toothNumber={selectedTooth}
          patientId={patient.$id}
          treatments={selectedToothTreatments}
          doctors={doctors}
          onTreatmentAdded={handleTreatmentAdded}
        />
      )}
    </>
  );
}

// Helper components
interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  variant?: "default" | "warning";
}

function InfoRow({ icon: Icon, label, value, variant = "default" }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-gold-100/50">
        <Icon className="size-4 text-gold-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p
          className={
            variant === "warning"
              ? "font-medium text-orange-600"
              : "text-gray-900"
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
}

function AppointmentCard({ appointment, isPast }: AppointmentCardProps) {
  const { dateOnly, timeOnly } = formatDateTime(appointment.schedule);

  return (
    <GlassCard
      variant={isPast ? "subtle" : "default"}
      padding="default"
      className={isPast ? "opacity-75" : ""}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl bg-gold-100/80 px-3 py-2 min-w-[70px]">
            <span className="text-xs text-gold-600">{dateOnly.split(" ")[1]}</span>
            <span className="text-xl font-bold text-gold-700">
              {dateOnly.split(" ")[0]}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={appointment.status} />
            </div>
            <p className="font-medium text-gray-900">
              Dr. {appointment.primaryPhysician}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {timeOnly}
              </span>
              <span>{appointment.reason}</span>
            </div>
          </div>
        </div>
      </div>
      {appointment.note && (
        <p className="mt-3 text-sm text-gray-600 pl-[86px]">
          <span className="font-medium">Notă:</span> {appointment.note}
        </p>
      )}
    </GlassCard>
  );
}
