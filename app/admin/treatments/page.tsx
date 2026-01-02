import { Check, Clock, Loader2 } from "lucide-react";

import { TreatmentCard } from "@/components/admin/TreatmentCard";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { getTreatments, getTreatmentStats } from "@/lib/actions/treatment.actions";

const TreatmentsPage = async () => {
  const [stats, { documents: treatments }] = await Promise.all([
    getTreatmentStats(),
    getTreatments({ limit: 50 }),
  ]);

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tratamente</h1>
        <p className="text-gray-500">
          Vizualizați toate tratamentele din clinică
        </p>
      </div>

      {/* Stats Grid */}
      <section className="grid gap-4 md:grid-cols-4">
        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gold-100/80">
              <Clock className="size-6 text-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingCount}
              </p>
              <p className="text-sm text-gray-500">În așteptare</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100/80">
              <Loader2 className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgressCount}
              </p>
              <p className="text-sm text-gray-500">În desfășurare</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-100/80">
              <Check className="size-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.doneCount}
              </p>
              <p className="text-sm text-gray-500">Finalizate</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="gold" padding="default">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gold-200/80">
              <span className="text-xl font-bold text-gold-700">Σ</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCount}
              </p>
              <p className="text-sm text-gray-500">Total tratamente</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Treatments List */}
      <GlassCard variant="default" padding="lg">
        <GlassCardHeader className="pb-4">
          <GlassCardTitle>Toate tratamentele</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          {treatments.length > 0 ? (
            <div className="space-y-4">
              {treatments.map((treatment) => (
                <TreatmentCard
                  key={treatment.$id}
                  treatment={treatment}
                  showTooth
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gold-100/50 backdrop-blur-sm">
                <Clock className="size-8 text-gold-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Nu există tratamente
              </h3>
              <p className="text-gray-500">
                Tratamentele vor apărea aici după ce sunt adăugate din fișa pacientului.
              </p>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};

export default TreatmentsPage;
