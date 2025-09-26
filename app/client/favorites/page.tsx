// app/client/favorites/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FavoriteProperty {
    id: number;
    name: string;
    address: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    features: string[];
    status: 'available' | 'sold' | 'reserved';
    architect: string;
    vrTour: boolean;
    addedDate: string;
    lastViewed: string;
    notes?: string;
    priority: 'high' | 'medium' | 'low';
}

export default function FavoritesPage() {
    const [sortBy, setSortBy] = useState<'date' | 'price' | 'priority'>('date');
    const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [noteText, setNoteText] = useState('');

    // Datos de ejemplo - propiedades favoritas
    const favoriteProperties: FavoriteProperty[] = [
        {
            id: 1,
            name: 'Moderno Departamento en Miraflores con Vista al Mar',
            address: 'Av. Larco 123, Miraflores, Lima',
            price: 350000,
            area: 120,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop1.jpg'],
            features: ['Vista al mar', 'Piscina', 'Gimnasio'],
            status: 'available',
            architect: 'Ana Martínez',
            vrTour: true,
            addedDate: '2024-01-15',
            lastViewed: '2024-01-18',
            notes: 'Me encanta la vista al mar y la cocina moderna. Preguntar sobre amenities.',
            priority: 'high'
        },
        {
            id: 2,
            name: 'Penthouse con Terraza Jardín en San Isidro',
            address: 'Costa Verde 456, San Isidro',
            price: 650000,
            area: 200,
            bedrooms: 4,
            bathrooms: 3,
            images: ['/img/prop2.jpg'],
            features: ['Terraza', 'Jacuzzi', 'Vista 360°'],
            status: 'available',
            architect: 'Carlos López',
            vrTour: true,
            addedDate: '2024-01-10',
            lastViewed: '2024-01-12',
            notes: 'Muy espacioso, ideal para familia. Revisar costos de mantenimiento.',
            priority: 'high'
        },
        {
            id: 3,
            name: 'Loft Minimalista en Barranco',
            address: 'Bajada de Baños 789, Barranco',
            price: 220000,
            area: 80,
            bedrooms: 1,
            bathrooms: 1,
            images: ['/img/prop3.jpg'],
            features: ['Diseño moderno', 'Cocina integral'],
            status: 'available',
            architect: 'Laura Rodríguez',
            vrTour: false,
            addedDate: '2024-01-08',
            lastViewed: '2024-01-09',
            priority: 'medium'
        },
        {
            id: 4,
            name: 'Departamento Familiar en Surco',
            address: 'Av. Caminos del Inca 321, Surco',
            price: 280000,
            area: 110,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop4.jpg'],
            features: ['Parque infantil', 'Área BBQ'],
            status: 'sold',
            architect: 'Pedro Sánchez',
            vrTour: true,
            addedDate: '2023-12-20',
            lastViewed: '2023-12-22',
            notes: 'Ya vendido, buscar opciones similares.',
            priority: 'low'
        },
        {
            id: 5,
            name: 'Departamento Ejecutivo en Centro de Lima',
            address: 'Jr. de la Unión 654, Cercado de Lima',
            price: 190000,
            area: 75,
            bedrooms: 2,
            bathrooms: 1,
            images: ['/img/prop5.jpg'],
            features: ['Amoblado', 'Cerca a bancos'],
            status: 'available',
            architect: 'María González',
            vrTour: false,
            addedDate: '2023-12-15',
            lastViewed: '2023-12-18',
            priority: 'medium'
        }
    ];

    // Filtrar y ordenar favoritos
    const filteredFavorites = favoriteProperties
        .filter(property => {
            const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (property.notes && property.notes.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || property.priority === filterPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'date':
                default:
                    return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
            }
        });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        const labels = {
            high: 'Alta',
            medium: 'Media',
            low: 'Baja'
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
                {labels[priority as keyof typeof labels]}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            available: 'bg-green-100 text-green-800',
            sold: 'bg-red-100 text-red-800',
            reserved: 'bg-yellow-100 text-yellow-800'
        };
        const labels = {
            available: 'Disponible',
            sold: 'Vendido',
            reserved: 'Reservado'
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const removeFromFavorites = (id: number) => {
        // Lógica para remover de favoritos
        console.log('Removiendo propiedad:', id);
        alert('Propiedad removida de favoritos');
    };

    const updatePriority = (id: number, priority: 'high' | 'medium' | 'low') => {
        // Lógica para actualizar prioridad
        console.log('Actualizando prioridad:', id, priority);
    };

    const saveNote = (id: number) => {
        // Lógica para guardar nota
        console.log('Guardando nota para:', id, noteText);
        setEditingNote(null);
        setNoteText('');
    };

    const startEditNote = (property: FavoriteProperty) => {
        setEditingNote(property.id);
        setNoteText(property.notes || '');
    };

    const compareProperties = (id: number) => {
        // Lógica para comparar propiedades
        console.log('Comparando propiedad:', id);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Gestiona y organiza tus propiedades favoritas para tomar la mejor decisión.
                        </p>
                    </div>
                    <Link
                        href="/client/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        🔍 Seguir Buscando
                    </Link>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <div className="text-2xl font-bold text-blue-600">{favoriteProperties.length}</div>
                    <div className="text-sm text-gray-600">Total Favoritos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {favoriteProperties.filter(p => p.status === 'available').length}
                    </div>
                    <div className="text-sm text-gray-600">Disponibles</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {favoriteProperties.filter(p => p.priority === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">Alta Prioridad</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {favoriteProperties.filter(p => p.vrTour).length}
                    </div>
                    <div className="text-sm text-gray-600">Con Tour 3D</div>
                </div>
            </div>

            {/* Filtros y controles */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar en favoritos
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar por nombre, dirección o notas..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            id="status"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="available">Disponibles</option>
                            <option value="sold">Vendidos</option>
                        </select>
                    </div>

                    {/* Filtro por prioridad */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridad
                        </label>
                        <select
                            id="priority"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as any)}
                        >
                            <option value="all">Todas las prioridades</option>
                            <option value="high">Alta</option>
                            <option value="medium">Media</option>
                            <option value="low">Baja</option>
                        </select>
                    </div>
                </div>

                {/* Ordenamiento y acciones */}
                <div className="mt-4 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">Ordenar por:</span>
                        <select
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="date">Más recientes</option>
                            <option value="price">Precio: menor a mayor</option>
                            <option value="priority">Prioridad</option>
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                            📄 Exportar Lista
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                            🏷️ Etiquetar Todo
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de favoritos */}
            <div className="space-y-4">
                {filteredFavorites.length > 0 ? (
                    filteredFavorites.map((property) => (
                        <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                                    {/* Imagen */}
                                    <div className="flex-shrink-0">
                                        <div className="w-48 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-4xl">
                                            🏠
                                        </div>
                                    </div>

                                    {/* Información principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    <Link
                                                        href={`/client/properties/${property.id}`}
                                                        className="hover:text-blue-600"
                                                    >
                                                        {property.name}
                                                    </Link>
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">📍 {property.address}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-blue-600 mb-1">
                                                    {formatPrice(property.price)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    {getStatusBadge(property.status)}
                                                    {getPriorityBadge(property.priority)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Características */}
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <span>🛏️ {property.bedrooms} hab.</span>
                                            <span>🚿 {property.bathrooms} baños</span>
                                            <span>📐 {property.area} m²</span>
                                            {property.vrTour && <span>🎮 Tour 3D</span>}
                                        </div>

                                        {/* Features tags */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {property.features.slice(0, 4).map((feature, index) => (
                                                <span key={index} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Notas */}
                                        <div className="mt-3">
                                            {editingNote === property.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        placeholder="Agrega tus notas personales..."
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        rows={2}
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => saveNote(property.id)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingNote(null)}
                                                            className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => startEditNote(property)}
                                                    className="cursor-pointer group"
                                                >
                                                    {property.notes ? (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="text-sm text-yellow-800">{property.notes}</div>
                                                                </div>
                                                                <span className="text-yellow-600 opacity-0 group-hover:opacity-100">✏️</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="border border-dashed border-gray-300 rounded-md p-3 text-center text-gray-500 text-sm hover:border-gray-400">
                                                            <span>+ Agregar nota personal</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadatos */}
                                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                            <div>
                                                Agregado: {formatDate(property.addedDate)}
                                                {property.lastViewed && ` • Visto: ${formatDate(property.lastViewed)}`}
                                            </div>
                                            <div>Arquitecto: {property.architect}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                                    <Link
                                        href={`/client/properties/${property.id}`}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        👁️ Ver Detalles
                                    </Link>

                                    <button
                                        onClick={() => compareProperties(property.id)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        ⚖️ Comparar
                                    </button>

                                    <div className="relative inline-block">
                                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                            🏷️ Prioridad
                                        </button>
                                        <div className="absolute right-0 mt-1 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden hover:block">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => updatePriority(property.id, 'high')}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Alta Prioridad
                                                </button>
                                                <button
                                                    onClick={() => updatePriority(property.id, 'medium')}
                                                    className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                                                >
                                                    Media Prioridad
                                                </button>
                                                <button
                                                    onClick={() => updatePriority(property.id, 'low')}
                                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                                >
                                                    Baja Prioridad
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {property.vrTour && (
                                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                            🎮 Tour 3D
                                        </button>
                                    )}

                                    <button
                                        onClick={() => removeFromFavorites(property.id)}
                                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 ml-auto"
                                    >
                                        🗑️ Remover
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    /* Estado vacío */
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                        <div className="text-6xl mb-4">❤️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades favoritas</h3>
                        <p className="text-gray-600 mb-6">Comienza agregando propiedades a tus favoritos para organizarlas aquí.</p>
                        <Link
                            href="/client/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            🔍 Explorar Departamentos
                        </Link>
                    </div>
                )}
            </div>

            {/* Barra de acciones para múltiples propiedades */}
            {filteredFavorites.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                        <div className="text-blue-800">
                            <strong>{filteredFavorites.length} propiedades</strong> en tu lista de favoritos
                        </div>
                        <div className="flex space-x-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                                📧 Contactar Múltiples
                            </button>
                            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm">
                                ⚖️ Comparar Seleccionados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}