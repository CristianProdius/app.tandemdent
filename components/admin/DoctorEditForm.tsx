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
import { updateDoctor, deleteDoctor } from "@/lib/actions/doctor.actions";
import { Doctor } from "@/types/appwrite.types";

const doctorFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
  email: z.string().email("Adresă de email invalidă"),
  phone: z.string().optional(),
  specialty: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorEditFormProps {
  doctor: Doctor;
}

export const DoctorEditForm = ({ doctor }: DoctorEditFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || "",
      specialty: doctor.specialty || "",
    },
  });

  const onSubmit = async (values: DoctorFormValues) => {
    setIsLoading(true);
    try {
      await updateDoctor(doctor.$id, values);
      router.refresh();
    } catch (error) {
      console.error("Error updating doctor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sigur doriți să ștergeți acest medic?")) return;

    setIsDeleting(true);
    try {
      await deleteDoctor(doctor.$id);
      router.push("/admin/doctors");
    } catch (error) {
      console.error("Error deleting doctor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume complet</FormLabel>
              <FormControl>
                <Input className="shad-input" {...field} />
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
                <Input type="email" className="shad-input" {...field} />
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
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input className="shad-input" {...field} />
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
              <FormLabel>Specializare</FormLabel>
              <FormControl>
                <Input className="shad-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Se șterge..." : "Șterge medicul"}
          </Button>
          <Button
            type="submit"
            className="shad-primary-btn"
            disabled={isLoading}
          >
            {isLoading ? "Se salvează..." : "Salvează modificările"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
