"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchPatients } from "@/lib/actions/patient.actions";
import { Patient } from "@/types/appwrite.types";

export const PatientSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [, startTransition] = useTransition();

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    startTransition(async () => {
      const patients = await searchPatients(value);
      setResults(patients);
      setShowResults(true);
      setIsSearching(false);
    });
  };

  const handleSelectPatient = (patientId: string) => {
    setShowResults(false);
    setQuery("");
    router.push(`/admin/patients/${patientId}`);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Căutați pacient după nume, email sau telefon..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="shad-input"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-4 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
            </div>
          )}
        </div>
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Niciun pacient găsit pentru &quot;{query}&quot;</p>
              <Link href="/admin/patients/new">
                <Button className="shad-primary-btn mt-2" size="sm">
                  + Adaugă pacient nou
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="max-h-80 overflow-auto py-2">
              {results.map((patient) => (
                <li key={patient.$id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPatient(patient.$id)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {patient.email} • {patient.phone}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
