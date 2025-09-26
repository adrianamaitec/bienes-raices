// app/architect/profile/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArchitectProfile() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'notifications'>('profile');

    // Datos del arquitecto (ejemplo)
    const [profileData, setProfileData] = useState({
        personalInfo: {
            firstName: 'Ana',
            lastName: 'Martínez',
            email: 'ana.martinez@arquitectura.com',
            phone: '+51 987 654 321',
            specialty: 'Arquitectura Residencial',
            experience: '8 años',
            licenseNumber: 'ARQ-12345',
            bio: 'Arquitecta especializada en diseño residencial moderno y sostenible. Comprometida con la excelencia y la satisfacción del cliente.',
            avatar: '👩‍💼'
        },
        contactInfo: {
            officeAddress: 'Av. Principal 123, Miraflores, Lima',
            website: 'www.anamartinezarquitecta.com',
            linkedin: 'linkedin.com/in/anamartinez',
            instagram: '@ana_arquitectura'
        },
        statistics: {
            totalProjects: 24,
            activeProjects: 5,
            clients: 18,
            satisfactionRate: 98
        }
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [preferences, setPreferences] = useState({
        language: 'es',
        timezone: 'America/Lima',
        dateFormat: 'dd/MM/yyyy',
        emailNotifications: true,
        smsNotifications: false,
        projectUpdates: true,
        newsletter: true
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar cambios del perfil
        console.log('Guardando perfil:', profileData);
        alert('Perfil actualizado correctamente');
    };

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        // Lógica para cambiar contraseña
        console.log('Cambiando contraseña');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Contraseña actualizada correctamente');
    };

    const handlePreferencesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar preferencias
        console.log('Guardando preferencias:', preferences);
        alert('Preferencias actualizadas correctamente');
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Gestiona tu información personal, seguridad y preferencias.
                </p>
            </div>

            {/* Tarjeta de información principal */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="text-6xl">{profileData.personalInfo.avatar}</div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {profileData.personalInfo.firstName} {profileData.personalInfo.lastName}
                            </h2>
                            <p className="text-gray-600">{profileData.personalInfo.specialty}</p>
                            <p className="text-sm text-gray-500">{profileData.personalInfo.experience} de experiencia</p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{profileData.statistics.totalProjects}</div>
                        <div className="text-sm text-blue-800">Proyectos Totales</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{profileData.statistics.activeProjects}</div>
                        <div className="text-sm text-green-800">Proyectos Activos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{profileData.statistics.clients}</div>
                        <div className="text-sm text-purple-800">Clientes</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{profileData.statistics.satisfactionRate}%</div>
                        <div className="text-sm text-yellow-800">Satisfacción</div>
                    </div>
                </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'profile', name: 'Información Personal', icon: '👤' },
                            { id: 'security', name: 'Seguridad', icon: '🔒' },
                            { id: 'preferences', name: 'Preferencias', icon: '⚙️' },
                            { id: 'notifications', name: 'Notificaciones', icon: '🔔' }
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
            <div className="bg-white shadow rounded-lg">
                {/* Pestaña: Información Personal */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información Personal */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.firstName}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, firstName: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.lastName}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, lastName: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.email}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, email: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    type="tel"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.phone}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, phone: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.specialty}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, specialty: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">N° de Licencia</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.licenseNumber}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, licenseNumber: e.target.value }
                                    })}
                                />
                            </div>

                            {/* Biografía */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Biografía</label>
                                <textarea
                                    rows={4}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.personalInfo.bio}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        personalInfo: { ...profileData.personalInfo, bio: e.target.value }
                                    })}
                                />
                            </div>

                            {/* Información de Contacto */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Información de Contacto</h3>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Dirección de Oficina</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.contactInfo.officeAddress}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        contactInfo: { ...profileData.contactInfo, officeAddress: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.contactInfo.website}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        contactInfo: { ...profileData.contactInfo, website: e.target.value }
                                    })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                                <input
                                    type="url"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={profileData.contactInfo.linkedin}
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        contactInfo: { ...profileData.contactInfo, linkedin: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/architect/dashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                )}

                {/* Pestaña: Seguridad */}
                {activeTab === 'security' && (
                    <form onSubmit={handleSecuritySubmit} className="p-6">
                        <div className="max-w-md space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
                                <p className="text-sm text-gray-600">
                                    Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={securityData.currentPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={securityData.newPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={securityData.confirmPassword}
                                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">💡</div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Requisitos de contraseña</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Mínimo 8 caracteres</li>
                                                <li>Al menos una letra mayúscula</li>
                                                <li>Al menos un número</li>
                                                <li>Al menos un carácter especial</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Pestaña: Preferencias */}
                {activeTab === 'preferences' && (
                    <form onSubmit={handlePreferencesSubmit} className="p-6">
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias del Sistema</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Idioma</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={preferences.language}
                                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                    >
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Zona Horaria</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={preferences.timezone}
                                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                    >
                                        <option value="America/Lima">Lima (GMT-5)</option>
                                        <option value="America/New_York">New York (GMT-5)</option>
                                        <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Formato de Fecha</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={preferences.dateFormat}
                                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                                    >
                                        <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                                        <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                                        <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Guardar Preferencias
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Pestaña: Notificaciones */}
                {activeTab === 'notifications' && (
                    <form onSubmit={handlePreferencesSubmit} className="p-6">
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Notificaciones</h3>
                                <p className="text-sm text-gray-600">
                                    Controla cómo y cuándo recibes notificaciones del sistema.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Notificaciones por Email</label>
                                        <p className="text-sm text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Notificaciones por SMS</label>
                                        <p className="text-sm text-gray-500">Recibir alertas urgentes por mensaje de texto</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.smsNotifications}
                                        onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Actualizaciones de Proyectos</label>
                                        <p className="text-sm text-gray-500">Notificaciones sobre cambios en proyectos activos</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.projectUpdates}
                                        onChange={(e) => setPreferences({ ...preferences, projectUpdates: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Boletín Informativo</label>
                                        <p className="text-sm text-gray-500">Recibir novedades y tips de arquitectura</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences.newsletter}
                                        onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Guardar Configuración
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}