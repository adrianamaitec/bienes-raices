// app/client/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_image_url: string;
    role: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export default function ClientProfile() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Datos del usuario desde Supabase
    const [userData, setUserData] = useState<UserProfile>({
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        profile_image_url: '',
        role: 'client',
        address: '',
        created_at: '',
        updated_at: ''
    });

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);

            // Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Cargar datos del perfil desde Supabase
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error cargando perfil:', error);
                return;
            }

            if (data) {
                setUserData(data);
            }

        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Generar nombre único para el archivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            // Subir imagen al bucket "images"
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true // Sobrescribir si existe
                });

            if (uploadError) {
                throw uploadError;
            }

            // Obtener URL pública de la imagen
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            // Actualizar el estado local con la nueva URL
            setUserData(prev => ({
                ...prev,
                profile_image_url: publicUrl
            }));

            return publicUrl;

        } catch (error: any) {
            console.error('Error subiendo imagen:', error);
            alert('Error al subir la imagen: ' + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen debe ser menor a 5MB');
            return;
        }

        const imageUrl = await handleImageUpload(file);
        if (imageUrl) {
            console.log('Imagen subida correctamente:', imageUrl);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Actualizar datos en Supabase
            const { error } = await supabase
                .from('users')
                .update({
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone,
                    address: userData.address,
                    profile_image_url: userData.profile_image_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userData.id);

            if (error) {
                throw error;
            }

            setIsEditing(false);
            alert('Perfil actualizado correctamente');
        } catch (error: any) {
            console.error('Error guardando perfil:', error);
            alert('Error al guardar el perfil: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const removeProfileImage = async () => {
        if (!userData.profile_image_url) return;

        try {
            setUploading(true);

            // Extraer el path del storage de la URL
            const urlParts = userData.profile_image_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `profiles/${userData.id}/${fileName}`;

            // Eliminar imagen del storage
            const { error } = await supabase.storage
                .from('images')
                .remove([filePath]);

            if (error) {
                throw error;
            }

            // Actualizar estado local
            setUserData(prev => ({
                ...prev,
                profile_image_url: ''
            }));

        } catch (error: any) {
            console.error('Error eliminando imagen:', error);
            alert('Error al eliminar la imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAvatar = () => {
        if (userData.profile_image_url) {
            return (
                <img
                    src={userData.profile_image_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                />
            );
        }
        return (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl shadow-md">
                👤
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header del perfil */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0 relative">
                        {getAvatar()}

                        {/* Botón para cambiar imagen */}
                        {isEditing && (
                            <div className="absolute -bottom-2 -right-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    title="Cambiar foto de perfil"
                                >
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        '📷'
                                    )}
                                </button>

                                {/* Botón para eliminar imagen si existe */}
                                {userData.profile_image_url && (
                                    <button
                                        type="button"
                                        onClick={removeProfileImage}
                                        disabled={uploading}
                                        className="absolute -bottom-2 -left-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        title="Eliminar foto de perfil"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {userData.first_name} {userData.last_name}
                        </h1>
                        <p className="text-gray-600">{userData.email}</p>
                        <p className="text-sm text-gray-500">
                            Cliente desde {formatDate(userData.created_at)}
                        </p>
                        {userData.updated_at !== userData.created_at && (
                            <p className="text-sm text-gray-500">
                                Última actualización: {formatDate(userData.updated_at)}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={saving || uploading}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium disabled:opacity-50 transition-colors"
                    >
                        {isEditing ? 'Cancelar' : '✏️ Editar Perfil'}
                    </button>
                </div>

                {/* Input oculto para subir archivos */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Formulario de edición */}
            <div className="bg-white rounded-lg shadow-sm border">
                <form onSubmit={handleSaveProfile}>
                    <div className="p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Información Personal
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={userData.first_name}
                                    onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                                    disabled={!isEditing || saving}
                                />
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={userData.last_name}
                                    onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                                    disabled={!isEditing || saving}
                                />
                            </div>

                            {/* Email (solo lectura) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                                    value={userData.email}
                                    disabled
                                    title="El email no se puede modificar"
                                />
                                <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={userData.phone || ''}
                                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                    disabled={!isEditing || saving}
                                    placeholder="+51 987 654 321"
                                />
                            </div>

                            {/* Dirección */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={userData.address || ''}
                                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                    disabled={!isEditing || saving}
                                    placeholder="Ingresa tu dirección completa"
                                />
                            </div>
                        </div>

                        {/* Información de solo lectura */}
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Fecha de creación:</span>
                                    <p className="text-gray-600">{formatDate(userData.created_at)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Última actualización:</span>
                                    <p className="text-gray-600">{formatDate(userData.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        {isEditing && (
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        loadUserProfile(); // Recargar datos originales
                                    }}
                                    disabled={saving || uploading}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors flex items-center"
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
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Acciones adicionales */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones de Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/client/dashboard')}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <span className="text-2xl">🏠</span>
                        <div>
                            <p className="font-medium text-gray-900">Volver al Dashboard</p>
                            <p className="text-sm text-gray-600">Continuar explorando propiedades</p>
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/client/favorites')}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                        <span className="text-2xl">❤️</span>
                        <div>
                            <p className="font-medium text-gray-900">Ver Favoritos</p>
                            <p className="text-sm text-gray-600">Mis propiedades guardadas</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}