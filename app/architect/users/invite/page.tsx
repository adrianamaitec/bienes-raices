'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function InviteArchitectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 🚧 Verificar si el usuario actual tiene permiso (solo architect o admin)
    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !data || (data.role !== 'architect' && data.role !== 'admin')) {
                router.push('/unauthorized'); // opcional: página de error 403
            }
        };

        checkRole();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const { firstName, lastName, email } = formData;

            // 1️⃣ Crear el usuario en Supabase Auth
            // Generamos una contraseña temporal segura
            const tempPassword = Math.random().toString(36).slice(-10);

            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: tempPassword,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            });

            if (signUpError) throw signUpError;

            const userId = signUpData.user?.id;
            if (!userId) throw new Error('No se pudo crear el usuario en Supabase Auth.');

            // 2️⃣ Crear su perfil en la tabla "users"
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'architect',
                });

            if (insertError) throw insertError;

            // ✅ Éxito
            setSuccess(`Invitación enviada a ${email}`);
            setFormData({ firstName: '', lastName: '', email: '' });

        } catch (err: any) {
            console.error('💥 Error al invitar:', err);
            setError(err.message || 'Error al enviar la invitación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-center">Invitar Arquitecto</h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Ingresa los datos del arquitecto que deseas invitar.
                    Recibirá un correo electrónico para activar su cuenta.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-3">
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="firstName"
                        placeholder="Nombre"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />

                    <input
                        name="lastName"
                        placeholder="Apellido"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Enviando invitación...' : 'Invitar Arquitecto'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button
                        onClick={() => router.push('/architect/users')}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        ← Volver a lista de usuarios
                    </button>
                </div>
            </div>
        </div>
    );
}
