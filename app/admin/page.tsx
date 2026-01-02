import { CalendarPlus } from "lucide-react";
import Link from "next/link";

import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";
import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { getDoctors } from "@/lib/actions/doctor.actions";

const AdminPage = async () => {
  const [appointments, doctors] = await Promise.all([
    getRecentAppointmentList(),
    getDoctors(),
  ]);

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panou principal</h1>
          <p className="text-gray-500">
            Gestionați programările clinicii
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

      {/* Appointments View with Tabs */}
      <GlassCard variant="default" padding="lg">
        <Tabs defaultValue="calendar" className="w-full">
          <GlassCardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <GlassCardTitle>Programări</GlassCardTitle>
              <TabsList className="bg-white/50">
                <TabsTrigger value="calendar" className="data-[state=active]:bg-gold-100 data-[state=active]:text-gold-700">
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-gold-100 data-[state=active]:text-gold-700">
                  Listă
                </TabsTrigger>
              </TabsList>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <TabsContent value="calendar" className="mt-0">
              <div className="min-h-[500px]">
                <AppointmentCalendar initialDoctors={doctors} />
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <DataTable columns={columns} data={appointments.documents} />
            </TabsContent>
          </GlassCardContent>
        </Tabs>
      </GlassCard>
    </div>
  );
};

export default AdminPage;
