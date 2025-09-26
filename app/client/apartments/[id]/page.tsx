// app/client/properties/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    yearBuilt: number;
    floor: number;
    parking: number;
    images: string[];
    isFavorite: boolean;
    features: string[];
    description: string;
    status: 'available' | 'sold' | 'reserved';
    architect: {
        name: string;
        avatar: string;
        experience: string;
        contact: string;
    };
    vrTour: boolean;
    location: {
        lat: number;
        lng: number;
        amenities: string[];
    };
    tourSchedule: string[];
}

export default function PropertyDetail() {
    const params = useParams();
    const router = useRouter();
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'location' | 'contact'>('overview');
    const [isFavorite, setIsFavorite] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [tourDate, setTourDate] = useState('');

    // Datos de ejemplo - en una app real esto vendría de una API
    const property: Property = {
        id: parseInt(params.id as string),
        name: 'Moderno Departamento en Miraflores con Vista al Mar',
        address: 'Av. Larco 123, Miraflores, Lima, Perú',
        price: 350000,
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        yearBuilt: 2022,
        floor: 12,
        parking: 1,
        images: ['/img/prop1-1.jpg', '/img/prop1-2.jpg', '/img/prop1-3.jpg', '/img/prop1-4.jpg'],
        isFavorite: true,
        features: [
            'Vista al mar', 'Piscina', 'Gimnasio', 'Estacionamiento',
            'Seguridad 24/7', 'Ascensor', 'Cocina integral', 'Balcón',
            'Amoblado', 'Closet empotrado', 'Área de lavado', 'Calentador de agua'
        ],
        description: `Este espectacular departamento moderno ofrece una experiencia de vida única en el corazón de Miraflores. Con diseño contemporáneo y acabados de lujo, cuenta con amplios espacios iluminados naturalmente y vistas panorámicas al océano Pacífico.

La distribución inteligente del espacio incluye 3 dormitorios suite con closets empotrados, 2 baños completos con acabados en porcelanato, cocina integral con isla y electrodomésticos de última generación, y una sala-comedor de concepto abierto que se integra perfectamente con el balcón.

El edificio cuenta con amenities de primer nivel: piscina temperada, gimnasio equipado, sala de reuniones, y seguridad las 24 horas. Ubicación privilegiada a solo 2 cuadras del malecón y a minutos de centros comerciales, restaurantes y zonas de entretenimiento.`,
        status: 'available',
        architect: {
            name: 'Ana Martínez',
            avatar: '👩‍💼',
            experience: '8 años de experiencia',
            contact: 'ana.martinez@arquitectura.com'
        },
        vrTour: true,
        location: {
            lat: -12.1194,
            lng: -77.0342,
            amenities: [
                'Supermercado (200m)', 'Parque Kennedy (300m)', 'Malecón (400m)',
                'Centro comercial (500m)', 'Hospital (1km)', 'Colegios (800m)'
            ]
        },
        tourSchedule: ['2024-01-20 10:00', '2024-01-20 14:00', '2024-01-21 11:00', '2024-01-21 16:00']
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 0
        }).format(price);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        // Lógica para guardar en favoritos
        console.log('Toggle favorite:', property.id);
    };

    const scheduleTour = () => {
        if (!tourDate) {
            alert('Por favor selecciona una fecha y hora para el tour');
            return;
        }
        // Lógica para agendar tour
        console.log('Tour agendado para:', tourDate);
        setShowContactForm(false);
        alert('¡Tour agendado exitosamente! Te contactaremos para confirmar.');
    };

    const contactArchitect = () => {
        // Lógica para contactar al arquitecto
        console.log('Contactando al arquitecto:', property.architect.contact);
        alert(`Mensaje enviado a ${property.architect.name}`);
    };

    const startVRTour = () => {
        // Lógica para iniciar tour VR
        console.log('Iniciando tour VR para propiedad:', property.id);
        alert('Redirigiendo al tour virtual 3D...');
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Navegación */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <Link href="/client/dashboard" className="hover:text-gray-700">
                    Inicio
                </Link>
                <span>›</span>
                <Link href="/client/dashboard" className="hover:text-gray-700">
                    Departamentos
                </Link>
                <span>›</span>
                <span className="text-gray-900">{property.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna izquierda - Galería e información principal */}
                <div className="lg:col-span-2">
                    {/* Galería de imágenes */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
                        <div className="relative h-80 bg-gradient-to-br from-blue-400 to-purple-500">
                            <div className="absolute inset-0 flex items-center justify-center text-white text-8xl">
                                🏠
                            </div>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex space-x-2">
                                {property.vrTour && (
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        🎮 Tour 3D Disponible
                                    </span>
                                )}
                                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {property.status === 'available' ? 'Disponible' : 'Vendido'}
                                </span>
                            </div>

                            {/* Botones de galería */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                <div className="flex space-x-2">
                                    {property.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveImage(index)}
                                            className={`w-3 h-3 rounded-full ${activeImage === index ? 'bg-white' : 'bg-white bg-opacity-50'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={toggleFavorite}
                                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                >
                                    <span className={isFavorite ? 'text-red-500 text-2xl' : 'text-gray-400 text-2xl'}>
                                        {isFavorite ? '❤️' : '🤍'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Miniaturas */}
                        <div className="p-4 grid grid-cols-4 gap-2">
                            {property.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`h-20 bg-gradient-to-br from-blue-300 to-purple-400 rounded-md flex items-center justify-center text-2xl text-white ${activeImage === index ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    🏠
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navegación por pestañas */}
                    <div className="bg-white rounded-lg shadow-sm border mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {[
                                    { id: 'overview', name: 'Resumen', icon: '📋' },
                                    { id: 'features', name: 'Características', icon: '⭐' },
                                    { id: 'location', name: 'Ubicación', icon: '📍' },
                                    { id: 'contact', name: 'Contacto', icon: '📞' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Contenido de las pestañas */}
                        <div className="p-6">
                            {/* Pestaña: Resumen */}
                            {activeTab === 'overview' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                                    <p className="text-gray-700 whitespace-pre-line mb-6">{property.description}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{property.bedrooms}</div>
                                            <div className="text-sm text-blue-800">Habitaciones</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">{property.bathrooms}</div>
                                            <div className="text-sm text-green-800">Baños</div>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{property.area}m²</div>
                                            <div className="text-sm text-purple-800">Área Total</div>
                                        </div>
                                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-600">{property.floor}°</div>
                                            <div className="text-sm text-yellow-800">Piso</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pestaña: Características */}
                            {activeTab === 'features' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Características y Amenities</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {property.features.map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-3">
                                                <span className="text-green-500">✓</span>
                                                <span className="text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pestaña: Ubicación */}
                            {activeTab === 'location' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Alrededores</h3>
                                    <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mb-4">
                                        <div className="text-center text-gray-600">
                                            <div className="text-4xl mb-2">🗺️</div>
                                            <p>Mapa interactivo</p>
                                            <p className="text-sm">Lat: {property.location.lat}, Lng: {property.location.lng}</p>
                                        </div>
                                    </div>

                                    <h4 className="font-medium text-gray-900 mb-2">Servicios cercanos:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {property.location.amenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                <span>📍</span>
                                                <span>{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pestaña: Contacto */}
                            {activeTab === 'contact' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto y Visitas</h3>

                                    {/* Información del arquitecto */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center space-x-4 mb-3">
                                            <div className="text-4xl">{property.architect.avatar}</div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{property.architect.name}</h4>
                                                <p className="text-sm text-gray-600">{property.architect.experience}</p>
                                                <p className="text-sm text-gray-600">{property.architect.contact}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={contactArchitect}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                                        >
                                            📞 Contactar al Arquitecto
                                        </button>
                                    </div>

                                    {/* Agendar tour */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Agendar Tour Presencial</h4>
                                        <div className="space-y-3">
                                            <select
                                                value={tourDate}
                                                onChange={(e) => setTourDate(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            >
                                                <option value="">Selecciona una fecha y hora</option>
                                                {property.tourSchedule.map((date) => (
                                                    <option key={date} value={date}>
                                                        {new Date(date).toLocaleString('es-PE')}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={scheduleTour}
                                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                                            >
                                                🗓️ Agendar Tour
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Información de compra y acciones */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border sticky top-6">
                        {/* Precio y estado */}
                        <div className="p-6 border-b">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {formatPrice(property.price)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>💰 {formatPrice(property.price / property.area)}/m²</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${property.status === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {property.status === 'available' ? 'Disponible' : 'Vendido'}
                                </span>
                            </div>
                        </div>

                        {/* Información rápida */}
                        <div className="p-6 border-b">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">📐</span>
                                    <span>{property.area} m² totales</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">🛏️</span>
                                    <span>{property.bedrooms} habitaciones</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">🚿</span>
                                    <span>{property.bathrooms} baños</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">🏢</span>
                                    <span>Piso {property.floor}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">🚗</span>
                                    <span>{property.parking} estacionamiento(s)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400">📅</span>
                                    <span>Año {property.yearBuilt}</span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones principales */}
                        <div className="p-6 space-y-3">
                            {property.vrTour && (
                                <button
                                    onClick={startVRTour}
                                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 font-medium flex items-center justify-center space-x-2"
                                >
                                    <span>🎮</span>
                                    <span>Iniciar Tour Virtual 3D</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowContactForm(true)}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
                            >
                                <span>💬</span>
                                <span>Solicitar Información</span>
                            </button>

                            <button
                                onClick={toggleFavorite}
                                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center space-x-2"
                            >
                                <span>{isFavorite ? '❤️' : '🤍'}</span>
                                <span>{isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</span>
                            </button>

                            <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center space-x-2">
                                <span>📄</span>
                                <span>Descargar Brochure</span>
                            </button>
                        </div>

                        {/* Información de contacto rápida */}
                        <div className="p-6 bg-gray-50 rounded-b-lg">
                            <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span>👩‍💼</span>
                                    <span className="font-medium">{property.architect.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>📧</span>
                                    <span>{property.architect.contact}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compartir propiedad */}
                    <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Compartir propiedad</h4>
                        <div className="flex space-x-3">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                                📘 Facebook
                            </button>
                            <button className="flex-1 bg-blue-400 text-white py-2 px-3 rounded text-sm hover:bg-blue-500">
                                🐦 Twitter
                            </button>
                            <button className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600">
                                📱 WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de contacto */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Solicitar Información</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Tu nombre"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="email"
                                placeholder="Tu email"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="tel"
                                placeholder="Tu teléfono"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <textarea
                                placeholder="Mensaje o consulta específica"
                                rows={4}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowContactForm(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowContactForm(false);
                                        alert('Mensaje enviado correctamente');
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                >
                                    Enviar Mensaje
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}