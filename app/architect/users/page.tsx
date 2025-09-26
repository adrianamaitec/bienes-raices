// app/architect/users/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Tipo para los usuarios
interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    type: 'client' | 'architect';
    status: 'active' | 'inactive' | 'pending';
    joinDate: string;
    lastLogin: string;
    propertiesCount: number;
    avatar?: string;
}

export default function UsersManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'architect'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
    const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'pending'>('active');

    // Datos de ejemplo
    const users: User[] = [
        {
            id: 1,
            name: 'María González',
            email: 'maria.gonzalez@email.com',
            phone: '+51 987 654 321',
            type: 'client',
            status: 'active',
            joinDate: '2024-01-10',
            lastLogin: '2024-01-15',
            propertiesCount: 3,
            avatar: '👩'
        },
        {
            id: 2,
            name: 'Carlos López',
            email: 'carlos.lopez@email.com',
            phone: '+51 987 654 322',
            type: 'client',
            status: 'pending',
            joinDate: '2024-01-12',
            lastLogin: '2024-01-12',
            propertiesCount: 1,
            avatar: '👨'
        },
        {
            id: 3,
            name: 'Ana Martínez',
            email: 'ana.martinez@email.com',
            phone: '+51 987 654 323',
            type: 'architect',
            status: 'active',
            joinDate: '2023-12-15',
            lastLogin: '2024-01-15',
            propertiesCount: 12,
            avatar: '👩‍💼'
        },
        {
            id: 4,
            name: 'Pedro Sánchez',
            email: 'pedro.sanchez@email.com',
            phone: '+51 987 654 324',
            type: 'client',
            status: 'inactive',
            joinDate: '2023-11-20',
            lastLogin: '2023-12-01',
            propertiesCount: 0,
            avatar: '👨'
        },
        {
            id: 5,
            name: 'Laura Rodríguez',
            email: 'laura.rodriguez@email.com',
            phone: '+51 987 654 325',
            type: 'client',
            status: 'active',
            joinDate: '2024-01-05',
            lastLogin: '2024-01-14',
            propertiesCount: 5,
            avatar: '👩'
        }
    ];

    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || user.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        };
        const labels = {
            active: 'Activo',
            inactive: 'Inactivo',
            pending: 'Pendiente'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const styles = {
            client: 'bg-blue-100 text-blue-800',
            architect: 'bg-purple-100 text-purple-800'
        };
        const labels = {
            client: 'Cliente',
            architect: 'Arquitecto'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type as keyof typeof styles]}`}>
                {labels[type as keyof typeof labels]}
            </span>
        );
    };

    const handleStatusUpdate = (user: User, status: 'active' | 'inactive' | 'pending') => {
        setUserToUpdate(user);
        setNewStatus(status);
        setShowStatusModal(true);
    };

    const confirmStatusUpdate = () => {
        // Aquí irá la lógica para actualizar el estado en el backend
        console.log(`Actualizando usuario ${userToUpdate?.name} a estado: ${newStatus}`);
        setShowStatusModal(false);
        setUserToUpdate(null);
    };

    const getStatusActions = (user: User) => {
        if (user.status === 'active') {
            return [
                { label: 'Desactivar', status: 'inactive', color: 'text-red-600 hover:text-red-800' },
                { label: 'Marcar Pendiente', status: 'pending', color: 'text-yellow-600 hover:text-yellow-800' }
            ];
        } else if (user.status === 'inactive') {
            return [
                { label: 'Activar', status: 'active', color: 'text-green-600 hover:text-green-800' },
                { label: 'Marcar Pendiente', status: 'pending', color: 'text-yellow-600 hover:text-yellow-800' }
            ];
        } else {
            return [
                { label: 'Activar', status: 'active', color: 'text-green-600 hover:text-green-800' },
                { label: 'Desactivar', status: 'inactive', color: 'text-red-600 hover:text-red-800' }
            ];
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE');
    };

    return (
        <div>
            {/* Header con acciones */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Administra los usuarios del sistema y sus permisos.
                        </p>
                    </div>
                    <Link
                        href="/architect/users/invite"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        📧 Invitar Usuario
                    </Link>
                </div>
            </div>

            {/* Filtros y estadísticas */}
            <div className="mb-6 bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar usuarios
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar por nombre o email..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro por tipo */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de usuario
                        </label>
                        <select
                            id="type"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="client">Clientes</option>
                            <option value="architect">Arquitectos</option>
                        </select>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            id="status"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                            <option value="pending">Pendientes</option>
                        </select>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                        <div className="text-sm text-blue-800">Total Usuarios</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.status === 'active').length}
                        </div>
                        <div className="text-sm text-green-800">Activos</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {users.filter(u => u.type === 'architect').length}
                        </div>
                        <div className="text-sm text-purple-800">Arquitectos</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            {users.filter(u => u.status === 'pending').length}
                        </div>
                        <div className="text-sm text-yellow-800">Pendientes</div>
                    </div>
                </div>
            </div>

            {/* Lista de usuarios */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actividad
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Propiedades
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 text-2xl flex items-center justify-center">
                                                {user.avatar}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getTypeBadge(user.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>Registro: {formatDate(user.joinDate)}</div>
                                        <div>Último login: {formatDate(user.lastLogin)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="text-center">
                                            <span className="text-lg font-bold">{user.propertiesCount}</span>
                                            <div className="text-xs text-gray-500">propiedades</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {/* Botón Ver Perfil */}
                                            <Link
                                                href={`/architect/users/${user.id}`}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Ver perfil"
                                            >
                                                👁️
                                            </Link>

                                            {/* Botón Editar */}
                                            <Link
                                                href={`/architect/users/${user.id}/edit`}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Editar usuario"
                                            >
                                                ✏️
                                            </Link>

                                            {/* Menú de Estados */}
                                            <div className="relative inline-block text-left">
                                                <button
                                                    className="text-gray-600 hover:text-gray-900 p-1"
                                                    title="Cambiar estado"
                                                >
                                                    ⚙️
                                                </button>
                                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden hover:block">
                                                    <div className="py-1">
                                                        {getStatusActions(user).map((action) => (
                                                            <button
                                                                key={action.status}
                                                                onClick={() => handleStatusUpdate(user, action.status as any)}
                                                                className={`block w-full text-left px-4 py-2 text-sm ${action.color}`}
                                                            >
                                                                {action.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mensaje cuando no hay resultados */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron usuarios</h3>
                        <p className="text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de cambio de estado */}
            {showStatusModal && userToUpdate && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                                    <span className="text-blue-600 text-xl">⚠️</span>
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Cambiar Estado de Usuario
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            ¿Estás seguro de que quieres cambiar el estado de <strong>{userToUpdate.name}</strong> a <strong>{newStatus === 'active' ? 'Activo' : newStatus === 'inactive' ? 'Inactivo' : 'Pendiente'}</strong>?
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                                    onClick={confirmStatusUpdate}
                                >
                                    Confirmar
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    onClick={() => setShowStatusModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}