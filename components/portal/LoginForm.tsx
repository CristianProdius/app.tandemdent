"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { sendPatientMagicLink } from "@/lib/actions/auth.actions";

const loginSchema = z.object({
  email: z.string().email("Introduceți o adresă de email validă"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await sendPatientMagicLink(data.email);
      setIsSuccess(true);
    } catch (err) {
      setError("A apărut o eroare. Încercați din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <GlassCard variant="gold" padding="lg" className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-teal-500/20 backdrop-blur-sm">
          <CheckCircle className="size-8 text-teal-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Verificați email-ul
        </h2>
        <p className="text-gray-600">
          V-am trimis un link de autentificare. Verificați căsuța de email și
          apăsați pe link pentru a accesa portalul.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Link-ul expiră în 15 minute.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Adresa de email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="exemplu@email.com"
              {...register("email")}
              className="w-full pl-10 shad-input"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 backdrop-blur-sm p-3 border border-red-200/50">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full shad-primary-btn"
        >
          {isLoading ? "Se trimite..." : "Trimite link de autentificare"}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Veți primi un email cu un link pentru a accesa portalul.
        </p>
      </form>
    </GlassCard>
  );
}
