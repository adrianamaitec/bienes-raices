'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: 'client' | 'architect' | 'admin';
    status: 'active' | 'inactive' | 'pending';
    created_at: string;
    last_sign_in_at?: string;
    profile_image_url?: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'architect'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
    const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'pending'>('active');

    useEffect(() => {
        fetchUsers();
    }, []);

    // 🔹 Cargar usuarios reales
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error cargando usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || user.role === typeFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleStatusUpdate = (user: User, status: 'active' | 'inactive' | 'pending') => {
        setUserToUpdate(user);
        setNewStatus(status);
        setShowStatusModal(true);
    };

    const confirmStatusUpdate = async () => {
        if (!userToUpdate) return;
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: newStatus })
                .eq('id', userToUpdate.id);

            if (error) throw error;
            setUsers((prev) =>
                prev.map((u) => (u.id === userToUpdate.id ? { ...u, status: newStatus } : u))
            );
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error actualizando estado:', error);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        const labels: Record<string, string> = {
            active: 'Activo',
            inactive: 'Inactivo',
            pending: 'Pendiente',
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
            >
                {labels[status]}
            </span>
        );
    };

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            client: 'bg-blue-100 text-blue-800',
            architect: 'bg-purple-100 text-purple-800',
            admin: 'bg-gray-100 text-gray-800',
        };
        const labels: Record<string, string> = {
            client: 'Cliente',
            architect: 'Arquitecto',
            admin: 'Admin',
        };
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}
            >
                {labels[role]}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">
                        Visualiza y administra los usuarios del sistema.
                    </p>
                </div>
                <Link
                    href="/architect/users/invite"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    ➕ Invitar Usuario
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white shadow rounded-xl p-5 mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="client">Clientes</option>
                        <option value="architect">Arquitectos</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                        <option value="pending">Pendientes</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="text-center py-16 text-gray-500">Cargando usuarios...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <div className="text-6xl mb-4">👥</div>
                        <p>No se encontraron usuarios.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Usuario', 'Correo', 'Tipo', 'Estado', 'Registro', 'Acciones'].map((h) => (
                                    <th
                                        key={h}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                        {u.profile_image_url ? (
                                            <img
                                                src={u.profile_image_url}
                                                alt={u.first_name}
                                                className="w-10 h-10 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                                                👤
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {u.first_name} {u.last_name}
                                            </div>
                                            <div className="text-xs text-gray-500">{u.id}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                                    <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {formatDate(u.created_at)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/architect/users/${u.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Ver perfil"
                                            >
                                                👁️
                                            </Link>
                                            <button
                                                onClick={() => handleStatusUpdate(u, u.status === 'active' ? 'inactive' : 'active')}
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Cambiar estado"
                                            >
                                                ⚙️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de confirmación */}
            {showStatusModal && userToUpdate && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Cambiar estado de {userToUpdate.first_name}
                        </h3>
                        <p className="text-gray-500 mb-5">
                            ¿Seguro que quieres cambiar el estado a{' '}
                            <strong>{newStatus === 'active' ? 'Activo' : 'Inactivo'}</strong>?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={confirmStatusUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
