// components/ModelViewer/ModelDownloader.tsx
"use client";

import { useState } from "react";

interface ModelDownloaderProps {
  originalUrl: string;
  modelName: string;
  versionNumber: number;
  className?: string;
}

interface DownloadFormat {
  name: string;
  format: string;
  extension: string;
  icon: string;
  description: string;
  supported: boolean;
}

export default function ModelDownloader({
  originalUrl,
  modelName,
  versionNumber,
  className = "",
}: ModelDownloaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);

  // Formatos de exportación para arquitectura
  const downloadFormats: DownloadFormat[] = [
    {
      name: "GLTF Original",
      format: "gltf",
      extension: "gltf",
      icon: "📦",
      description: "Formato estándar web con archivos separados",
      supported: true,
    },
    {
      name: "GLB Binario",
      format: "glb",
      extension: "glb",
      icon: "📁",
      description: "Formato binario todo-en-uno",
      supported: true,
    },
    {
      name: "OBJ Wavefront",
      format: "obj",
      extension: "obj",
      icon: "🔺",
      description: "Compatible con la mayoría de software 3D",
      supported: true,
    },
    {
      name: "FBX",
      format: "fbx",
      extension: "fbx",
      icon: "🎬",
      description: "Autodesk, usado en 3ds Max, Maya",
      supported: true,
    },
    {
      name: "STL",
      format: "stl",
      extension: "stl",
      icon: "🖨️",
      description: "Para impresión 3D y fabricación",
      supported: true,
    },
    {
      name: "DAE Collada",
      format: "dae",
      extension: "dae",
      icon: "🔄",
      description: "Intercambio entre aplicaciones",
      supported: true,
    },
    {
      name: "PLY",
      format: "ply",
      extension: "ply",
      icon: "📐",
      description: "Formatos de nube de puntos",
      supported: true,
    },
    {
      name: "3DS",
      format: "3ds",
      extension: "3ds",
      icon: "💎",
      description: "3D Studio, legacy pero ampliamente compatible",
      supported: true,
    },
  ];

  const handleDownload = async (format: DownloadFormat) => {
    if (!format.supported) {
      alert(`El formato ${format.name} no está disponible actualmente`);
      return;
    }

    setConverting(format.format);

    try {
      // En una implementación real, aquí llamarías a tu API para convertir el modelo
      // Por ahora, simulamos la conversión y descarga

      // Simular tiempo de conversión
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Crear nombre de archivo
      const fileName = `${modelName.replace(/\s+/g, "_")}_v${versionNumber}.${
        format.extension
      }`;

      // Para demostración, descargamos el archivo original con extensión diferente
      // En producción, necesitarías un servicio de conversión
      const response = await fetch(originalUrl);
      const blob = await response.blob();

      // Crear URL de descarga
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Mostrar mensaje de éxito
      alert(`✅ Modelo descargado en formato ${format.name}`);
    } catch (error) {
      console.error("Error downloading model:", error);
      alert(`❌ Error al descargar en formato ${format.name}`);
    } finally {
      setConverting(null);
      setIsOpen(false);
    }
  };

  const handleQuickDownload = () => {
    // Descarga rápida del formato original
    const originalFormat =
      downloadFormats.find((f) => f.format === "glb") || downloadFormats[0];
    handleDownload(originalFormat);
  };

  const getOriginalFormat = () => {
    const ext = originalUrl.split(".").pop()?.toLowerCase();
    return (
      downloadFormats.find((f) => f.extension === ext) || downloadFormats[0]
    );
  };

  const originalFormat = getOriginalFormat();

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal de descarga */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleQuickDownload}
          disabled={converting !== null}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {converting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Convirtiendo...
            </>
          ) : (
            <>📥 Descargar {originalFormat.extension.toUpperCase()}</>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={converting !== null}
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎛️ Más Formatos
        </button>
      </div>

      {/* Menú desplegable de formatos */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Formatos de Exportación
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Exporta el modelo en formatos compatibles con software de
              arquitectura
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {downloadFormats.map((format) => (
                <button
                  key={format.format}
                  onClick={() => handleDownload(format)}
                  disabled={converting !== null || !format.supported}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{format.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {format.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        .{format.extension}
                      </span>
                      {converting === format.format && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">💡</span>
                <div className="text-xs text-blue-700">
                  <strong>Nota:</strong> La conversión de formatos requiere un
                  servicio backend. Esta es una demostración de la interfaz.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar al hacer click fuera */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
