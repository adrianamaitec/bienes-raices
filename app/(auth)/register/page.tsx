// app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // Asegúrate de que esta ruta sea correcta

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'client' as 'client' | 'architect'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // app/auth/register/page.tsx (solo la función handleSubmit actualizada)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validaciones...
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            console.log('Iniciando registro...');

            // 1. Registrar usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                setError(`Error de autenticación: ${authError.message}`);
                return;
            }

            if (authData.user) {
                console.log('Usuario auth creado, ID:', authData.user.id);

                // 2. Usar UPSERT para crear o actualizar el perfil
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .upsert({
                        id: authData.user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        role: formData.userType,
                        created_at: new Date().toISOString()
                    }, {
                        onConflict: 'email',
                        ignoreDuplicates: false
                    })
                    .select();

                if (userError) {
                    setError(`Error al crear perfil: ${userError.message}`);
                    return;
                }

                console.log('Perfil creado/actualizado:', userData);

                // 3. Iniciar sesión automáticamente
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (signInError) {
                    setError(`Error al iniciar sesión: ${signInError.message}`);
                    return;
                }

                console.log('Sesión iniciada:', signInData);

                // 4. ESPERAR un momento para que la sesión se establezca
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 5. Verificar que la sesión esté activa
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Sesión actual:', session);

                if (session) {
                    console.log('Registro completado exitosamente, redirigiendo...');

                    // 6. Forzar refresh del middleware y luego redirigir
                    router.refresh(); // Esto es IMPORTANTE para que el middleware detecte la sesión

                    // Pequeño delay antes de redirigir
                    setTimeout(() => {
                        if (formData.userType === 'architect') {
                            router.push('/architect/dashboard');
                        } else {
                            router.push('/client/dashboard');
                        }
                    }, 500);
                } else {
                    setError('Error: No se pudo establecer la sesión. Intenta iniciar sesión manualmente.');
                }
            }
        } catch (error: any) {
            console.error('Error completo:', error);
            setError('Error inesperado al crear la cuenta. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="text-sm text-red-700 mt-1">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* User Type Selection */}
                        <div>
                            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Usuario
                            </label>
                            <select
                                id="userType"
                                name="userType"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.userType}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="client">Cliente</option>
                                <option value="architect">Arquitecto</option>
                            </select>
                        </div>

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="firstName" className="sr-only">Nombre</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Nombre"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">Apellido</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Apellido"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Contraseña (mín. 6 caracteres)"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Confirmar Contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={loading}
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                            Acepto los{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                términos y condiciones
                            </Link>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando cuenta...
                                </div>
                            ) : (
                                'Crear Cuenta'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}