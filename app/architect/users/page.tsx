"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: "client" | "architect" | "admin";
  is_active: boolean;
  created_at: string;
  profile_image_url?: string;
  email: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "architect">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "inactive">("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const supabase = supabaseBrowser();

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Obtener usuarios usando RPC
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_users_with_email");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Convertir is_active + role en status para visualización
  const mapStatus = (user: User) => {
    // Arquitectos con is_active = false están "Pendientes"
    if (user.role === "architect" && !user.is_active) return "pending";
    // Otros usuarios usan is_active normal
    return user.is_active ? "active" : "inactive";
  };

  // 🔹 Función para actualizar el estado is_active
  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setActionLoading(userId);
      
      const { error } = await supabase
        .from("users")
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) throw error;

      // Actualizar el estado local inmediatamente
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active: isActive }
            : user
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Error actualizando estado:", error);
      return { success: false, error };
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Manejar activación de usuario
  const handleActivateUser = async (user: User) => {
    const result = await updateUserStatus(user.id, true);
    if (result.success) {
      console.log(`✅ Usuario ${user.first_name} activado`);
    } else {
      alert("Error al activar el usuario");
    }
  };

  // 🔹 Manejar desactivación de usuario
  const handleDeactivateUser = async (user: User) => {
    const result = await updateUserStatus(user.id, false);
    if (result.success) {
      console.log(`✅ Usuario ${user.first_name} desactivado`);
    } else {
      alert("Error al desactivar el usuario");
    }
  };

  // 🔹 Manejar aprobación de arquitecto (activar)
  const handleApproveArchitect = async (user: User) => {
    const result = await updateUserStatus(user.id, true);
    if (result.success) {
      console.log(`✅ Arquitecto ${user.first_name} aprobado`);
    } else {
      alert("Error al aprobar el arquitecto");
    }
  };

  // 🔹 Filtrar usuarios
  const filteredUsers = users.filter((user) => {
    const status = mapStatus(user);
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || user.role === typeFilter;
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 border border-green-200",
      inactive: "bg-red-100 text-red-800 border border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
    const labels: Record<string, string> = {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      client: "bg-blue-100 text-blue-800 border border-blue-200",
      architect: "bg-purple-100 text-purple-800 border border-purple-200",
      admin: "bg-gray-100 text-gray-800 border border-gray-200",
    };
    const labels: Record<string, string> = {
      client: "Cliente",
      architect: "Arquitecto",
      admin: "Admin",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}
      >
        {labels[role]}
      </span>
    );
  };

  // 🔹 Renderizar acciones según el estado del usuario
  const renderUserActions = (user: User) => {
    const status = mapStatus(user);
    const isLoading = actionLoading === user.id;

    if (isLoading) {
      return (
        <div className="flex justify-end">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="flex justify-end gap-2">
        {/* Acciones según estado */}
        {status === "pending" && user.role === "architect" && (
          <button
            onClick={() => handleApproveArchitect(user)}
            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
            title="Aprobar arquitecto"
          >
            <span className="text-lg">✅</span>
          </button>
        )}

        {status === "active" && (
          <button
            onClick={() => handleDeactivateUser(user)}
            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
            title="Desactivar usuario"
          >
            <span className="text-lg">⏸️</span>
          </button>
        )}

        {status === "inactive" && (
          <button
            onClick={() => handleActivateUser(user)}
            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
            title="Activar usuario"
          >
            <span className="text-lg">▶️</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza y administra los usuarios del sistema.
          </p>
        </div>
        <Link
          href="/architect/users/invite"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span>➕</span>
          Invitar Usuario
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-xl p-5 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="client">Clientes</option>
            <option value="architect">Arquitectos</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total usuarios</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => mapStatus(u) === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(u => mapStatus(u) === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => mapStatus(u) === 'inactive').length}
          </div>
          <div className="text-sm text-gray-600">Inactivos</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Cargando usuarios...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p>No se encontraron usuarios.</p>
            {searchTerm || typeFilter !== "all" || statusFilter !== "all" ? (
              <p className="text-sm mt-2">Intenta ajustar los filtros</p>
            ) : null}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Usuario",
                  "Correo",
                  "Tipo",
                  "Estado",
                  "Registro",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={user.first_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg text-blue-600 border border-blue-200">
                          👤
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(mapStatus(user))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    {renderUserActions(user)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Información de estados */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Información de estados:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Activo:</strong> Usuario puede acceder al sistema</li>
          <li>• <strong>Inactivo:</strong> Usuario no puede acceder al sistema</li>
          <li>• <strong>Pendiente:</strong> Arquitecto esperando aprobación</li>
        </ul>
      </div>
    </div>
  );
}