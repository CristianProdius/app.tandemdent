import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DisconnectCalendarButton } from "@/components/admin/DisconnectCalendarButton";
import { DoctorEditForm } from "@/components/admin/DoctorEditForm";
import { Button } from "@/components/ui/button";
import { getDoctor } from "@/lib/actions/doctor.actions";
import { getGoogleAuthUrl } from "@/lib/google.config";

interface DoctorDetailPageProps {
  params: { doctorId: string };
  searchParams: { success?: string; error?: string };
}

const DoctorDetailPage = async ({ params, searchParams }: DoctorDetailPageProps) => {
  const doctor = await getDoctor(params.doctorId);

  if (!doctor) {
    notFound();
  }

  const googleAuthUrl = getGoogleAuthUrl(params.doctorId);

  return (
    <div className="flex flex-col space-y-8">
      {/* Success/Error Messages from OAuth */}
      {searchParams.success === "calendar_connected" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-800">
            Google Calendar conectat cu succes!
          </p>
          <p className="text-sm text-green-600">
            Programările vor fi sincronizate automat în calendarul medicului.
          </p>
        </div>
      )}
      {searchParams.error === "access_denied" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="font-medium text-yellow-800">
            Accesul a fost refuzat
          </p>
          <p className="text-sm text-yellow-600">
            Nu ați permis accesul la Google Calendar. Încercați din nou.
          </p>
        </div>
      )}
      {searchParams.error === "connection_failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">
            Eroare la conectare
          </p>
          <p className="text-sm text-red-600">
            A apărut o eroare la conectarea cu Google Calendar. Încercați din nou.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/doctors"
            className="mb-2 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Înapoi la medici
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h1>
          {doctor.specialty && (
            <p className="text-gray-500">{doctor.specialty}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Informații medic
          </h2>
          <DoctorEditForm doctor={doctor} />
        </div>

        {/* Google Calendar Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Google Calendar
          </h2>

          {doctor.googleCalendarConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                  <Image
                    src="/assets/icons/check.svg"
                    alt="Connected"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <p className="font-medium text-green-800">Calendar conectat</p>
                  <p className="text-sm text-green-600">
                    Programările vor fi sincronizate automat
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Toate programările noi pentru Dr. {doctor.name} vor fi adăugate
                automat în Google Calendar.
              </p>

              <DisconnectCalendarButton doctorId={doctor.$id} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                  <Image
                    src="/assets/icons/calendar.svg"
                    alt="Calendar"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Calendar neconectat</p>
                  <p className="text-sm text-gray-500">
                    Conectați pentru sincronizare automată
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Conectați Google Calendar pentru ca programările să fie adăugate
                automat în calendarul medicului.
              </p>

              <Link href={googleAuthUrl}>
                <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  <Image
                    src="/assets/icons/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Conectează Google Calendar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
