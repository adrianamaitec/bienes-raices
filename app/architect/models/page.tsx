// app/architect/models/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { BsHouseGearFill } from "react-icons/bs";
// Interfaces basadas en tu schema
interface Department {
  id: number;
  nombre: string;
  url_imagen?: string;
  descripcion?: string;
  estado: string;
}

interface Model {
  id: number;
  department_id: number;
  storage_url: string;
  created_at: string;
  department?: Department;
  versions?: ModelVersion[];
}

interface ModelVersion {
  id: number;
  modelo_id: number;
  numero_version: number;
  url: string;
  notas?: string;
  created_at: string;
  model?: Model;
}

export default function ModelsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [expandedModels, setExpandedModels] = useState<number[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = supabaseBrowser();
  // Cargar datos de Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Cargar departamentos
        const { data: departmentsData, error: deptError } = await supabase
          .from("departamentos")
          .select("id, nombre, url_imagen, descripcion, estado")
          .order("nombre");

        if (deptError) throw deptError;

        // Cargar modelos con sus departamentos
        const { data: modelsData, error: modelsError } = await supabase
          .from("models")
          .select(
            `
            *,
            department:departamentos (*)
          `,
          )
          .order("created_at", { ascending: false });

        if (modelsError) throw modelsError;

        // Cargar versiones para cada modelo
        const modelsWithVersions = await Promise.all(
          (modelsData || []).map(async (model: any) => {
            const { data: versionsData, error: versionsError } = await supabase
              .from("modelos_versiones")
              .select("*")
              .eq("modelo_id", model.id)
              .order("numero_version", { ascending: false });

            if (versionsError) throw versionsError;

            // Normalizar el objeto para cumplir con la interfaz Model
            const typedModel: Model = {
              id: model.id,
              department_id: model.department_id ?? model.department?.id ?? 0,
              storage_url: model.storage_url ?? "",
              created_at: model.created_at ?? new Date().toISOString(),
              department: model.department ?? undefined,
              versions: versionsData || [],
            };

            return typedModel;
          }),
        );

        setDepartments(departmentsData || []);
        setModels(modelsWithVersions);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filtrar modelos
  const filteredModels = models.filter((model) => {
    const matchesSearch = model.department?.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      model.department_id.toString() === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Alternar expansión de modelo
  const toggleModelExpansion = (modelId: number) => {
    setExpandedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId],
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener badge de versión
  const getVersionBadge = (versionNumber: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
    ];
    return colors[(versionNumber - 1) % colors.length];
  };

  // Función para obtener URL firmada de Cloudflare (si es necesario)
  const getSignedUrl = async (url: string) => {
    // Si usas Cloudflare Images o R2 con URLs privadas
    // Aquí iría la lógica para obtener URLs firmadas
    return url;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando modelos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-lg">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Modelos 3D
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Visualiza y administra todas las versiones de tus modelos 3D.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {models.length}
          </div>
          <div className="text-sm text-gray-600">Modelos Totales</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-green-600">
            {models.reduce(
              (acc, model) => acc + (model.versions?.length || 0),
              0,
            )}
          </div>
          <div className="text-sm text-gray-600">Versiones Totales</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.max(...models.map((m) => m.versions?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Máx. Versiones por Modelo</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {departments.length}
          </div>
          <div className="text-sm text-gray-600">Departamentos</div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar Departamento
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por nombre de departamento..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por Departamento */}
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Departamento
            </label>
            <select
              id="department"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">Todos los Departamentos</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Información de Filtros */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Mostrando {filteredModels.length} de {models.length} modelos
              {searchTerm && ` • Búsqueda: "${searchTerm}"`}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Modelos */}
      <div className="space-y-4">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Header del Modelo */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {model.department?.url_imagen ? (
                      <img
                        src={model.department.url_imagen}
                        alt={model.department.nombre}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      "🏠"
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {model.department?.nombre || "Departamento no encontrado"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {model.versions?.length || 0} versión
                      {model.versions?.length !== 1 ? "es" : ""} • Creado:{" "}
                      {formatDate(model.created_at)}
                    </p>
                    {model.department?.estado && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                          model.department.estado === "available"
                            ? "bg-green-100 text-green-800"
                            : model.department.estado === "sold"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {model.department.estado === "available"
                          ? "Disponible"
                          : model.department.estado === "sold"
                            ? "Vendido"
                            : "Reservado"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Modelo #{model.id}
                  </span>
                  <button
                    onClick={() => toggleModelExpansion(model.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    {expandedModels.includes(model.id) ? (
                      <>
                        <FaChevronCircleUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Ocultar</span>
                        <span className="sm:hidden">↑</span>
                      </>
                    ) : (
                      <>
                        <FaChevronCircleDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Versiones</span>
                        <span className="sm:hidden">↓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Versiones del Modelo (Expandible) */}
            {expandedModels.includes(model.id) && (
              <div className="bg-gray-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-900">
                    Versiones del Modelo
                  </h4>
                </div>

                <div className="grid gap-3">
                  {model.versions?.map((version) => (
                    <div
                      key={version.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVersionBadge(version.numero_version)}`}
                          >
                            v{version.numero_version}
                          </span>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              Versión {version.numero_version}
                            </h5>
                            {version.notas && (
                              <p className="text-sm text-gray-600 mt-1">
                                {version.notas}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Creada: {formatDate(version.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Descargar */}
                          <a
                            href={version.url}
                            download
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Descargar Modelo"
                          >
                            <MdFileDownload />
                          </a>

                          {/* Gestionar Versión */}
                          <Link
                            href={`/architect/models/versions/${version.id}`}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Gestionar Versión"
                          >
                            <BsHouseGearFill />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {(!model.versions || model.versions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p>No hay versiones para este modelo.</p>
                    <Link
                      href={`/architect/models/${model.id}/upload-version`}
                      className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Subir primera versión
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredModels.length === 0 && (
        <div className="bg-white shadow rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {models.length === 0
              ? "No hay modelos cargados"
              : "No se encontraron modelos"}
          </h3>
          <p className="text-gray-600 mb-6">
            {models.length === 0
              ? "Comienza subiendo tu primer modelo 3D."
              : "Intenta ajustar los filtros de búsqueda."}
          </p>
          <Link
            href="/architect/models/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📤 Subir Primer Modelo
          </Link>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Gestión de Versiones
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                • Cada modelo puede tener múltiples versiones para diferentes
                iteraciones del diseño
              </p>
              <p>
                • Las versiones se numeran automáticamente en orden secuencial
              </p>
              <p>
                • Mantén un historial completo de cambios y evoluciones del
                modelo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
