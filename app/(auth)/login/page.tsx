"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/client";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico inválido")
    .max(50, "El email no puede exceder 50 caracteres")
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(15, "La contraseña no puede exceder 15 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validar un campo específico
  const validateField = (name: string, value: string): string => {
    try {
      const fieldSchema = loginSchema.pick({ [name]: true } as any);
      fieldSchema.parse({ [name]: value });
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || "";
      }
      return "";
    }
  };

  // Validar todo el formulario
  const validateForm = (): Record<string, string> => {
    try {
      loginSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        return newErrors;
      }
      return {};
    }
  };

  const checkRateLimit = (email: string): boolean => {
    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (!attempts) return true;

    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(email);
      return true;
    }

    if (attempts.count >= 5) return false;

    return true;
  };

  const recordFailedAttempt = (email: string) => {
    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (!attempts) {
      loginAttempts.set(email, { count: 1, lastAttempt: now });
    } else {
      attempts.count++;
      attempts.lastAttempt = now;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldError = validateField(
      name,
      formData[name as keyof typeof formData],
    );
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    setTouched({ email: true, password: true });

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setGeneralError("Por favor, corrige los errores antes de continuar");
      return;
    }

    if (!checkRateLimit(formData.email)) {
      setGeneralError(
        "Demasiados intentos fallidos. Espera 15 minutos antes de intentar nuevamente.",
      );
      return;
    }

    setLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);
      const supabase = supabaseBrowser();

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password,
        });

      if (signInError) {
        recordFailedAttempt(validatedData.email);
        throw signInError;
      }

      if (!signInData.user) throw new Error("No se encontró el usuario.");

      const userId = signInData.user.id;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, is_active")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      if (userData && !userData.is_active) {
        await supabase.auth.signOut();
        setGeneralError(
          "Tu cuenta ha sido desactivada. Contacta al administrador.",
        );
        setLoading(false);
        return;
      }

      loginAttempts.delete(validatedData.email);

      const role = userData?.role || "client";
      if (role === "architect") router.push("/architect/dashboard");
      else router.push("/client/dashboard");
    } catch (err: any) {
      console.error("💥 Error en login:", err);
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          const path = e.path[0] as string;
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
      } else if (err.message?.includes("Invalid login credentials")) {
        setGeneralError("Correo o contraseña incorrectos.");
      } else if (err.message?.includes("Email not confirmed")) {
        setGeneralError(
          "Por favor, confirma tu correo electrónico antes de iniciar sesión.",
        );
      } else {
        setGeneralError("Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar sesión</h2>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded mb-3">
            ⚠️ {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              maxLength={100}
              className={`w-full border rounded p-2 ${touched.email && errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              maxLength={72}
              className={`w-full border rounded p-2 ${touched.password && errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <p className="text-center text-sm mt-3">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
