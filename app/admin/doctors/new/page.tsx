"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { createDoctor } from "@/lib/actions/doctor.actions";

const doctorFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().optional(),
  specialty: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

const NewDoctorPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialty: "",
    },
  });

  const onSubmit = async (values: DoctorFormValues) => {
    setIsLoading(true);
    try {
      const doctor = await createDoctor(values);
      if (doctor) {
        router.push("/admin/doctors");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Adaugă medic nou</h1>
        <p className="text-gray-500">
          Introduceți informațiile medicului
        </p>
      </div>

      <div className="max-w-xl rounded-lg border border-gray-200 bg-white p-6">
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
                      placeholder="ex: Ion Popescu"
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
                      placeholder="doctor@tandemdent.com"
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
                  <FormLabel>Telefon (opțional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+373 xxx xxx xxx"
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
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializare (opțional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Ortodonție, Implantologie"
                      className="shad-input"
                      {...field}
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
                {isLoading ? "Se salvează..." : "Salvează medicul"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewDoctorPage;
