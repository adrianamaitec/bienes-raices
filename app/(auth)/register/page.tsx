"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { supabaseBrowser } from "@/lib/supabase/client";

// Esquema de validación con Zod
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúñÑüÜ\s]+$/, "Solo letras y espacios")
      .transform((val) => val.trim().replace(/[<>]/g, "")),

    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúñÑüÜ\s]+$/, "Solo letras y espacios")
      .transform((val) => val.trim().replace(/[<>]/g, "")),

    email: z
      .string()
      .email("Correo electrónico inválido")
      .max(50, "El email no puede exceder 50 caracteres")
      .transform((val) => val.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(15, "La contraseña no puede exceder 15 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Debe contener al menos un carácter especial",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Tipo inferido del esquema
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const supabase = supabaseBrowser();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  // Validar un campo específico
  const validateField = (name: string, value: string): string => {
    try {
      // Crear un esquema parcial para el campo específico
      const fieldSchema = registerSchema.pick({ [name]: true } as any);
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
      registerSchema.parse(formData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo real
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));

    // Calcular fortaleza de contraseña
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
      // Re-validar confirmPassword si ya tiene valor
      if (formData.confirmPassword) {
        const confirmError = validateField(
          "confirmPassword",
          formData.confirmPassword,
        );
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    }

    // Validar confirmPassword cuando cambia password
    if (name === "confirmPassword" && formData.password) {
      const confirmError = validateField("confirmPassword", value);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
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

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );
    setTouched(allTouched);

    // Validar todo el formulario
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setGeneralError("Por favor, corrige los errores antes de continuar");
      return;
    }

    setLoading(true);

    try {
      // Los datos ya están validados por Zod
      const validatedData = registerSchema.parse(formData);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("No se pudo obtener el ID del usuario.");

      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: "client",
      });

      if (insertError) throw insertError;

      alert("🎉 ¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
      router.push("/login");
    } catch (err: any) {
      console.error("💥 Error en registro:", err);
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((e) => {
          const path = e.path[0] as string;
          newErrors[path] = e.message;
        });
        setErrors(newErrors);
      } else if (err.message?.includes("User already registered")) {
        setGeneralError("Este correo electrónico ya está registrado");
      } else {
        setGeneralError(err.message || "Error al crear la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];
    return colors[passwordStrength - 1] || "bg-gray-300";
  };

  const getStrengthText = () => {
    const texts = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"];
    return texts[passwordStrength - 1] || "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Crear Cuenta de Cliente
        </h2>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">
            ⚠️ {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                name="firstName"
                placeholder="Nombre"
                required
                maxLength={50}
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border p-2 rounded ${touched.firstName && errors.firstName ? "border-red-500" : "border-gray-300"}`}
              />
              {touched.firstName && errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                name="lastName"
                placeholder="Apellido"
                required
                maxLength={50}
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border p-2 rounded ${touched.lastName && errors.lastName ? "border-red-500" : "border-gray-300"}`}
              />
              {touched.lastName && errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              maxLength={100}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-2 rounded ${touched.email && errors.email ? "border-red-500" : "border-gray-300"}`}
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
              required
              maxLength={72}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-2 rounded ${touched.password && errors.password ? "border-red-500" : "border-gray-300"}`}
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full transition-all ${
                        level <= passwordStrength
                          ? getStrengthColor()
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <p className="text-xs mt-1 text-gray-600">
                    Fortaleza:{" "}
                    <span className="font-medium">{getStrengthText()}</span>
                  </p>
                )}
              </div>
            )}
            {touched.password && errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              required
              maxLength={72}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-2 rounded ${touched.confirmPassword && errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
