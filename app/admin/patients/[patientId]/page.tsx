import { CalendarPlus, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PatientTabs } from "@/components/admin/PatientTabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { getPatientAppointments } from "@/lib/actions/auth.actions";
import { getPatientById } from "@/lib/actions/patient.actions";
import { Appointment } from "@/types/appwrite.types";

interface PatientDetailPageProps {
  params: { patientId: string };
}

const PatientDetailPage = async ({ params }: PatientDetailPageProps) => {
  const [patient, appointments] = await Promise.all([
    getPatientById(params.patientId),
    getPatientAppointments(params.patientId),
  ]);

  if (!patient) {
    notFound();
  }

  // Get initials for avatar
  const initials = patient.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/admin/patients"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gold-600 transition-colors w-fit"
      >
        ← Înapoi la pacienți
      </Link>

      {/* Patient Header */}
      <GlassCard variant="default" padding="lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-gold-200">
              <AvatarFallback className="bg-gold-100 text-gold-700 text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-gray-500">{patient.email}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">{patient.phone}</span>
              </div>
              {patient.allergies && (
                <p className="mt-2 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                  ⚠️ Alergii: {patient.allergies}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="shad-gray-btn gap-2">
              <Edit className="size-4" />
              Editează
            </Button>
            <Link href={`/admin/appointments/new?patientId=${patient.$id}`}>
              <Button className="shad-primary-btn gap-2">
                <CalendarPlus className="size-4" />
                Programare nouă
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Patient Tabs */}
      <PatientTabs
        patient={patient}
        appointments={appointments as Appointment[]}
      />
    </div>
  );
};

export default PatientDetailPage;
