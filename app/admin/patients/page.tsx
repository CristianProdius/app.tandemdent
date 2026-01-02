import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";

import { PatientSearch } from "@/components/admin/PatientSearch";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { getPatients } from "@/lib/actions/patient.actions";
import { formatDateTime } from "@/lib/utils";

interface PatientsPageProps {
  searchParams: { page?: string; q?: string };
}

const PatientsPage = async ({ searchParams }: PatientsPageProps) => {
  const page = parseInt(searchParams.page || "1");
  const { patients, total, totalPages, currentPage } = await getPatients(page);

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacienți</h1>
          <p className="text-gray-500">
            {total} pacienți înregistrați
          </p>
        </div>
        <Link href="/admin/patients/new">
          <Button className="shad-primary-btn gap-2">
            <UserPlus className="size-4" />
            Adaugă pacient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <PatientSearch />

      {/* Patients Table */}
      <GlassCard variant="default" padding="none">
        <div className="overflow-hidden rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nume
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Telefon
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Înregistrat
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nu există pacienți înregistrați.
                  </td>
                </tr>
              ) : (
                patients.map((patient: any) => (
                  <tr key={patient.$id} className="hover:bg-gold-50/30 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-gold-100/50 text-sm font-medium text-gold-700">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {patient.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {formatDateTime(patient.$createdAt).dateOnly}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/admin/patients/${patient.$id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
                      >
                        Detalii
                        <ChevronRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-white/50 px-6 py-3">
              <div className="text-sm text-gray-500">
                Pagina {currentPage} din {totalPages}
              </div>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link href={`/admin/patients?page=${currentPage - 1}`}>
                    <Button variant="outline" size="sm" className="shad-gray-btn gap-1">
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link href={`/admin/patients?page=${currentPage + 1}`}>
                    <Button variant="outline" size="sm" className="shad-gray-btn gap-1">
                      Următor
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default PatientsPage;
