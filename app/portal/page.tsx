import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/portal/LoginForm";
import { getPatientSession } from "@/lib/actions/auth.actions";

export default async function PortalLoginPage() {
  // Redirect if already logged in
  const session = await getPatientSession();
  if (session) {
    redirect("/portal/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center premium-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gold-text-gradient">Tandem Dent</h1>
          <p className="mt-2 text-gray-500">Portal Pacient</p>
        </div>

        {/* Login Card */}
        <div className="mb-6">
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-900">
            Autentificare
          </h2>
          <LoginForm />
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
