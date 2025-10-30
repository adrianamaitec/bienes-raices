"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Department {
  id: number;
  name: string;
  description: string | null;
  price: number;
  size: number | null;
  street: string | null;
  zone: string | null;
  floor: number | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  created_at: string;
  bed: number | null;
  bathrooms: number | null;
  status: "available" | "sold" | "reserved";
}

export default function PropertiesManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "sold" | "reserved"
  >("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(
    null
  );
  const supabase = supabaseBrowser();
  // 🔹 Cargar departamentos
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 🔹 Filtrado
  const filteredDepartments = departments.filter((department) => {
    const matchesSearch =
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.zone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || department.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 🔹 Badge de estado
  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-green-100 text-green-800",
      sold: "bg-red-100 text-red-800",
      reserved: "bg-yellow-100 text-yellow-800",
    };
    const labels = {
      available: "Disponible",
      sold: "Vendido",
      reserved: "Reservado",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  // 🔹 Borrado lógico (archivar)
  const handleArchive = async (id: number) => {
    try {
      const { error } = await supabase
        .from("departments")
        .update({ status: "reserved" }) // o 'inactive' si agregas ese valor al enum
        .eq("id", id);

      if (error) throw error;

      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "reserved" } : d))
      );
    } catch (error) {
      console.error("Error archivando departamento:", error);
      alert("No se pudo archivar el departamento");
    }
  };

  // 🔹 Eliminar (borrado real)
  const handleDeleteClick = (id: number) => {
    setDepartmentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", departmentToDelete);

      if (error) throw error;

      setDepartments((prev) => prev.filter((d) => d.id !== departmentToDelete));
      setShowDeleteModal(false);
      setDepartmentToDelete(null);
    } catch (error) {
      console.error("Error eliminando departamento:", error);
      alert("Error al eliminar el departamento");
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(price);

  const getAddress = (department: Department) => {
    const parts = [];
    if (department.street) parts.push(department.street);
    if (department.zone) parts.push(department.zone);
    return parts.join(", ") || "Dirección no especificada";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Departamentos
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra y gestiona todos los departamentos del sistema.
          </p>
        </div>
        <Link
          href="/architect/apartments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          ➕ Nuevo Departamento
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre, calle o zona..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="available">Disponible</option>
            <option value="reserved">Reservado</option>
            <option value="sold">Vendido</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {!loading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredDepartments.map((department) => (
              <li key={department.id}>
                <div className="px-4 py-4 sm:px-6 flex justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                      {department.image_url ? (
                        <img
                          src={department.image_url}
                          alt={department.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-2xl">
                          🏠
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-blue-600">
                        {department.name} {getStatusBadge(department.status)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getAddress(department)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {department.size} m² • {department.bed} hab •{" "}
                        {department.bathrooms} baños
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatPrice(department.price)}
                      </div>
                    </div>
                    <Link
                      href={`/architect/apartments/${department.id}`}
                      title="Editar"
                      className="p-2 border rounded hover:bg-gray-100"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleArchive(department.id)}
                      className="p-2 border rounded hover:bg-yellow-100"
                      title="Archivar (borrado lógico)"
                    >
                      📦
                    </button>
                    <button
                      onClick={() => handleDeleteClick(department.id)}
                      className="p-2 border rounded hover:bg-red-100"
                      title="Eliminar definitivamente"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No se encontraron departamentos.
            </div>
          )}
        </div>
      )}

      {/* Modal eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Eliminar Departamento
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Seguro que deseas eliminar este departamento? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
