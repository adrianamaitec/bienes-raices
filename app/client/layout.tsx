// app/client/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigation = [
        { name: 'Inicio', href: '/client/dashboard', icon: '🏠' },
        { name: 'Favoritos', href: '/client/favorites', icon: '❤️' },
        { name: 'Mi Perfil', href: '/client/profile', icon: '👤' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo y marca */}
                        <div className="flex items-center">
                            <Link href="/client/dashboard" className="flex items-center">
                                <span className="text-2xl">🏠</span>
                                <span className="ml-2 text-xl font-bold text-gray-900">Bienes Raíces</span>
                            </Link>
                        </div>

                        {/* Navegación desktop */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(item.href)
                                        ? 'border-blue-500 text-gray-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Acciones del header */}
                        <div className="flex items-center space-x-4">
                            {/* Notificaciones */}
                            <button className="p-2 text-gray-400 hover:text-gray-500">
                                <span className="text-xl">🔔</span>
                            </button>

                            {/* Cerrar sesión */}
                            <Link
                                href="/login"
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cerrar sesión
                            </Link>

                            {/* Menú móvil */}
                            <button
                                className="md:hidden p-2"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <span className="text-xl">☰</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menú móvil */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.href)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}