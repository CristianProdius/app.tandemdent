import { CalendarPlus } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

const AppointmentsPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programări</h1>
          <p className="text-gray-500">
            Vizualizați și gestionați toate programările
          </p>
        </div>
        <Link href="/admin/appointments/new">
          <Button className="shad-primary-btn gap-2">
            <CalendarPlus className="size-4" />
            Programare nouă
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          type="appointments"
          count={appointments?.scheduledCount || 0}
          label="Programări confirmate"
          icon={"/assets/icons/appointments.svg"}
        />
        <StatCard
          type="pending"
          count={appointments?.pendingCount || 0}
          label="Programări în așteptare"
          icon={"/assets/icons/pending.svg"}
        />
        <StatCard
          type="cancelled"
          count={appointments?.cancelledCount || 0}
          label="Programări anulate"
          icon={"/assets/icons/cancelled.svg"}
        />
      </section>

      {/* Appointments Table */}
      <GlassCard variant="default" padding="lg">
        <GlassCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <GlassCardTitle>Toate programările</GlassCardTitle>
            <p className="text-sm text-gray-500">
              Total: {appointments?.totalCount || 0} programări
            </p>
          </div>
        </GlassCardHeader>
        <GlassCardContent>
          {appointments?.documents ? (
            <DataTable columns={columns} data={appointments.documents} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gold-100/50 backdrop-blur-sm">
                <CalendarPlus className="size-8 text-gold-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Nu există programări
              </h3>
              <p className="mb-4 text-gray-500">
                Creați prima programare pentru a începe
              </p>
              <Link href="/admin/appointments/new">
                <Button className="shad-primary-btn gap-2">
                  <CalendarPlus className="size-4" />
                  Programare nouă
                </Button>
              </Link>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};

export default AppointmentsPage;
