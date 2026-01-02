"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

const patientFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().min(10, "Număr de telefon invalid"),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const NewPatientPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: PatientFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const patient = await createPatientAdmin(values);
      if (patient) {
        router.push(`/admin/patients/${patient.$id}`);
      }
    } catch (err: any) {
      setError(err.message || "A apărut o eroare la crearea pacientului");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Adaugă pacient nou</h1>
        <p className="text-gray-500">
          Introduceți informațiile pacientului
        </p>
      </div>

      <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nume complet</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Maria Popescu"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresă de email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="pacient@email.com"
                      className="shad-input"
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
                  <FormLabel>Număr de telefon</FormLabel>
                  <FormControl>
                    <PhoneInput
                      defaultCountry="MD"
                      international
                      placeholder="+373 xxx xxx xxx"
                      value={field.value}
                      onChange={field.onChange}
                      className="input-phone shad-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Anulează
              </Button>
              <Button
                type="submit"
                className="shad-primary-btn"
                disabled={isLoading}
              >
                {isLoading ? "Se salvează..." : "Salvează pacientul"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewPatientPage;
