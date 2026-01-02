import { Calendar, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { cn } from "@/lib/utils";

const DoctorsPage = async () => {
  const doctors = await getDoctors();

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medici</h1>
          <p className="text-gray-500">
            Gestionați medicii și integrarea cu Google Calendar
          </p>
        </div>
        <Link href="/admin/doctors/new">
          <Button className="shad-primary-btn gap-2">
            <UserPlus className="size-4" />
            Adaugă medic
          </Button>
        </Link>
      </div>

      {/* Doctors Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.length === 0 ? (
          <GlassCard variant="default" padding="lg" className="col-span-full text-center">
            <p className="text-gray-500">Nu există medici înregistrați.</p>
            <Link href="/admin/doctors/new">
              <Button className="shad-primary-btn mt-4 gap-2">
                <UserPlus className="size-4" />
                Adaugă primul medic
              </Button>
            </Link>
          </GlassCard>
        ) : (
          doctors.map((doctor) => (
            <Link
              key={doctor.$id}
              href={`/admin/doctors/${doctor.$id}`}
              className="group"
            >
              <GlassCard variant="default" padding="default" className="h-full glass-hover">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative size-16 overflow-hidden rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 shadow-sm">
                    {doctor.image ? (
                      <Image
                        src={doctor.image}
                        alt={doctor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-2xl font-semibold text-gold-600">
                        {doctor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gold-600 transition-colors truncate">
                      Dr. {doctor.name}
                    </h3>
                    {doctor.specialty && (
                      <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-400 truncate">{doctor.email}</p>
                  </div>
                </div>

                {/* Calendar Status */}
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm",
                      doctor.googleCalendarConnected
                        ? "bg-teal-500/20 text-teal-700"
                        : "bg-gray-500/10 text-gray-500"
                    )}
                  >
                    <Calendar className="size-3" />
                    {doctor.googleCalendarConnected
                      ? "Calendar conectat"
                      : "Calendar neconectat"}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
