'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            // 1️⃣ Crear usuario en Auth (Supabase Authentication)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            const userId = authData.user?.id;
            if (!userId) throw new Error('No se pudo obtener el ID del usuario.');

            // 2️⃣ Crear perfil en la tabla pública "users"
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    role: 'client', // 👈 Forzamos que el rol sea siempre CLIENTE
                });

            if (insertError) throw insertError;

            alert('🎉 ¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            router.push('/login');

        } catch (err: any) {
            console.error('💥 Error en registro:', err);
            setError(err.message || 'Error al crear la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta de Cliente</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="firstName"
                            placeholder="Nombre"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                        <input
                            name="lastName"
                            placeholder="Apellido"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="border p-2 rounded"
                        />
                    </div>

                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar contraseña"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="text-center text-sm mt-4">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
