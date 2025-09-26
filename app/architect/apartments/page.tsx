// app/architect/properties/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

// Tipo para los departamentos
interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    status: 'available' | 'sold' | 'reserved';
    area: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    lastUpdated: string;
}

export default function PropertiesManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);

    // Datos de ejemplo - luego vendrán del backend
    const properties: Property[] = [
        {
            id: 1,
            name: 'Departamento Moderno Centro',
            address: 'Av. Principal 123, Lima',
            price: 250000,
            status: 'available',
            area: 120,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop1.jpg'],
            lastUpdated: '2024-01-15'
        },
        {
            id: 2,
            name: 'Penthouse Vista al Mar',
            address: 'Costa Verde 456, Miraflores',
            price: 450000,
            status: 'reserved',
            area: 200,
            bedrooms: 4,
            bathrooms: 3,
            images: ['/img/prop2.jpg'],
            lastUpdated: '2024-01-14'
        },
        {
            id: 3,
            name: 'Loft Minimalista',
            address: 'Jr. Creative 789, Barranco',
            price: 180000,
            status: 'sold',
            area: 80,
            bedrooms: 1,
            bathrooms: 1,
            images: ['/img/prop3.jpg'],
            lastUpdated: '2024-01-10'
        },
        {
            id: 4,
            name: 'Departamento Familiar',
            address: 'Urb. Las Gardenias 321, Surco',
            price: 320000,
            status: 'available',
            area: 150,
            bedrooms: 3,
            bathrooms: 2,
            images: ['/img/prop4.jpg'],
            lastUpdated: '2024-01-08'
        }
    ];

    // Filtrar propiedades
    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const handleDeleteClick = (id: number) => {
        setPropertyToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        // Aquí irá la lógica para eliminar del backend
        console.log('Eliminando propiedad:', propertyToDelete);
        setShowDeleteModal(false);
        setPropertyToDelete(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(price);
    };

    return (
        <div>
            {/* Header con acciones */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Departamentos</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Administra y gestiona todos los departamentos del sistema.
                        </p>
                    </div>
                    <Link
                        href="/architect/apartments/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        ➕ Nuevo Departamento
                    </Link>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="mb-6 bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Buscar por nombre o dirección..."
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="available">Disponible</option>
                            <option value="reserved">Reservado</option>
                            <option value="sold">Vendido</option>
                        </select>
                    </div>

                    {/* Estadísticas rápidas */}
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {properties.filter(p => p.status === 'available').length}
                            </div>
                            <div className="text-sm text-gray-500">Disponibles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {properties.filter(p => p.status === 'reserved').length}
                            </div>
                            <div className="text-sm text-gray-500">Reservados</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de departamentos */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredProperties.map((property) => (
                        <li key={property.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-16 w-16 bg-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 text-2xl">🏠</span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h3 className="text-lg font-medium text-blue-600">{property.name}</h3>
                                                <div className="ml-2">{getStatusBadge(property.status)}</div>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{property.address}</p>
                                            <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                                                <span>🛏️ {property.bedrooms} hab.</span>
                                                <span>🚿 {property.bathrooms} baños</span>
                                                <span>📐 {property.area} m²</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</div>
                                            <div className="text-sm text-gray-500">Actualizado: {property.lastUpdated}</div>
                                        </div>
                                        <div className="flex space-x-1">
                                            {/* Botón Ver/Editar */}
                                            <Link
                                                href={`/architect/properties/${property.id}`}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                title="Editar departamento"
                                            >
                                                ✏️
                                            </Link>

                                            {/* Botón Vista 3D */}
                                            <button
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                title="Ver en 3D"
                                            >
                                                🎮
                                            </button>

                                            {/* Botón Eliminar */}
                                            <button
                                                onClick={() => handleDeleteClick(property.id)}
                                                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                title="Eliminar departamento"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Mensaje cuando no hay resultados */}
                {filteredProperties.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏠</div>
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron departamentos</h3>
                        <p className="text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <span className="text-red-600 text-xl">⚠️</span>
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Eliminar Departamento
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            ¿Estás seguro de que quieres eliminar este departamento? Esta acción no se puede deshacer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                    onClick={confirmDelete}
                                >
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}