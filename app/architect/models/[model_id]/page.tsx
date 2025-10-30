// app/architect/models/[model_id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProModelViewer from '@/components/ModelViewer/ProModelViewer';

// Interfaces
interface Department {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
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
}

export default function ModelPreview() {
    const params = useParams();
    const router = useRouter();
    const modelId = Number(params.model_id);

    const [model, setModel] = useState<Model | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);

    // Datos de ejemplo - luego vendrán de Supabase
    const sampleModel: Model = {
        id: modelId,
        department_id: 1,
        storage_url: 'https://example.com/model1-v3.glb',
        created_at: '2024-01-15',
        department: {
            id: 1,
            name: 'Departamento Moderno Centro',
            description: 'Amplio departamento en el corazón de la ciudad con acabados de lujo y vista panorámica.',
            image_url: '/img/dept1.jpg'
        },
        versions: [
            {
                id: 1,
                modelo_id: modelId,
                numero_version: 1,
                url: 'https://example.com/model1-v1.glb',
                notas: 'Versión inicial con estructura básica y layout general',
                created_at: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                modelo_id: modelId,
                numero_version: 2,
                url: 'https://example.com/model1-v2.glb',
                notas: 'Agregado mobiliario básico, texturas de paredes y pisos',
                created_at: '2024-01-20T14:30:00Z'
            },
            {
                id: 3,
                modelo_id: modelId,
                numero_version: 3,
                url: 'https://example.com/model1-v3.glb',
                notas: 'Versión final con iluminación optimizada, vegetación y detalles decorativos',
                created_at: '2024-01-25T09:15:00Z'
            }
        ]
    };

    useEffect(() => {
        // Simular carga de datos
        setTimeout(() => {
            setModel(sampleModel);
            setSelectedVersion(sampleModel.versions?.[sampleModel.versions.length - 1] || null);
            setLoading(false);
        }, 1000);
    }, [modelId]);

    const handleVersionSelect = (version: ModelVersion) => {
        setSelectedVersion(version);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getVersionBadgeColor = (versionNumber: number) => {
        const colors = [
            'bg-blue-100 text-blue-800 border-blue-200',
            'bg-green-100 text-green-800 border-green-200',
            'bg-purple-100 text-purple-800 border-purple-200',
            'bg-yellow-100 text-yellow-800 border-yellow-200',
            'bg-red-100 text-red-800 border-red-200'
        ];
        return colors[(versionNumber - 1) % colors.length];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando modelo...</p>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Modelo no encontrado</h1>
                    <p className="text-gray-600 mb-4">El modelo solicitado no existe o no está disponible.</p>
                    <Link
                        href="/architect/models"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        ← Volver a Modelos
                    </Link>
                </div>
            </div>
        );
    }

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
                                <h1 className="text-2xl font-bold text-gray-900">{model.department?.name}</h1>
                                <p className="text-sm text-gray-600">Vista previa del modelo 3D</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setAutoRotate(!autoRotate)}
                                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                    autoRotate 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}
                            >
                                {autoRotate ? '🔄 Auto-rotación' : '⏸️ Pausado'}
                            </button>
                            <Link
                                href={`/architect/models/${modelId}/upload-version`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                ➕ Nueva Versión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Panel Lateral - Versiones */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow border border-gray-200">
                            {/* Información del Departamento */}
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Información del Proyecto</h3>
                                {model.department?.image_url && (
                                    <img
                                        src={model.department.image_url}
                                        alt={model.department.name}
                                        className="w-full h-32 object-cover rounded-md mb-3"
                                    />
                                )}
                                <h4 className="font-medium text-gray-900">{model.department?.name}</h4>
                                {model.department?.description && (
                                    <p className="text-sm text-gray-600 mt-1">{model.department.description}</p>
                                )}
                                <div className="mt-3 flex items-center text-sm text-gray-500">
                                    <span>📅 Creado: {formatDate(model.created_at)}</span>
                                </div>
                            </div>

                            {/* Lista de Versiones */}
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">Versiones</h3>
                                    <span className="text-sm text-gray-500">
                                        {model.versions?.length || 0} versiones
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {model.versions?.map(version => (
                                        <button
                                            key={version.id}
                                            onClick={() => handleVersionSelect(version)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedVersion?.id === version.id
                                                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVersionBadgeColor(version.numero_version)}`}>
                                                    v{version.numero_version}
                                                </span>
                                                {selectedVersion?.id === version.id && (
                                                    <span className="text-blue-600 text-sm">👁️ Viendo</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-900 font-medium">
                                                Versión {version.numero_version}
                                            </div>
                                            {version.notas && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {version.notas}
                                                </p>
                                            )}
                                            <div className="text-xs text-gray-500 mt-2">
                                                {formatDate(version.created_at)}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {(!model.versions || model.versions.length === 0) && (
                                    <div className="text-center py-6 text-gray-500">
                                        <div className="text-4xl mb-2">📁</div>
                                        <p className="text-sm">No hay versiones disponibles</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información de la Versión Seleccionada */}
                        {selectedVersion && (
                            <div className="mt-4 bg-white rounded-lg shadow border border-gray-200 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Versión {selectedVersion.numero_version}
                                </h3>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Notas
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedVersion.notas || 'Sin notas adicionales'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                            Creada
                                        </label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {formatDate(selectedVersion.created_at)}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <a
                                                href={selectedVersion.url}
                                                download
                                                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                📥 Descargar
                                            </a>
                                            <Link
                                                href={`/architect/models/versions/${selectedVersion.id}`}
                                                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                ⚙️ Gestionar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vista Principal del Modelo 3D */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            {/* Header del Viewer */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {selectedVersion ? `Versión ${selectedVersion.numero_version}` : 'Selecciona una versión'}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {selectedVersion?.notas || 'Visualización del modelo 3D'}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>🖱️ Arrastra para rotar</span>
                                        <span>•</span>
                                        <span>🔍 Rueda para zoom</span>
                                        <span>•</span>
                                        <span>🎯 Click derecho para mover</span>
                                    </div>
                                </div>
                            </div>

                            {/* Model Viewer */}
                            <div className="p-2 bg-gray-900">
                                {selectedVersion ? (
                                    <ProModelViewer
                                        url={selectedVersion.url}
                                        height="600px"
                                        autoRotate={autoRotate}
                                        className="rounded-lg"
                                    />
                                ) : (
                                    <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
                                        <div className="text-center text-white">
                                            <div className="text-6xl mb-4">👆</div>
                                            <h3 className="text-xl font-semibold mb-2">Selecciona una versión</h3>
                                            <p className="text-gray-300">Elige una versión del panel lateral para verla en 3D</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controles Inferiores */}
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">
                                            Modelo ID: {model.id}
                                        </span>
                                        {selectedVersion && (
                                            <span className="text-sm text-gray-600">
                                                Versión ID: {selectedVersion.id}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                const versions = model.versions || [];
                                                const currentIndex = versions.findIndex(v => v.id === selectedVersion?.id);
                                                const prevVersion = versions[currentIndex - 1];
                                                if (prevVersion) handleVersionSelect(prevVersion);
                                            }}
                                            disabled={!selectedVersion || !model.versions || model.versions.findIndex(v => v.id === selectedVersion?.id) === 0}
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ← Anterior
                                        </button>
                                        <button
                                            onClick={() => {
                                                const versions = model.versions || [];
                                                const currentIndex = versions.findIndex(v => v.id === selectedVersion?.id);
                                                const nextVersion = versions[currentIndex + 1];
                                                if (nextVersion) handleVersionSelect(nextVersion);
                                            }}
                                            disabled={!selectedVersion || !model.versions || model.versions.findIndex(v => v.id === selectedVersion?.id) === model.versions.length - 1}
                                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Siguiente →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comparación de Versiones (Opcional) */}
                        {model.versions && model.versions.length > 1 && (
                            <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución del Modelo</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {model.versions.slice(-3).map(version => (
                                        <div
                                            key={version.id}
                                            className={`text-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                selectedVersion?.id === version.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleVersionSelect(version)}
                                        >
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getVersionBadgeColor(version.numero_version)}`}>
                                                v{version.numero_version}
                                            </div>
                                            <div className="text-sm text-gray-600 line-clamp-2">
                                                {version.notas}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {formatDate(version.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}