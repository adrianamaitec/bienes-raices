// app/client/profile/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClientProfile {
    personalInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        dni: string;
        birthDate: string;
        avatar: string;
    };
    preferences: {
        notificationEmail: boolean;
        notificationSMS: boolean;
        newsletter: boolean;
        language: string;
        currency: string;
    };
    searchCriteria: {
        minPrice: number;
        maxPrice: number;
        minArea: number;
        minBedrooms: number;
        locations: string[];
        propertyTypes: string[];
    };
    activity: {
        favorites: number;
        viewed: number;
        contacts: number;
        tours: number;
    };
}

export default function ClientProfile() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'search' | 'activity'>('profile');
    const [isEditing, setIsEditing] = useState(false);

    // Datos del cliente
    const [profileData, setProfileData] = useState<ClientProfile>({
        personalInfo: {
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@email.com',
            phone: '+51 987 654 321',
            dni: '12345678',
            birthDate: '1985-06-15',
            avatar: '👩'
        },
        preferences: {
            notificationEmail: true,
            notificationSMS: false,
            newsletter: true,
            language: 'es',
            currency: 'PEN'
        },
        searchCriteria: {
            minPrice: 200000,
            maxPrice: 500000,
            minArea: 80,
            minBedrooms: 2,
            locations: ['Miraflores', 'San Isidro', 'Barranco'],
            propertyTypes: ['Departamento', 'Penthouse']
        },
        activity: {
            favorites: 5,
            viewed: 12,
            contacts: 3,
            tours: 2
        }
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        // Lógica para guardar en el backend
        console.log('Perfil guardado:', profileData);
        alert('Perfil actualizado correctamente');
    };

    const handlePreferencesSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar preferencias
        console.log('Preferencias guardadas:', profileData.preferences);
        alert('Preferencias actualizadas');
    };

    const handleSearchCriteriaSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar criterios de búsqueda
        console.log('Criterios guardados:', profileData.searchCriteria);
        alert('Criterios de búsqueda guardados');
    };

    const addLocation = (location: string) => {
        if (location && !profileData.searchCriteria.locations.includes(location)) {
            setProfileData({
                ...profileData,
                searchCriteria: {
                    ...profileData.searchCriteria,
                    locations: [...profileData.searchCriteria.locations, location]
                }
            });
        }
    };

    const removeLocation = (location: string) => {
        setProfileData({
            ...profileData,
            searchCriteria: {
                ...profileData.searchCriteria,
                locations: profileData.searchCriteria.locations.filter(loc => loc !== location)
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header del perfil */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-center space-x-6">
                    <div className="text-6xl">{profileData.personalInfo.avatar}</div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                        </h1>
                        <p className="text-gray-600">{profileData.personalInfo.email}</p>
                        <p className="text-sm text-gray-500">Cliente desde Enero 2024</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium"
                    >
                        {isEditing ? 'Cancelar' : '✏️ Editar Perfil'}
                    </button>
                </div>

                {/* Estadísticas rápidas */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{profileData.activity.favorites}</div>
                        <div className="text-sm text-blue-800">Favoritos</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{profileData.activity.viewed}</div>
                        <div className="text-sm text-green-800">Vistos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{profileData.activity.contacts}</div>
                        <div className="text-sm text-purple-800">Contactados</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{profileData.activity.tours}</div>
                        <div className="text-sm text-yellow-800">Tours Agendados</div>
                    </div>
                </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'profile', name: 'Información Personal', icon: '👤' },
                            { id: 'preferences', name: 'Preferencias', icon: '⚙️' },
                            { id: 'search', name: 'Búsqueda Ideal', icon: '🔍' },
                            { id: 'activity', name: 'Mi Actividad', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Contenido de las pestañas */}
            <div className="bg-white rounded-lg shadow-sm border">
                {/* Pestaña: Información Personal */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.firstName}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, firstName: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.lastName}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, lastName: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.email}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, email: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                <input
                                    type="tel"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.phone}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, phone: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.dni}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, dni: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    value={profileData.personalInfo.birthDate}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, birthDate: e.target.value }
                                    })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl">{profileData.personalInfo.avatar}</div>
                                    <div className="flex space-x-2">
                                        {['👩', '👨', '👩‍💼', '👨‍💼', '😊', '🤵'].map((avatar) => (
                                            <button
                                                key={avatar}
                                                type="button"
                                                onClick={() => setProfileData({
                                                    ...profileData,
                                                    personalInfo: { ...profileData.personalInfo, avatar }
                                                })}
                                                disabled={!isEditing}
                                                className="text-2xl hover:scale-110 transition-transform disabled:opacity-50"
                                            >
                                                {avatar}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        )}
                    </form>
                )}

                {/* Pestaña: Preferencias */}
                {activeTab === 'preferences' && (
                    <form onSubmit={handlePreferencesSave} className="p-6">
                        <div className="max-w-2xl space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Notificaciones por Email</label>
                                        <p className="text-sm text-gray-500">Recibir alertas y actualizaciones por correo</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={profileData.preferences.notificationEmail}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            preferences: { ...profileData.preferences, notificationEmail: e.target.checked }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Notificaciones por SMS</label>
                                        <p className="text-sm text-gray-500">Alertas urgentes por mensaje de texto</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={profileData.preferences.notificationSMS}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            preferences: { ...profileData.preferences, notificationSMS: e.target.checked }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Boletín Informativo</label>
                                        <p className="text-sm text-gray-500">Nuevos departamentos y ofertas especiales</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={profileData.preferences.newsletter}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            preferences: { ...profileData.preferences, newsletter: e.target.checked }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Idioma Preferido</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.preferences.language}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            preferences: { ...profileData.preferences, language: e.target.value }
                                        })}
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Moneda de Visualización</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.preferences.currency}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            preferences: { ...profileData.preferences, currency: e.target.value }
                                        })}
                                    >
                                        <option value="PEN">Soles (PEN)</option>
                                        <option value="USD">Dólares (USD)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Guardar Preferencias
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Pestaña: Búsqueda Ideal */}
                {activeTab === 'search' && (
                    <form onSubmit={handleSearchCriteriaSave} className="p-6">
                        <div className="max-w-2xl space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Mi Búsqueda Ideal</h3>
                            <p className="text-gray-600">Configura tus criterios de búsqueda para recibir recomendaciones personalizadas.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mínimo</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.searchCriteria.minPrice}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            searchCriteria: { ...profileData.searchCriteria, minPrice: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        {formatCurrency(profileData.searchCriteria.minPrice)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Máximo</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.searchCriteria.maxPrice}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            searchCriteria: { ...profileData.searchCriteria, maxPrice: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        {formatCurrency(profileData.searchCriteria.maxPrice)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Área Mínima (m²)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.searchCriteria.minArea}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            searchCriteria: { ...profileData.searchCriteria, minArea: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mínimo de Habitaciones</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                                        value={profileData.searchCriteria.minBedrooms}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            searchCriteria: { ...profileData.searchCriteria, minBedrooms: parseInt(e.target.value) || 0 }
                                        })}
                                    >
                                        <option value={1}>1 habitación</option>
                                        <option value={2}>2 habitaciones</option>
                                        <option value={3}>3 habitaciones</option>
                                        <option value={4}>4+ habitaciones</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicaciones Preferidas</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {profileData.searchCriteria.locations.map((location) => (
                                        <span key={location} className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {location}
                                            <button
                                                type="button"
                                                onClick={() => removeLocation(location)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Agregar ubicación..."
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLocation((e.target as HTMLInputElement).value);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                            addLocation(input.value);
                                            input.value = '';
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de Propiedad</label>
                                <div className="space-y-2">
                                    {['Departamento', 'Penthouse', 'Casa', 'Oficina', 'Local'].map((type) => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={profileData.searchCriteria.propertyTypes.includes(type)}
                                                onChange={(e) => {
                                                    const newTypes = e.target.checked
                                                        ? [...profileData.searchCriteria.propertyTypes, type]
                                                        : profileData.searchCriteria.propertyTypes.filter(t => t !== type);
                                                    setProfileData({
                                                        ...profileData,
                                                        searchCriteria: { ...profileData.searchCriteria, propertyTypes: newTypes }
                                                    });
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Guardar Criterios
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Pestaña: Mi Actividad */}
                {activeTab === 'activity' && (
                    <div className="p-6">
                        <div className="max-w-2xl space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Mi Actividad Reciente</h3>

                            {/* Resumen de actividad */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-600">{profileData.activity.favorites}</div>
                                    <div className="text-sm text-blue-800">Propiedades Favoritas</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-600">{profileData.activity.viewed}</div>
                                    <div className="text-sm text-green-800">Propiedades Visitadas</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600">{profileData.activity.contacts}</div>
                                    <div className="text-sm text-purple-800">Arquitectos Contactados</div>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{profileData.activity.tours}</div>
                                    <div className="text-sm text-yellow-800">Tours Agendados</div>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Acciones Rápidas</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => router.push('/client/favorites')}
                                        className="flex items-center space-x-2 p-3 bg-white border rounded-md hover:bg-gray-50"
                                    >
                                        <span className="text-xl">❤️</span>
                                        <span>Ver Mis Favoritos</span>
                                    </button>
                                    <button
                                        onClick={() => router.push('/client/dashboard')}
                                        className="flex items-center space-x-2 p-3 bg-white border rounded-md hover:bg-gray-50"
                                    >
                                        <span className="text-xl">🔍</span>
                                        <span>Continuar Búsqueda</span>
                                    </button>
                                    <button className="flex items-center space-x-2 p-3 bg-white border rounded-md hover:bg-gray-50">
                                        <span className="text-xl">📋</span>
                                        <span>Descargar Historial</span>
                                    </button>
                                    <button className="flex items-center space-x-2 p-3 bg-white border rounded-md hover:bg-gray-50">
                                        <span className="text-xl">🔄</span>
                                        <span>Actualizar Preferencias</span>
                                    </button>
                                </div>
                            </div>

                            {/* Actividad reciente */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Actividad Reciente</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-md">
                                        <span className="text-xl">❤️</span>
                                        <div>
                                            <p className="text-sm font-medium">Agregaste a favoritos</p>
                                            <p className="text-xs text-gray-500">Moderno Departamento en Miraflores</p>
                                            <p className="text-xs text-gray-400">Hace 2 horas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-md">
                                        <span className="text-xl">👁️</span>
                                        <div>
                                            <p className="text-sm font-medium">Viste el detalle de</p>
                                            <p className="text-xs text-gray-500">Penthouse con Terraza Jardín</p>
                                            <p className="text-xs text-gray-400">Hace 1 día</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-md">
                                        <span className="text-xl">📞</span>
                                        <div>
                                            <p className="text-sm font-medium">Contactaste al arquitecto</p>
                                            <p className="text-xs text-gray-500">Ana Martínez</p>
                                            <p className="text-xs text-gray-400">Hace 2 días</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}