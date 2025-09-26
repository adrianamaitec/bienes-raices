// app/client/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    isFavorite: boolean;
    features: string[];
    status: 'available' | 'sold' | 'reserved';
    architect: string;
    vrTour: boolean;
}

export default function ClientDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        priceRange: [0, 1000000],
        bedrooms: 'all',
        minArea: 0,
        maxArea: 500,
        sortBy: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Datos de ejemplo - departamentos disponibles
    const properties: Property[] = [
        {
            id: 1,
            name: 'Moderno Departamento en Miraflores',
            address: 'Av. Larco 123, Miraflores, Lima',
            price: 350000,
            area: 120,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop1.jpg'],
            isFavorite: true,
            features: ['Vista al mar', 'Piscina', 'Gimnasio', 'Estacionamiento'],
            status: 'available',
            architect: 'Ana Martínez',
            vrTour: true
        },
        {
            id: 2,
            name: 'Penthouse con Terraza Jardín',
            address: 'Costa Verde 456, San Isidro',
            price: 650000,
            area: 200,
            bedrooms: 4,
            bathrooms: 3,
            images: ['/img/prop2.jpg'],
            isFavorite: false,
            features: ['Terraza', 'Jacuzzi', 'Vista 360°', 'Smart Home'],
            status: 'available',
            architect: 'Carlos López',
            vrTour: true
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
            isFavorite: false,
            features: ['Diseño moderno', 'Cocina integral', 'Área de lavado'],
            status: 'available',
            architect: 'Laura Rodríguez',
            vrTour: false
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
            isFavorite: true,
            features: ['Parque infantil', 'Área BBQ', 'Seguridad 24/7'],
            status: 'available',
            architect: 'Pedro Sánchez',
            vrTour: true
        },
        {
            id: 5,
            name: 'Departamento Ejecutivo en Centro',
            address: 'Jr. de la Unión 654, Cercado de Lima',
            price: 190000,
            area: 75,
            bedrooms: 2,
            bathrooms: 1,
            images: ['/img/prop5.jpg'],
            isFavorite: false,
            features: ['Amoblado', 'Cerca a bancos', 'Ascensor'],
            status: 'available',
            architect: 'María González',
            vrTour: false
        },
        {
            id: 6,
            name: 'Departamento con Vista al Golf',
            address: 'Av. Los Incas 987, La Molina',
            price: 420000,
            area: 150,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop6.jpg'],
            isFavorite: false,
            features: ['Vista al campo de golf', 'Club house', 'Sauna'],
            status: 'available',
            architect: 'Roberto Silva',
            vrTour: true
        }
    ];

    // Filtrar y ordenar propiedades
    const filteredProperties = properties
        .filter(property =>
            property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.features.some(feature =>
                feature.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        .filter(property => {
            if (filters.bedrooms !== 'all' && property.bedrooms !== parseInt(filters.bedrooms)) {
                return false;
            }
            if (property.area < filters.minArea || property.area > filters.maxArea) {
                return false;
            }
            if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'area': return b.area - a.area;
                default: return b.id - a.id; // newest first
            }
        });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const toggleFavorite = (id: number) => {
        // Lógica para agregar/remover de favoritos
        console.log('Toggle favorite:', id);
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Encuentra tu Departamento Ideal
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Explora nuestra selección de departamentos exclusivos con tours virtuales en 3D.
                    Vive la experiencia antes de comprar.
                </p>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Barra de búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">🔍</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, ubicación o características..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <span className="mr-2">⚙️</span>
                            Filtros
                        </button>

                        <select
                            className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                        >
                            <option value="newest">Más recientes</option>
                            <option value="price-low">Precio: menor a mayor</option>
                            <option value="price-high">Precio: mayor a menor</option>
                            <option value="area">Área: mayor a menor</option>
                        </select>
                    </div>
                </div>

                {/* Filtros expandidos */}
                {showFilters && (
                    <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Mín"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    value={filters.priceRange[0]}
                                    onChange={(e) => setFilters({ ...filters, priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] })}
                                />
                                <input
                                    type="number"
                                    placeholder="Máx"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    value={filters.priceRange[1]}
                                    onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value) || 1000000] })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={filters.bedrooms}
                                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                            >
                                <option value="all">Todas</option>
                                <option value="1">1 habitación</option>
                                <option value="2">2 habitaciones</option>
                                <option value="3">3+ habitaciones</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Área Mínima (m²)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={filters.minArea}
                                onChange={(e) => setFilters({ ...filters, minArea: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Área Máxima (m²)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                value={filters.maxArea}
                                onChange={(e) => setFilters({ ...filters, maxArea: parseInt(e.target.value) || 500 })}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Resultados de búsqueda */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    {filteredProperties.length} Departamentos Encontrados
                </h2>
                <div className="text-sm text-gray-600">
                    Ordenado por: {filters.sortBy === 'newest' ? 'Más recientes' :
                        filters.sortBy === 'price-low' ? 'Precio menor' :
                            filters.sortBy === 'price-high' ? 'Precio mayor' : 'Área mayor'}
                </div>
            </div>

            {/* Grid de departamentos */}
            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                            {/* Imagen del departamento */}
                            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                                <div className="absolute inset-0 flex items-center justify-center text-white text-6xl">
                                    🏠
                                </div>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex space-x-2">
                                    {property.vrTour && (
                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            🎮 Tour 3D
                                        </span>
                                    )}
                                    {property.isFavorite && (
                                        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            ❤️ Favorito
                                        </span>
                                    )}
                                </div>

                                {/* Botón favorito */}
                                <button
                                    onClick={() => toggleFavorite(property.id)}
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                >
                                    <span className={property.isFavorite ? 'text-red-500' : 'text-gray-400'}>
                                        {property.isFavorite ? '❤️' : '🤍'}
                                    </span>
                                </button>
                            </div>

                            {/* Contenido de la tarjeta */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                        {property.name}
                                    </h3>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPrice(property.price)}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                    📍 {property.address}
                                </p>

                                {/* Características */}
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                    <span>🛏️ {property.bedrooms} hab.</span>
                                    <span>🚿 {property.bathrooms} baños</span>
                                    <span>📐 {property.area} m²</span>
                                </div>

                                {/* Features tags */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {property.features.slice(0, 3).map((feature, index) => (
                                        <span key={index} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                            {feature}
                                        </span>
                                    ))}
                                    {property.features.length > 3 && (
                                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                            +{property.features.length - 3} más
                                        </span>
                                    )}
                                </div>

                                {/* Arquitecto */}
                                <div className="text-xs text-gray-500 mb-4">
                                    Arquitecto: <span className="font-medium">{property.architect}</span>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex space-x-2">
                                    <Link
                                        href={`/client/apartments/${property.id}`}
                                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Ver Detalles
                                    </Link>
                                    {property.vrTour && (
                                        <button className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium">
                                            🎮 3D
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Estado vacío */
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron departamentos</h3>
                    <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilters({
                                priceRange: [0, 1000000],
                                bedrooms: 'all',
                                minArea: 0,
                                maxArea: 500,
                                sortBy: 'newest'
                            });
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
        </div>
    );
}