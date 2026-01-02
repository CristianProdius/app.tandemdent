import { AppointmentCard } from "./AppointmentCard";

interface Appointment {
  $id: string;
  schedule: string;
  primaryPhysician: string;
  reason: string;
  status: "scheduled" | "pending" | "cancelled";
  note?: string;
  cancellationReason?: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="size-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">
          Nu aveți programări
        </h3>
        <p className="text-gray-500">
          Pentru a face o programare, sunați-ne la +373 22 123 456.
        </p>
      </div>
    );
  }

  // Separate upcoming and past appointments
  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.schedule) >= now && a.status !== "cancelled"
  );
  const past = appointments.filter(
    (a) => new Date(a.schedule) < now || a.status === "cancelled"
  );

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Programări viitoare
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((appointment) => (
              <AppointmentCard key={appointment.$id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Istoric programări
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((appointment) => (
              <AppointmentCard key={appointment.$id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
