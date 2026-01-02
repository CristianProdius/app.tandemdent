import { Building2, Calendar, Bell, Shield } from "lucide-react";

import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";

const SettingsPage = () => {
  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Setări</h1>
        <p className="text-gray-500">
          Configurați setările clinicii
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Clinic Info */}
        <GlassCard variant="default" padding="lg" className="hover:shadow-glass-lg transition-shadow">
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold-100/80">
                <Building2 className="size-5 text-gold-600" />
              </div>
              <div>
                <GlassCardTitle className="text-lg">Informații clinică</GlassCardTitle>
                <GlassCardDescription>
                  Nume, adresă, contact
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nume:</span>
                <span className="font-medium text-gray-900">Tandem Dent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Telefon:</span>
                <span className="font-medium text-gray-900">+40 XXX XXX XXX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900">contact@tandemdent.ro</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">
                Editarea informațiilor clinicii va fi disponibilă în curând.
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Working Hours */}
        <GlassCard variant="default" padding="lg" className="hover:shadow-glass-lg transition-shadow">
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100/80">
                <Calendar className="size-5 text-blue-600" />
              </div>
              <div>
                <GlassCardTitle className="text-lg">Program de lucru</GlassCardTitle>
                <GlassCardDescription>
                  Ore de funcționare
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Luni - Vineri:</span>
                <span className="font-medium text-gray-900">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sâmbătă:</span>
                <span className="font-medium text-gray-900">09:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duminică:</span>
                <span className="font-medium text-gray-400">Închis</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">
                Editarea programului va fi disponibilă în curând.
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Notifications */}
        <GlassCard variant="default" padding="lg" className="hover:shadow-glass-lg transition-shadow">
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-100/80">
                <Bell className="size-5 text-teal-600" />
              </div>
              <div>
                <GlassCardTitle className="text-lg">Notificări</GlassCardTitle>
                <GlassCardDescription>
                  Email și SMS
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email confirmare:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
                  Activ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email reminder:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
                  Activ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">SMS notificări:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                  Inactiv
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">
                Configurarea notificărilor va fi disponibilă în curând.
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Security */}
        <GlassCard variant="default" padding="lg" className="hover:shadow-glass-lg transition-shadow">
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100/80">
                <Shield className="size-5 text-purple-600" />
              </div>
              <div>
                <GlassCardTitle className="text-lg">Securitate</GlassCardTitle>
                <GlassCardDescription>
                  Acces și permisiuni
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cod acces admin:</span>
                <span className="font-medium text-gray-900">••••••</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Autentificare pacienți:</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-700">
                  Magic Link
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">
                Setările de securitate vor fi disponibile în curând.
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Info Banner */}
      <GlassCard variant="gold" padding="default">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gold-200/80">
            <Building2 className="size-6 text-gold-700" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Funcționalități în dezvoltare</h3>
            <p className="text-sm text-gray-600">
              Pagina de setări va include în curând opțiuni complete pentru configurarea clinicii,
              programului de lucru, notificărilor și securității.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
