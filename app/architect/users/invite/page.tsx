// app/architect/users/invite/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function InviteArchitectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<{
        inviteLink: string;
        userId: string;
        emailSent: boolean;
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInviteData(null);
        setLoading(true);

        try {
            console.log('🔄 Enviando datos:', formData);

            const res = await fetch('/api/invite-architect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            console.log('📨 Respuesta del servidor:', data);

            if (!res.ok) {
                throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
            }

            setInviteData(data);

        } catch (err: any) {
            console.error('❌ Error en el cliente:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        if (inviteData?.inviteLink) {
            try {
                await navigator.clipboard.writeText(inviteData.inviteLink);
                alert('✅ Link de invitación copiado al portapapeles');
            } catch (err) {
                alert('❌ Error al copiar el link');
            }
        }
    };

    const handleTestLink = () => {
        if (inviteData?.inviteLink) {
            window.open(inviteData.inviteLink, '_blank');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Invitar Arquitecto</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-4">
                        <div className="flex items-center">
                            <span className="text-lg mr-2">⚠️</span>
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {!inviteData ? (
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Nombre"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Apellido"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico *
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generando invitación...
                                </div>
                            ) : (
                                'Generar Invitación'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg">
                        <div className="text-center mb-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="font-semibold text-lg">¡Invitación Generada!</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white border border-green-300 rounded-lg p-4">
                                <h4 className="font-medium text-green-700 mb-2">📧 Información del Usuario</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Email:</div>
                                    <div className="font-medium">{formData.email}</div>
                                    <div>Nombre:</div>
                                    <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                                    <div>User ID:</div>
                                    <div className="font-mono text-xs">{inviteData.userId}</div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-medium text-yellow-700 mb-2">⚠️ Importante</h4>
                                <p className="text-sm text-yellow-700">
                                    El email <strong>no se envió automáticamente</strong>. Debes copiar y enviar manualmente el siguiente link al arquitecto:
                                </p>
                            </div>

                            <div className="bg-white border border-green-300 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-green-700">🔗 Link de Invitación:</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleTestLink}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Probar Link
                                        </button>
                                        <button
                                            onClick={handleCopyLink}
                                            className="text-green-600 hover:text-green-800 text-sm"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-xs break-all font-mono">
                                    {inviteData.inviteLink}
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-green-700">
                                    ⏰ El link expira en 24 horas
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={handleCopyLink}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                                    >
                                        📋 Copiar Link
                                    </button>
                                    <button
                                        onClick={() => router.push('/architect/users')}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                                    >
                                        ← Volver a Usuarios
                                    </button>
                                    <button
                                        onClick={() => setInviteData(null)}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                                    >
                                        ➕ Nueva Invitación
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}