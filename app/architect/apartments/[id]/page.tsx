// app/architect/properties/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import ModelViewer from '@/components/ModelViewer/ModelViewer';

interface Department {
    id: number;
    name: string;
    description: string | null;
    price: number;
    size: number | null;
    street: string | null;
    zone: string | null;
    floor: number | null;
    latitude: number | null;
    longitude: number | null;
    image_url: string | null;
    bed: number | null;
    bathrooms: number | null;
    status: 'available' | 'sold' | 'reserved';
    created_at: string;
}

interface Model {
    id: number;
    department_id: number;
    storage_url: string;
    created_at: string;
}

interface Image {
    id: number;
    department_id: number;
    image_url: string;
    created_at: string;
}

export default function EditDepartment() {
    const router = useRouter();
    const params = useParams();
    const departmentId = Number(params.id);

    const [department, setDepartment] = useState<Department | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [images, setImages] = useState<Image[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const supabase = supabaseBrowser();
    useEffect(() => {
        if (departmentId) {
            fetchDepartmentData();
        }
    }, [departmentId]);

    const fetchDepartmentData = async () => {
        try {
            setLoading(true);

            // Obtener departamento
            const { data: dept, error: deptError } = await supabase
                .from('departments')
                .select('*')
                .eq('id', departmentId)
                .single();

            if (deptError) throw deptError;
            setDepartment(dept);

            // Obtener modelos 3D
            const { data: modelData, error: modelError } = await supabase
                .from('models')
                .select('*')
                .eq('department_id', departmentId)
                .order('created_at', { ascending: false });

            if (modelError) throw modelError;
            setModels(modelData || []);

            // Obtener imágenes de la galería
            const { data: imageData, error: imageError } = await supabase
                .from('images')
                .select('*')
                .eq('department_id', departmentId)
                .order('created_at', { ascending: false });

            if (imageError) throw imageError;
            setImages(imageData || []);

        } catch (error) {
            console.error('Error cargando datos:', error);
            alert('Error al cargar el departamento');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Función para subir imágenes al storage
    const uploadImageToStorage = async (file: File): Promise<string> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `departments/${departmentId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    // 🔹 Manejar selección de nuevas imágenes
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImageFiles: File[] = [];
        const newPreviews: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!file.type.startsWith('image/')) {
                alert('Solo se permiten archivos de imagen');
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen no debe superar los 5MB');
                continue;
            }

            newImageFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setNewImages(prev => [...prev, ...newImageFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);

        // Limpiar input
        e.target.value = '';
    };

    // 🔹 Eliminar imagen nueva (no guardada aún)
    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // 🔹 Eliminar imagen existente de la galería
    const removeExistingImage = async (imageId: number, imageUrl: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

        try {
            // Extraer el path del storage de la URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `departments/${departmentId}/${fileName}`;

            // Eliminar del storage
            const { error: storageError } = await supabase.storage
                .from('images')
                .remove([filePath]);

            if (storageError) throw storageError;

            // Eliminar de la base de datos
            const { error: dbError } = await supabase
                .from('images')
                .delete()
                .eq('id', imageId);

            if (dbError) throw dbError;

            // Actualizar estado local
            setImages(prev => prev.filter(img => img.id !== imageId));

            // Si era la imagen principal, limpiar el campo
            if (department?.image_url === imageUrl) {
                setDepartment(prev => prev ? { ...prev, image_url: null } : null);
            }

        } catch (error) {
            console.error('Error eliminando imagen:', error);
            alert('Error al eliminar la imagen');
        }
    };

    // 🔹 Establecer imagen como principal
    const setPrimaryImage = async (imageUrl: string) => {
        if (!department) return;

        try {
            const { error } = await supabase
                .from('departments')
                .update({ image_url: imageUrl })
                .eq('id', departmentId);

            if (error) throw error;

            setDepartment(prev => prev ? { ...prev, image_url: imageUrl } : null);

        } catch (error) {
            console.error('Error estableciendo imagen principal:', error);
            alert('Error al establecer imagen principal');
        }
    };

    // 🔹 Subir modelo 3D
    const upload3DModel = async (file: File): Promise<string> => {
        const projectId = process.env.NEXT_PUBLIC_NEEDLE_PROJECT_ID;
        const apiToken = process.env.NEEDLE_API_TOKEN;

        if (!projectId || !apiToken) {
            throw new Error('Configuración de Needle no encontrada');
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`https://api.needle.tools/v1/projects/${projectId}/files`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error subiendo modelo 3D');

        return data.url;
    };

    // 🔹 Función principal para guardar
    const handleSave = async () => {
        if (!department) return;

        setLoading(true);
        setUploading(true);

        try {
            // 1️⃣ Actualizar datos básicos del departamento
            const { error: deptError } = await supabase
                .from('departments')
                .update({
                    name: department.name,
                    description: department.description,
                    price: department.price,
                    size: department.size,
                    street: department.street,
                    zone: department.zone,
                    floor: department.floor,
                    latitude: department.latitude,
                    longitude: department.longitude,
                    bed: department.bed,
                    bathrooms: department.bathrooms,
                    status: department.status,
                    // image_url se mantiene igual a menos que se cambie la imagen principal
                })
                .eq('id', departmentId);

            if (deptError) throw deptError;

            // 2️⃣ Subir nuevas imágenes y guardar en la galería
            if (newImages.length > 0) {
                const uploadPromises = newImages.map(async (file) => {
                    const imageUrl = await uploadImageToStorage(file);

                    const { error: imageError } = await supabase
                        .from('images')
                        .insert({
                            department_id: departmentId,
                            image_url: imageUrl
                        });

                    if (imageError) throw imageError;
                });

                await Promise.all(uploadPromises);
            }

            // 3️⃣ Subir nuevo modelo 3D si existe
            if (modelFile) {
                const modelUrl = await upload3DModel(modelFile);

                const { data: { user } } = await supabase.auth.getUser();

                const { error: modelError } = await supabase
                    .from('models')
                    .insert({
                        department_id: departmentId,
                        storage_url: modelUrl,
                        user_id: user?.id || null,
                    });

                if (modelError) throw modelError;
            }

            setUploading(false);
            alert('Departamento actualizado correctamente');
            router.push('/architect/apartments');

        } catch (error) {
            console.error('Error guardando departamento:', error);
            alert('Error al guardar los cambios');
            setUploading(false);
            setLoading(false);
        }
    };

    // Componentes auxiliares para inputs
    const InputField = ({ label, value, onChange, type = 'text', step }: {
        label: string;
        value: any;
        onChange: (v: any) => void;
        type?: string;
        step?: string;
    }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type={type}
                step={step}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    const TextareaField = ({ label, value, onChange }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
    }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    if (loading && !department) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-center mt-2">Cargando departamento...</p>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <p className="text-center text-red-600">Departamento no encontrado</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Departamento</h1>

            <div className="bg-white shadow rounded-lg p-6">
                {/* Información Básica */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Nombre del Departamento *"
                            value={department.name}
                            onChange={(v) => setDepartment({ ...department, name: v })}
                        />

                        <InputField
                            label="Precio (PEN) *"
                            type="number"
                            value={department.price}
                            onChange={(v) => setDepartment({ ...department, price: Number(v) })}
                        />

                        <InputField
                            label="Tamaño (m²)"
                            type="number"
                            value={department.size}
                            onChange={(v) => setDepartment({ ...department, size: v ? Number(v) : null })}
                        />

                        <InputField
                            label="Piso"
                            type="number"
                            value={department.floor}
                            onChange={(v) => setDepartment({ ...department, floor: v ? Number(v) : null })}
                        />

                        <InputField
                            label="Habitaciones"
                            type="number"
                            value={department.bed}
                            onChange={(v) => setDepartment({ ...department, bed: v ? Number(v) : null })}
                        />

                        <InputField
                            label="Baños"
                            type="number"
                            value={department.bathrooms}
                            onChange={(v) => setDepartment({ ...department, bathrooms: v ? Number(v) : null })}
                        />
                    </div>

                    <TextareaField
                        label="Descripción"
                        value={department.description || ''}
                        onChange={(v) => setDepartment({ ...department, description: v })}
                    />
                </div>

                {/* Ubicación */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ubicación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Calle"
                            value={department.street}
                            onChange={(v) => setDepartment({ ...department, street: v })}
                        />

                        <InputField
                            label="Zona/Distrito"
                            value={department.zone}
                            onChange={(v) => setDepartment({ ...department, zone: v })}
                        />

                        <InputField
                            label="Latitud"
                            type="number"
                            step="0.000001"
                            value={department.latitude}
                            onChange={(v) => setDepartment({ ...department, latitude: v ? Number(v) : null })}
                        />

                        <InputField
                            label="Longitud"
                            type="number"
                            step="0.000001"
                            value={department.longitude}
                            onChange={(v) => setDepartment({ ...department, longitude: v ? Number(v) : null })}
                        />
                    </div>
                </div>

                {/* Estado */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado</h2>
                    <select
                        className="block w-full md:w-64 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={department.status}
                        onChange={(e) => setDepartment({ ...department, status: e.target.value as any })}
                    >
                        <option value="available">Disponible</option>
                        <option value="reserved">Reservado</option>
                        <option value="sold">Vendido</option>
                    </select>
                </div>

                {/* Galería de Imágenes */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Galería de Imágenes</h2>

                    {/* Imágenes existentes */}
                    {images.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Imágenes existentes</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <img
                                            src={image.image_url}
                                            alt={`Imagen ${image.id}`}
                                            className={`w-full h-32 object-cover rounded-lg border-2 ${department.image_url === image.image_url
                                                ? 'border-blue-500'
                                                : 'border-gray-200'
                                                }`}
                                        />

                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimaryImage(image.image_url)}
                                                    className={`p-1 rounded ${department.image_url === image.image_url
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white text-gray-700'
                                                        }`}
                                                    title={
                                                        department.image_url === image.image_url
                                                            ? 'Imagen principal'
                                                            : 'Hacer principal'
                                                    }
                                                >
                                                    ⭐
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(image.id, image.image_url)}
                                                    className="p-1 bg-red-500 text-white rounded"
                                                    title="Eliminar imagen"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        {department.image_url === image.image_url && (
                                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                Principal
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agregar nuevas imágenes */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Agregar nuevas imágenes</h3>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    {/* Vista previa de nuevas imágenes */}
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-700 mb-2">Vista previa de nuevas imágenes</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded text-xs"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modelo 3D */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Modelo 3D</h2>

                    {/* Modelos existentes */}
                    {models.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Modelos existentes</h3>
                            {models.map((model) => (
                                <div key={model.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                    <ModelViewer url={model.storage_url} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Modelo 3D */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-3">Agregar nuevo modelo 3D</h3>
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            onChange={(e) => e.target.files && setModelFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {models.map((model) => (
                            <div key={model.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                <ModelViewer url={model.storage_url} />
                            </div>
                        ))}

                        {modelFile && (
                            <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Vista previa del nuevo modelo:</p>
                                <ModelViewer url={URL.createObjectURL(modelFile)} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/architect/apartments')}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || uploading}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Subiendo archivos...
                            </div>
                        ) : loading ? (
                            'Guardando...'
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}