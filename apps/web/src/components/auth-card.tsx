import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  name: z.string(),
  email: z.email("Adresa de email nu este validă"),
  password: z.string().min(8, "Parola trebuie să aibă cel puțin 8 caractere"),
});
const signUpSchema = signInSchema.extend({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere"),
});

export function AuthCard({
  onSuccess,
  intro,
}: {
  onSuccess?: () => void;
  intro?: string;
}) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const isSignUp = mode === "signUp";

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      const handlers = {
        onSuccess: () => {
          toast.success(isSignUp ? "Cont creat. Bine ai venit pe Ofry!" : "Te-ai autentificat");
          onSuccess?.();
        },
        onError: (error: { error: { message?: string; statusText: string } }) => {
          toast.error(error.error.message || error.error.statusText);
        },
      };
      if (isSignUp) {
        await authClient.signUp.email(
          { name: value.name.trim(), email: value.email, password: value.password },
          handlers,
        );
      } else {
        await authClient.signIn.email({ email: value.email, password: value.password }, handlers);
      }
    },
    validators: { onSubmit: isSignUp ? signUpSchema : signInSchema },
  });

  const fields = [
    ...(isSignUp ? [{ name: "name" as const, label: "Nume", type: "text", autoComplete: "name" }] : []),
    { name: "email" as const, label: "Email", type: "email", autoComplete: "email" },
    {
      name: "password" as const,
      label: "Parolă",
      type: "password",
      autoComplete: isSignUp ? "new-password" : "current-password",
    },
  ];

  return (
    <div className="panel mx-auto mt-10 w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{isSignUp ? "Creează cont" : "Intră în cont"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {intro ?? "Publică anunțuri, salvează favorite și vorbește cu vânzătorii."}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="mt-6 space-y-4"
      >
        {fields.map((f) => (
          <form.Field key={f.name} name={f.name}>
            {(field) => (
              <div>
                <label htmlFor={field.name} className="label">
                  {f.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  className="field"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error, i) => (
                  <p key={i} className="mt-1 text-xs text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        ))}

        <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <button type="submit" className="btn btn-primary w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Se trimite..." : isSignUp ? "Creează cont" : "Intră în cont"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? "Ai deja cont?" : "Nu ai cont?"}{" "}
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => {
            form.reset();
            setMode(isSignUp ? "signIn" : "signUp");
          }}
        >
          {isSignUp ? "Intră în cont" : "Creează unul gratuit"}
        </button>
      </p>
    </div>
  );
}
