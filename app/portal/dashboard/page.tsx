import { redirect } from "next/navigation";

import { AppointmentList } from "@/components/portal/AppointmentList";
import { PortalLayout } from "@/components/portal/PortalLayout";
import {
  getPatientSession,
  getPatientAppointments,
} from "@/lib/actions/auth.actions";

export default async function DashboardPage() {
  const session = await getPatientSession();

  if (!session) {
    redirect("/portal");
  }

  const appointments = await getPatientAppointments(session.$id);

  return (
    <PortalLayout patientName={session.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Programările mele
          </h1>
          <p className="text-gray-600">
            Vizualizați toate programările dumneavoastră la Tandem Dent.
          </p>
        </div>

        <AppointmentList appointments={appointments as any} />

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Doriți să faceți o programare?
          </h2>
          <p className="mb-4 text-gray-600">
            Pentru a programa o vizită, vă rugăm să ne contactați telefonic.
            Echipa noastră vă va ajuta să găsiți o oră convenabilă.
          </p>
          <a
            href="tel:+37322123456"
            className="inline-flex items-center rounded-md bg-gold-500 px-4 py-2 font-medium text-white hover:bg-gold-600"
          >
            <svg
              className="mr-2 size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            +373 22 123 456
          </a>
        </div>
      </div>
    </PortalLayout>
  );
}
