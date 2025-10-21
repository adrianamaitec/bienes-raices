'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface ArchitectProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_image_url: string;
    linkedin: string;
    bio: string;
    experience: string;
}

export default function ArchitectProfile() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [architectData, setArchitectData] = useState<ArchitectProfile>({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        profile_image_url: '',
        linkedin: '',
        bio: '',
        experience: '',
    });

    useEffect(() => {
        loadArchitectProfile();
    }, []);

    const loadArchitectProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) setArchitectData(data);
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    first_name: architectData.first_name,
                    last_name: architectData.last_name,
                    phone: architectData.phone,
                    linkedin: architectData.linkedin,
                    bio: architectData.bio,
                    experience: architectData.experience,
                    profile_image_url: architectData.profile_image_url,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', architectData.id);

            if (error) throw error;
            alert('Perfil actualizado correctamente ✅');
            setIsEditing(false);
        } catch (error: any) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Selecciona una imagen válida');
            return;
        }

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${architectData.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error } = await supabase.storage.from('images').upload(filePath, file);
        if (error) {
            alert('Error al subir imagen: ' + error.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

        setArchitectData(prev => ({ ...prev, profile_image_url: publicUrl }));
        setUploading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600 mt-1">Administra tu información como arquitecto</p>
            </div>

            {/* CARD */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center space-x-6 border-b border-gray-200 pb-6 mb-6">
                    <div className="relative">
                        {architectData.profile_image_url ? (
                            <img
                                src={architectData.profile_image_url}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white shadow">
                                👨‍💼
                            </div>
                        )}

                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full text-xs shadow-lg transition-colors"
                            >
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    '📷'
                                )}
                            </button>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {architectData.first_name} {architectData.last_name}
                        </h2>
                        <p className="text-gray-500">{architectData.email}</p>
                        <p className="text-sm text-gray-400">
                            {architectData.experience || 'Sin experiencia registrada'}
                        </p>
                    </div>
                </div>

                {/* FORMULARIO */}
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                value={architectData.first_name}
                                onChange={(e) => setArchitectData({ ...architectData, first_name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input
                                type="text"
                                value={architectData.last_name}
                                onChange={(e) => setArchitectData({ ...architectData, last_name: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="tel"
                                value={architectData.phone || ''}
                                onChange={(e) => setArchitectData({ ...architectData, phone: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                disabled={!isEditing}
                                placeholder="+51 987 654 321"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                            <input
                                type="url"
                                value={architectData.linkedin || ''}
                                onChange={(e) => setArchitectData({ ...architectData, linkedin: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                disabled={!isEditing}
                                placeholder="https://linkedin.com/in/usuario"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Experiencia</label>
                        <input
                            type="text"
                            value={architectData.experience || ''}
                            onChange={(e) => setArchitectData({ ...architectData, experience: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            disabled={!isEditing}
                            placeholder="Ejemplo: 5 años"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Biografía</label>
                        <textarea
                            rows={3}
                            value={architectData.bio || ''}
                            onChange={(e) => setArchitectData({ ...architectData, bio: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            disabled={!isEditing}
                            placeholder="Cuéntanos sobre ti..."
                        />
                    </div>

                    {/* BOTONES */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </button>

                        {isEditing && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
