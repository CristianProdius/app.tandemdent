"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createPatientAdmin } from "@/lib/actions/patient.actions";
import { Patient } from "@/types/appwrite.types";

const quickPatientSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().min(10, "Număr de telefon invalid"),
});

type QuickPatientValues = z.infer<typeof quickPatientSchema>;

interface PatientQuickCreateProps {
  onSuccess: (patient: Patient) => void;
  onCancel: () => void;
  initialName?: string;
}

export const PatientQuickCreate = ({
  onSuccess,
  onCancel,
  initialName = "",
}: PatientQuickCreateProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<QuickPatientValues>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      name: initialName,
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: QuickPatientValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const patient = await createPatientAdmin(values);
      if (patient) {
        onSuccess(patient);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "A apărut o eroare la crearea pacientului";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Pacient nou</h3>
        <p className="text-sm text-gray-500">
          Completați datele pentru a înregistra pacientul
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nume complet *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: Maria Popescu"
                    className="shad-input bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="pacient@email.com"
                      className="shad-input bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="MD"
                      international
                      placeholder="+373 xxx xxx xxx"
                      value={field.value}
                      onChange={field.onChange}
                      className="input-phone shad-input bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              size="sm"
              className="shad-primary-btn"
              disabled={isLoading}
            >
              {isLoading ? "Se salvează..." : "Înregistrează și selectează"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
