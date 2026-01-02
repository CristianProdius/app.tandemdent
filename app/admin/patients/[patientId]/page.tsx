import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPatientById } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";

interface PatientDetailPageProps {
  params: { patientId: string };
}

const PatientDetailPage = async ({ params }: PatientDetailPageProps) => {
  const patient = await getPatientById(params.patientId);

  if (!patient) {
    notFound();
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/patients"
            className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Înapoi la pacienți
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-500">{patient.email}</p>
        </div>
        <Link href={`/admin/appointments/new?patientId=${patient.$id}`}>
          <Button className="shad-primary-btn">+ Programare nouă</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patient Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informații personale
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nume complet</dt>
              <dd className="mt-1 text-gray-900">{patient.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900">{patient.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Telefon</dt>
              <dd className="mt-1 text-gray-900">{patient.phone}</dd>
            </div>
            {patient.birthDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Data nașterii</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDateTime(patient.birthDate).dateOnly}
                </dd>
              </div>
            )}
            {patient.gender && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Gen</dt>
                <dd className="mt-1 text-gray-900">{patient.gender}</dd>
              </div>
            )}
            {patient.address && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Adresă</dt>
                <dd className="mt-1 text-gray-900">{patient.address}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Medical Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informații medicale
          </h2>
          <dl className="space-y-4">
            {patient.primaryPhysician && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Medic principal</dt>
                <dd className="mt-1 text-gray-900">{patient.primaryPhysician}</dd>
              </div>
            )}
            {patient.insuranceProvider && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Asigurare</dt>
                <dd className="mt-1 text-gray-900">
                  {patient.insuranceProvider}
                  {patient.insurancePolicyNumber && ` - ${patient.insurancePolicyNumber}`}
                </dd>
              </div>
            )}
            {patient.allergies && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Alergii</dt>
                <dd className="mt-1 text-gray-900">{patient.allergies}</dd>
              </div>
            )}
            {patient.currentMedication && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Medicație curentă</dt>
                <dd className="mt-1 text-gray-900">{patient.currentMedication}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Emergency Contact Card */}
        {patient.emergencyContactName && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact de urgență
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nume</dt>
                <dd className="mt-1 text-gray-900">{patient.emergencyContactName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-gray-900">{patient.emergencyContactNumber}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Registration Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informații înregistrare
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Data înregistrării</dt>
              <dd className="mt-1 text-gray-900">
                {formatDateTime(patient.$createdAt).dateTime}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID Pacient</dt>
              <dd className="mt-1 font-mono text-sm text-gray-500">
                {patient.$id}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
