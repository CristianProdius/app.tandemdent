import { Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PasskeyModal } from "@/components/PasskeyModal";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const Home = ({ searchParams }: SearchParamProps) => {
  const isAdmin = searchParams?.admin === "true";

  return (
    <div className="flex h-screen max-h-screen">
      {isAdmin && <PasskeyModal />}

      {/* Hero Image */}
      <Image
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="Tandem Dent"
        className="side-img max-w-[50%]"
      />

      {/* Content Section */}
      <section className="remove-scrollbar container my-auto premium-bg">
        <div className="sub-container max-w-[496px]">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Bine ați venit la{" "}
              <span className="gold-text-gradient">Tandem Dent</span>
            </h1>
            <p className="text-lg text-gray-600">
              Clinica stomatologică de încredere pentru întreaga familie.
            </p>
          </div>

          {/* Contact Card */}
          <div className="space-y-6">
            <GlassCard variant="default" padding="lg">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Programați o consultație
              </h2>
              <p className="mb-6 text-gray-600">
                Pentru a programa o consultație, vă rugăm să ne contactați
                telefonic. Echipa noastră vă va ajuta să găsiți cel mai potrivit
                moment pentru vizita dumneavoastră.
              </p>

              <div className="space-y-4">
                {/* Phone Link */}
                <a
                  href="tel:+37322123456"
                  className="flex items-center gap-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-glass-sm"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gold-100/80 backdrop-blur-sm">
                    <Phone className="size-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sunați-ne</p>
                    <p className="text-gold-600 font-semibold">+373 22 123 456</p>
                  </div>
                </a>

                {/* Email Link */}
                <a
                  href="mailto:contact@tandemdent.md"
                  className="flex items-center gap-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-4 transition-all duration-300 hover:bg-white/80 hover:shadow-glass-sm"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gold-100/80 backdrop-blur-sm">
                    <Mail className="size-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Scrieți-ne</p>
                    <p className="text-gold-600 font-semibold">contact@tandemdent.md</p>
                  </div>
                </a>
              </div>
            </GlassCard>

            {/* Patient Portal Card */}
            <GlassCard variant="subtle" padding="default">
              <div className="flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold-100/50 backdrop-blur-sm">
                  <User className="size-5 text-gold-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    Aveți deja o programare?
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Accesați portalul pacientului pentru a vedea programările
                    dumneavoastră.
                  </p>
                  <Link href="/portal">
                    <Button variant="outline" className="w-full shad-gray-btn">
                      Accesează portalul pacientului
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Footer */}
          <div className="text-14-regular mt-12 flex justify-between">
            <p className="text-gray-500">© 2024 Tandem Dent</p>
            <Link href="/?admin=true" className="text-gold-500 hover:text-gold-600 transition-colors">
              Administrare
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
