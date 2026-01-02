import { CalendarPlus } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

const AdminPage = async () => {
  const appointments = await getRecentAppointmentList();

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panou principal</h1>
          <p className="text-gray-500">
            Gestionați programările din această zi
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
          count={appointments.scheduledCount}
          label="Programări confirmate"
          icon={"/assets/icons/appointments.svg"}
        />
        <StatCard
          type="pending"
          count={appointments.pendingCount}
          label="Programări în așteptare"
          icon={"/assets/icons/pending.svg"}
        />
        <StatCard
          type="cancelled"
          count={appointments.cancelledCount}
          label="Programări anulate"
          icon={"/assets/icons/cancelled.svg"}
        />
      </section>

      {/* Recent Appointments */}
      <GlassCard variant="default" padding="lg">
        <GlassCardHeader className="pb-4">
          <GlassCardTitle>Programări recente</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <DataTable columns={columns} data={appointments.documents} />
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};

export default AdminPage;
