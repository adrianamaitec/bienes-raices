// components/ModelViewer/ProModelViewer.tsx
'use client';

import { useState, useEffect } from 'react';

interface ProModelViewerProps {
    url: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    autoRotate?: boolean;
}

export default function ProModelViewer({ 
    url, 
    width = "100%", 
    height = "500px",
    className = "",
    autoRotate = true
}: ProModelViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [rotation, setRotation] = useState(0);

    // Simular carga y rotación automática
    useEffect(() => {
        // Simular tiempo de carga
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        // Rotación automática simulada
        if (autoRotate && !isLoading) {
            const rotationInterval = setInterval(() => {
                setRotation(prev => (prev + 0.5) % 360);
            }, 50);

            return () => clearInterval(rotationInterval);
        }

        return () => clearTimeout(timer);
    }, [autoRotate, isLoading]);

    return (
        <div 
            className={`relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl ${className}`}
            style={{ width, height }}
        >
            {/* Simulación del Canvas 3D */}
            <div className="relative w-full h-full overflow-hidden">
                {/* Fondo del "escenario 3D" */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black">
                    {/* Grid del piso */}
                    <div 
                        className="absolute bottom-0 left-0 right-0 h-32"
                        style={{
                            backgroundImage: `
                                linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%),
                                linear-gradient(0deg, transparent 95%, rgba(255,255,255,0.1) 95%)
                            `,
                            backgroundSize: '50px 50px',
                            transform: `perspective(500px) rotateX(60deg)`,
                            transformOrigin: 'bottom'
                        }}
                    />
                    
                    {/* Luces ambientales simuladas */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-cyan-400 rounded-full blur-3xl opacity-25 animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                {/* Modelo 3D simulado */}
                {!isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Contenedor del modelo con rotación */}
                        <div 
                            className="relative"
                            style={{
                                transform: `rotateY(${rotation}deg)`,
                                transition: autoRotate ? 'transform 0.1s linear' : 'none'
                            }}
                        >
                            {/* Modelo principal - Casa 3D estilizada */}
                            <div className="relative">
                                {/* Base */}
                                <div className="w-48 h-32 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg shadow-2xl">
                                    {/* Pared frontal */}
                                    <div className="absolute -top-16 left-4 right-4 h-16 bg-gradient-to-b from-gray-500 to-gray-600 rounded-t-lg border border-gray-400">
                                        {/* Ventanas */}
                                        <div className="absolute top-2 left-4 w-8 h-6 bg-blue-300 rounded border border-blue-400 shadow-inner">
                                            <div className="absolute inset-1 bg-blue-200 rounded-sm"></div>
                                        </div>
                                        <div className="absolute top-2 right-4 w-8 h-6 bg-blue-300 rounded border border-blue-400 shadow-inner">
                                            <div className="absolute inset-1 bg-blue-200 rounded-sm"></div>
                                        </div>
                                        {/* Puerta */}
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-yellow-700 rounded-t border border-yellow-800">
                                            <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-900 rounded-full"></div>
                                        </div>
                                    </div>
                                    
                                    {/* Techo */}
                                    <div className="absolute -top-32 left-2 right-2">
                                        <div className="w-44 h-16 bg-gradient-to-b from-red-600 to-red-700 transform -skew-y-6 shadow-lg"></div>
                                    </div>
                                    
                                    {/* Chimenea */}
                                    <div className="absolute -top-40 right-8 w-4 h-8 bg-gray-500">
                                        <div className="absolute -top-2 -left-1 w-6 h-3 bg-gray-400 rounded-full"></div>
                                    </div>
                                    
                                    {/* Balcón */}
                                    <div className="absolute -bottom-4 left-6 right-6 h-3 bg-gray-500 rounded-t border border-gray-400">
                                        <div className="absolute -top-1 left-2 right-2 h-1 bg-gray-400 rounded"></div>
                                    </div>
                                </div>
                                
                                {/* Efectos de profundidad y sombras */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-black/20 to-transparent rounded-lg"></div>
                            </div>
                            
                            {/* Partículas flotantes para efecto 3D */}
                            <div className="absolute -top-8 -left-8 w-4 h-4 bg-white rounded-full blur-sm opacity-30 animate-bounce"></div>
                            <div className="absolute top-12 -right-4 w-3 h-3 bg-cyan-300 rounded-full blur-sm opacity-40 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute -bottom-4 left-12 w-2 h-2 bg-purple-300 rounded-full blur-sm opacity-50 animate-bounce" style={{animationDelay: '1s'}}></div>
                        </div>
                    </div>
                ) : (
                    // Estado de carga
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="relative">
                                {/* Spinner 3D */}
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <div className="w-12 h-12 border-4 border-purple-500 border-b-transparent rounded-full animate-spin-reverse absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                            </div>
                            <p className="text-sm mt-4">Cargando modelo 3D...</p>
                            <p className="text-xs text-gray-400 mt-1">Simulando carga de {url.split('/').pop()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay de controles */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm text-white text-xs p-3 rounded-lg border border-white border-opacity-20">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span>{isLoading ? 'Cargando...' : 'Modelo cargado'}</span>
                        </div>
                        <div className="text-gray-300">
                            🖱️ Arrastra para rotar • 🔍 Rueda para zoom • 🎯 Click derecho para pan
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <div className="flex items-center space-x-1 bg-blue-600 px-2 py-1 rounded text-xs">
                            <span>⚡</span>
                            <span>WebGL</span>
                        </div>
                        <button className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                            🔄
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicador de rotación automática */}
            {autoRotate && !isLoading && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded border border-white border-opacity-20 flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Auto-rotación</span>
                </div>
            )}

            {/* Información del modelo */}
            {!isLoading && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded border border-white border-opacity-20">
                    📦 {url.split('/').pop()}
                </div>
            )}

            {/* Controles de cámara simulados */}
            {!isLoading && (
                <div className="absolute right-4 top-16 space-y-2">
                    <button className="w-8 h-8 bg-black bg-opacity-60 border border-white border-opacity-20 rounded flex items-center justify-center text-white hover:bg-opacity-80 transition-all">
                        ↑
                    </button>
                    <button className="w-8 h-8 bg-black bg-opacity-60 border border-white border-opacity-20 rounded flex items-center justify-center text-white hover:bg-opacity-80 transition-all">
                        ↓
                    </button>
                    <button className="w-8 h-8 bg-black bg-opacity-60 border border-white border-opacity-20 rounded flex items-center justify-center text-white hover:bg-opacity-80 transition-all">
                        ⟳
                    </button>
                </div>
            )}

            {/* Efectos de iluminación */}
            {!isLoading && (
                <>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/10 to-transparent pointer-events-none"></div>
                </>
            )}
        </div>
    );
}