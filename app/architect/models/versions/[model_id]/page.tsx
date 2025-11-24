// app/architect/models/versions/[version_id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import ProModelViewer from "@/components/ModelViewer/ProModelViewer";
import ModelDownloader from "@/components/ModelViewer/ModelDownloader";
import VersionNotesEditor from "@/components/ModelViewer/VersionNotesEditor";
import router from "next/router";

interface Department {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  status: string;
}

interface Model {
  id: number;
  department_id: number;
  storage_url: string;
  created_at: string;
}

interface ModelVersion {
  id: number;
  modelo_id: number;
  numero_version: number;
  url: string;
  notas?: string;
  created_at: string;
}

interface VersionData {
  version: ModelVersion;
  model: Model | null;
  department: Department | null;
}

export default function VersionPreview() {
  const params = useParams();
  const versionId = params.model_id as string;
  const supabase = supabaseBrowser();

  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Cargar solo los datos necesarios de la versión específica
  useEffect(() => {
    async function loadVersion() {
      setLoading(true);
      setError(null);

      try {
        console.log("⏳ Buscando versión ID:", versionId);

        const { data, error } = await supabase
          .from("modelos_versiones")
          .select(
            `
            id,
            numero_version,
            url,
            notas,
            created_at,
            models:modelo_id (
              id,
              department_id,
              storage_url,
              created_at,
              departments:department_id (
                id,
                name,
                description,
                status,
                image_url
              )
            )
          `
          )
          .eq("id", Number(versionId))
          .single();

        console.log("🟦 Resultado Supabase:", data, error);

        if (error) throw error;
        if (!data) throw new Error("No se encontró la versión");

        /* --- Normalizar model y department --- */
        const m = Array.isArray((data as any).models)
          ? (data as any).models[0]
          : (data as any).models;

        const d = m?.departments
          ? Array.isArray(m.departments)
            ? m.departments[0]
            : m.departments
          : null;

        const modelObj: Model | null = m
          ? {
              id: m.id,
              department_id: m.department_id,
              storage_url: m.storage_url,
              created_at: m.created_at,
            }
          : null;

        const departmentObj: Department | null = d
          ? {
              id: d.id,
              name: d.name,
              description: d.description,
              image_url: d.image_url,
              status: d.status,
            }
          : null;

        const version: ModelVersion = {
          id: data.id,
          modelo_id: modelObj?.id ?? 0,
          numero_version: data.numero_version,
          url: data.url,
          notas: data.notas,
          created_at: data.created_at,
        };

        setVersionData({
          version,
          model: modelObj,
          department: departmentObj,
        });
      } catch (err: any) {
        console.error("❌ Error loading version:", err);
        setError(err.message ?? "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    if (versionId) loadVersion();
  }, [versionId]);
  const handleNotesSave = (newNotes: string) => {
    // Actualizar el estado local con las nuevas notas
    if (versionData) {
      setVersionData({
        ...versionData,
        version: {
          ...versionData.version,
          notas: newNotes,
        },
      });
    }

    // Forzar recarga de datos para asegurar consistencia
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteVersion = async () => {
    if (
      !versionData ||
      !confirm(
        "¿Estás seguro de que quieres eliminar esta versión? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("modelos_versiones")
        .delete()
        .eq("id", versionData.version.id);

      if (error) throw error;

      alert("✅ Versión eliminada correctamente");

      // Redirigir a la página del modelo
      if (versionData.model) {
        router.push(`/architect/models/${versionData.model.id}`);
      } else {
        router.push("/architect/models");
      }
    } catch (err: any) {
      console.error("Error deleting version:", err);
      alert("❌ Error al eliminar la versión: " + err.message);
    }
  };
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { class: "bg-green-100 text-green-800", text: "Disponible" },
      sold: { class: "bg-red-100 text-red-800", text: "Vendido" },
      reserved: { class: "bg-yellow-100 text-yellow-800", text: "Reservado" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.available;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando versión {versionId}...</p>
        </div>
      </div>
    );
  }

  if (error || !versionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? "Error al cargar la versión" : "Versión no encontrada"}
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "La versión solicitada no existe o no está disponible."}
          </p>
          <div className="space-y-2">
            <div className="text-sm text-gray-500 p-3 bg-gray-100 rounded">
              <strong>ID solicitado:</strong> {versionId}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/architect/models"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                ← Volver a Modelos
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { version, model, department } = versionData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/architect/models"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                ← Volver a Modelos
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {department?.name || `Modelo ${model?.id || "N/A"}`} - Versión{" "}
                  {version.numero_version}
                </h1>
                <p className="text-sm text-gray-600">
                  Vista previa de la versión específica
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {model && (
                <Link
                  href={`/architect/models/`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  📋 Ver Todas las Versiones
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel Lateral - Información */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              {/* Información del Proyecto */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Información del Proyecto
                </h3>
                {department?.image_url && (
                  <img
                    src={department.image_url}
                    alt={department.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}

                {department?.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {department.description}
                  </p>
                )}
              </div>

              {/* Información de la Versión Actual */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Versión {version.numero_version}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Notas
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {version.notas || "Sin notas adicionales"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Creada
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(version.created_at)}
                    </p>
                  </div>
                  {/* Editor de Notas */}
                  <div className="p-4 border-b border-gray-200">
                    <VersionNotesEditor
                      versionId={version.id}
                      currentNotes={version.notas || ""}
                      onSave={handleNotesSave}
                    />
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Descargar Modelo
                        </h3>
                        <ModelDownloader
                          originalUrl={version.url}
                          modelName={
                            department?.name ||
                            `modelo-${model?.id || "version"}`
                          }
                          versionNumber={version.numero_version}
                        />
                        <p className="text-xs text-gray-500 mt-3">
                          Formatos compatibles con software de arquitectura como
                          Revit, 3ds Max, SketchUp, etc.
                        </p>
                        {/* Acciones Peligrosas */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleDeleteVersion}
                            className="w-full text-center text-xs text-red-600 hover:text-red-700 py-2 border border-red-200 rounded hover:bg-red-50 transition-colors"
                          >
                            🗑️ Eliminar Esta Versión
                          </button>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Esta acción no se puede deshacer
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Técnica */}
            <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Información Técnica
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>URL del Modelo:</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                    {version.url ? "Disponible" : "No disponible"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="text-green-600 font-medium">Activo</span>
                </div>
                {model?.storage_url && (
                  <div className="flex justify-between">
                    <span>URL Principal:</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                      Disponible
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vista Principal del Modelo 3D */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              {/* Header del Viewer */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Versión {version.numero_version}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {version.notas || "Visualización del modelo 3D"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Viewer */}
              <div className="p-2 bg-gray-900">
                <div className="rounded-lg overflow-hidden">
                  <ProModelViewer url={version.url} height="600px" />
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalles de la Versión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Información del Modelo
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">ID del Modelo:</dt>
                      <dd className="text-gray-900">{model?.id || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Departamento:</dt>
                      <dd className="text-gray-900">
                        {department?.name || "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Estado:</dt>
                      <dd className="text-gray-900">
                        {department?.status
                          ? getStatusBadge(department.status)
                          : "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Información de la Versión
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Número:</dt>
                      <dd className="text-gray-900">
                        v{version.numero_version}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Creada:</dt>
                      <dd className="text-gray-900">
                        {formatDate(version.created_at)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Notas:</dt>
                      <dd className="text-gray-900">
                        {version.notas || "No especificadas"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
