import Link from "next/link";
import { redirect } from "next/navigation";

import { verifyMagicLink } from "@/lib/actions/auth.actions";

interface VerifyPageProps {
  searchParams: { token?: string };
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="size-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            Link invalid
          </h1>
          <p className="mb-6 text-gray-600">
            Link-ul de autentificare nu este valid sau a expirat.
          </p>
          <Link
            href="/portal"
            className="inline-block rounded-md bg-gold-500 px-6 py-2 font-medium text-white hover:bg-gold-600"
          >
            Încercați din nou
          </Link>
        </div>
      </div>
    );
  }

  const result = await verifyMagicLink(token);

  if (!result.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="size-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-gray-900">
            {result.error || "Eroare de verificare"}
          </h1>
          <p className="mb-6 text-gray-600">
            Link-ul de autentificare nu este valid sau a expirat.
          </p>
          <Link
            href="/portal"
            className="inline-block rounded-md bg-gold-500 px-6 py-2 font-medium text-white hover:bg-gold-600"
          >
            Încercați din nou
          </Link>
        </div>
      </div>
    );
  }

  // Success - redirect to dashboard
  redirect("/portal/dashboard");
}
