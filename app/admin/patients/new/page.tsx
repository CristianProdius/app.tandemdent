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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPatientAdmin } from "@/lib/actions/patient.actions";

// Gender options - values in English, labels in Romanian
const GENDER_OPTIONS = [
  { value: "male", label: "Masculin" },
  { value: "female", label: "Feminin" },
  { value: "other", label: "Altul" },
] as const;

// Month options in Romanian
const MONTHS = [
  { value: "01", label: "Ianuarie" },
  { value: "02", label: "Februarie" },
  { value: "03", label: "Martie" },
  { value: "04", label: "Aprilie" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Iunie" },
  { value: "07", label: "Iulie" },
  { value: "08", label: "August" },
  { value: "09", label: "Septembrie" },
  { value: "10", label: "Octombrie" },
  { value: "11", label: "Noiembrie" },
  { value: "12", label: "Decembrie" },
] as const;

// Generate days 1-31
const DAYS = Array.from({ length: 31 }, (_, i) => {
  const day = (i + 1).toString().padStart(2, "0");
  return { value: day, label: (i + 1).toString() };
});

// Generate years from current year going back 120 years
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => {
  const year = (currentYear - i).toString();
  return { value: year, label: year };
});

const patientFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().min(10, "Număr de telefon invalid"),
  gender: z.enum(["male", "female", "other"]),
  birthDay: z.string().optional(),
  birthMonth: z.string().optional(),
  birthYear: z.string().optional(),
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
      gender: "male",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
    },
  });

  const onSubmit = async (values: PatientFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Construct birthDate from day, month, year
      let birthDate: Date | undefined;
      if (values.birthYear && values.birthMonth && values.birthDay) {
        birthDate = new Date(
          parseInt(values.birthYear),
          parseInt(values.birthMonth) - 1,
          parseInt(values.birthDay)
        );
      }

      const patient = await createPatientAdmin({
        name: values.name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        birthDate,
      });
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

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gen</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="shad-input">
                        <SelectValue placeholder="Selectează genul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Apple-style date picker with 3 dropdowns */}
            <div className="space-y-2">
              <FormLabel>Data nașterii</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="birthDay"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="shad-input">
                            <SelectValue placeholder="Zi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[280px]">
                          {DAYS.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="shad-input">
                            <SelectValue placeholder="Lună" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[280px]">
                          {MONTHS.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="shad-input">
                            <SelectValue placeholder="An" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[280px]">
                          {YEARS.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
