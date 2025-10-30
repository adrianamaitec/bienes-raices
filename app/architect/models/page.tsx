// app/architect/models/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Interfaces basadas en tu schema
interface Department {
    id: number;
    name: string;
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
    model?: Model;
}

export default function ModelsManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [expandedModels, setExpandedModels] = useState<number[]>([]);

    // Datos de ejemplo - luego vendrán de Supabase
    const departments: Department[] = [
        { id: 1, name: 'Departamento Moderno Centro', image_url: '/img/dept1.jpg' },
        { id: 2, name: 'Penthouse Vista al Mar', image_url: '/img/dept2.jpg' },
        { id: 3, name: 'Loft Minimalista', image_url: '/img/dept3.jpg' },
    ];

    const models: Model[] = [
        {
            id: 1,
            department_id: 1,
            storage_url: 'https://example.com/model1.glb',
            created_at: '2024-01-15',
            department: departments[0],
            versions: [
                {
                    id: 1,
                    modelo_id: 1,
                    numero_version: 1,
                    url: 'https://example.com/model1-v1.glb',
                    notas: 'Versión inicial con estructura básica',
                    created_at: '2024-01-15'
                },
                {
                    id: 2,
                    modelo_id: 1,
                    numero_version: 2,
                    url: 'https://example.com/model1-v2.glb',
                    notas: 'Agregado mobiliario y texturas',
                    created_at: '2024-01-20'
                },
                {
                    id: 3,
                    modelo_id: 1,
                    numero_version: 3,
                    url: 'https://example.com/model1-v3.glb',
                    notas: 'Optimización de luces y materiales',
                    created_at: '2024-01-25'
                }
            ]
        },
        {
            id: 2,
            department_id: 2,
            storage_url: 'https://example.com/model2.glb',
            created_at: '2024-01-10',
            department: departments[1],
            versions: [
                {
                    id: 4,
                    modelo_id: 2,
                    numero_version: 1,
                    url: 'https://example.com/model2-v1.glb',
                    notas: 'Modelo base con estructura',
                    created_at: '2024-01-10'
                },
                {
                    id: 5,
                    modelo_id: 2,
                    numero_version: 2,
                    url: 'https://example.com/model2-v2.glb',
                    notas: 'Vista al mar mejorada',
                    created_at: '2024-01-18'
                }
            ]
        },
        {
            id: 3,
            department_id: 3,
            storage_url: 'https://example.com/model3.glb',
            created_at: '2024-01-05',
            department: departments[2],
            versions: [
                {
                    id: 6,
                    modelo_id: 3,
                    numero_version: 1,
                    url: 'https://example.com/model3-v1.glb',
                    notas: 'Diseño minimalista inicial',
                    created_at: '2024-01-05'
                }
            ]
        }
    ];

    // Filtrar modelos
    const filteredModels = models.filter(model => {
        const matchesSearch = model.department?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || model.department_id.toString() === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    // Alternar expansión de modelo
    const toggleModelExpansion = (modelId: number) => {
        setExpandedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    // Formatear fecha
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtener badge de versión
    const getVersionBadge = (versionNumber: number) => {
        const colors = [
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-purple-100 text-purple-800',
            'bg-yellow-100 text-yellow-800',
            'bg-red-100 text-red-800'
        ];
        return colors[(versionNumber - 1) % colors.length];
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Modelos 3D</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Visualiza y administra todas las versiones de tus modelos 3D.
                        </p>
                    </div>
                    <Link
                        href="/architect/models/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        📤 Subir Nuevo Modelo
                    </Link>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">{models.length}</div>
                    <div className="text-sm text-gray-600">Modelos Totales</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {models.reduce((acc, model) => acc + (model.versions?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Versiones Totales</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {Math.max(...models.map(m => m.versions?.length || 0))}
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
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Departamento
                        </label>
                        <select
                            id="department"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="all">Todos los Departamentos</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
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
                {filteredModels.map(model => (
                    <div key={model.id} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                        {/* Header del Modelo */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        🏠
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {model.department?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {model.versions?.length || 0} versión{model.versions?.length !== 1 ? 'es' : ''} • 
                                            Creado: {formatDate(model.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Modelo #{model.id}
                                    </span>
                                    <button
                                        onClick={() => toggleModelExpansion(model.id)}
                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {expandedModels.includes(model.id) ? '📕' : '📖'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Versiones del Modelo (Expandible) */}
                        {expandedModels.includes(model.id) && (
                            <div className="bg-gray-50 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-md font-semibold text-gray-900">Versiones del Modelo</h4>
                                    <Link
                                        href={`/architect/models/${model.id}/upload-version`}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        ➕ Nueva Versión
                                    </Link>
                                </div>

                                <div className="grid gap-3">
                                    {model.versions?.map(version => (
                                        <div key={version.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVersionBadge(version.numero_version)}`}>
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
                                                    {/* Preview del Modelo */}
                                                    <button
                                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Vista Previa 3D"
                                                    >
                                                        👁️
                                                    </button>

                                                    {/* Descargar */}
                                                    <a
                                                        href={version.url}
                                                        download
                                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Descargar Modelo"
                                                    >
                                                        📥
                                                    </a>

                                                    {/* Gestionar Versión */}
                                                    <Link
                                                        href={`/architect/models/${version.id}`}
                                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Gestionar Versión"
                                                    >
                                                        ⚙️
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
                        No se encontraron modelos
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {models.length === 0 
                            ? 'Comienza subiendo tu primer modelo 3D.' 
                            : 'Intenta ajustar los filtros de búsqueda.'
                        }
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
                            <p>• Cada modelo puede tener múltiples versiones para diferentes iteraciones del diseño</p>
                            <p>• Las versiones se numeran automáticamente en orden secuencial</p>
                            <p>• Mantén un historial completo de cambios y evoluciones del modelo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}