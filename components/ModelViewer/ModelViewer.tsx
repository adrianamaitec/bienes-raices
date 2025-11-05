// components/ModelViewer/SimpleModelViewer.tsx (alternativa)
"use client";

import { useEffect, useRef, useState } from "react";

interface ModelViewerProps {
  url: string;
}

export default function SimpleModelViewer({ url }: ModelViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar que el archivo existe
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`Archivo no accesible: ${response.status}`);
        }

        // Verificar tipo de archivo
        const fileExtension = url.split(".").pop()?.toLowerCase();
        if (!["glb", "gltf"].includes(fileExtension || "")) {
          throw new Error(
            `Formato no soportado: ${fileExtension}. Solo GLB/GLTF`
          );
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error verificando modelo:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      }
    };

    loadModel();
  }, [url]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 font-medium">
          ❌ No se puede cargar el modelo 3D
        </p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.open(url, "_blank")}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Descargar modelo
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mt-2 text-gray-600">Cargando modelo 3D...</span>
        </>
      ) : (
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎮</div>
          <p className="text-gray-700 font-medium">Modelo 3D Listo</p>
          <p className="text-sm text-gray-500 mt-1">
            Usa un visor 3D compatible para ver este modelo
          </p>
          <button
            onClick={() =>
              window.open(
                `https://gltf-viewer.donmccurdy.com/#model=${encodeURIComponent(
                  url
                )}`,
                "_blank"
              )
            }
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Abrir en Visor Online
          </button>
        </div>
      )}
    </div>
  );
}
