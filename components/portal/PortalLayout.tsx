"use client";

import { LogOut, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logoutPatient } from "@/lib/actions/auth.actions";

interface PortalLayoutProps {
  children: React.ReactNode;
  patientName?: string;
}

export function PortalLayout({ children, patientName }: PortalLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutPatient();
    router.push("/portal");
    router.refresh();
  };

  return (
    <div className="min-h-screen premium-bg">
      {/* Glass Header */}
      <header className="sticky top-0 z-20 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8">
          <Link href="/portal/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold gold-text-gradient">Tandem Dent</span>
            <span className="text-sm text-gray-500">| Portal Pacient</span>
          </Link>

          {patientName && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bună, <span className="font-medium text-gray-900">{patientName}</span>
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="shad-gray-btn gap-1"
              >
                <LogOut className="size-3.5" />
                Deconectare
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Glass Footer */}
      <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-2">
            <Phone className="size-4" />
            Aveți întrebări? Contactați-ne la{" "}
            <a href="tel:+37322123456" className="font-medium text-gold-600 hover:text-gold-700 transition-colors">
              +373 22 123 456
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
