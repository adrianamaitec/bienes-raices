// app/architect/properties/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProperty() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        price: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        description: '',
        status: 'available'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para guardar el departamento
        console.log('Guardando:', formData);
        router.push('/architect/properties');
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Departamento</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Completa la información del nuevo departamento.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campos del formulario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    {/* Más campos... */}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => router.push('/architect/properties')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Guardar Departamento
                    </button>
                </div>
            </form>
        </div>
    );
}