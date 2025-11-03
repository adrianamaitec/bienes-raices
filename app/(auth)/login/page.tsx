"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = supabaseBrowser();
      // 1️⃣ Login en Auth
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (signInError) throw signInError;
      if (!signInData.user) throw new Error("No se encontró el usuario.");

      const userId = signInData.user.id;

      // 2️⃣ Obtener rol desde public.users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userError) throw userError;
      const { data: profile } = await supabase
        .from("users")
        .select("is_active")
        .eq("id", userId)
        .single();
      if (profile && !profile.is_active) {
        await supabase.auth.signOut();
        alert("Tu cuenta ha sido desactivada. Contacta al administrador.");
        return;
      }
      // 3️⃣ Redirección según rol
      const role = userData?.role || "client";
      if (role === "architect") router.push("/architect/dashboard");
      else router.push("/client/dashboard");
    } catch (err: any) {
      console.error("💥 Error en login:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar sesión</h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-3">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border rounded p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border rounded p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>

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
