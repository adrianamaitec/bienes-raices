// app/architect/properties/new/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

interface ImageFile {
  file: File;
  preview: string;
  isPrimary: boolean;
}

export default function NewProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = supabaseBrowser();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    street: "",
    zone: "",
    floor: "",
    latitude: "",
    longitude: "",
    bed: "",
    bathrooms: "",
    status: "available" as "available" | "sold" | "reserved",
  });

  // 🔹 Función para subir imagen al storage
  const uploadImageToStorage = async (
    file: File,
    departmentId: number
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${departmentId}/${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `departments/${fileName}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      console.error("Error subiendo imagen:", error);
      throw error;
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return publicUrl;
  };

  // 🔹 Manejar selección de archivos
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten archivos de imagen");
        continue;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        continue;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        isPrimary: images.length === 0 && newImages.length === 0, // La primera imagen es principal
      });
    }

    setImages((prev) => [...prev, ...newImages]);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 🔹 Eliminar imagen
  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Si eliminamos la imagen principal, hacer la siguiente principal
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  // 🔹 Marcar como imagen principal
  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Por favor, selecciona al menos una imagen");
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // 1️⃣ Crear el departamento sin imagen aún
      const { data: departmentData, error: departmentError } = await supabase
        .from("departments")
        .insert({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          size: formData.size ? parseInt(formData.size) : null,
          street: formData.street || null,
          zone: formData.zone || null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          bed: formData.bed ? parseInt(formData.bed) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          status: formData.status,
          image_url: null,
        })
        .select()
        .single();

      if (departmentError) throw departmentError;

      const departmentId = departmentData.id;
      console.log("✅ Departamento creado con ID:", departmentId);

      // 2️⃣ Subir imágenes secuencialmente (no Promise.all)
      let primaryImageUrl: string | null = null;

      for (const img of images) {
        const imageUrl = await uploadImageToStorage(img.file, departmentId);

        const { error: imageError } = await supabase.from("images").insert({
          department_id: departmentId,
          image_url: imageUrl,
        });

        if (imageError) throw imageError;

        if (img.isPrimary) {
          primaryImageUrl = imageUrl;
        }
      }

      // 3️⃣ Si no se marcó ninguna principal, usar la primera
      if (!primaryImageUrl && images.length > 0) {
        const firstImageUrl = await uploadImageToStorage(
          images[0].file,
          departmentId
        );
        primaryImageUrl = firstImageUrl;
      }

      // 4️⃣ Actualizar departamento con la imagen principal
      if (primaryImageUrl) {
        const { error: updateError } = await supabase
          .from("departments")
          .update({ image_url: primaryImageUrl })
          .eq("id", departmentId);

        if (updateError) throw updateError;
      }

      alert("Departamento creado correctamente");
      router.push("/architect/apartments");
    } catch (error) {
      console.error("💥 Error al crear el departamento:", error);
      alert("Error al crear el departamento");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Limpiar URLs de preview al desmontar
  useState(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Departamento</h1>
        <p className="mt-2 text-sm text-gray-700">
          Completa la información del nuevo departamento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {/* Sección de Imágenes */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Imágenes del Departamento
          </h3>

          {/* Input para subir imágenes */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer block">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-gray-600 mb-1">
                Haz clic para seleccionar imágenes
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
            </label>
          </div>

          {/* Vista previa de imágenes */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className={`w-full h-32 object-cover rounded-lg border-2 ${
                      img.isPrimary ? "border-blue-500" : "border-gray-200"
                    }`}
                  />

                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        className={`p-1 rounded ${
                          img.isPrimary
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700"
                        }`}
                        title={
                          img.isPrimary ? "Imagen principal" : "Hacer principal"
                        }
                      >
                        ⭐
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-1 bg-red-500 text-white rounded"
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Badge de imagen principal */}
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Información */}
          <div className="mt-4 text-sm text-gray-600">
            <p>• La primera imagen se marcará como principal automáticamente</p>
            <p>• Puedes cambiar la imagen principal haciendo clic en ⭐</p>
            <p>• Mínimo 1 imagen, máximo 10 imágenes</p>
          </div>
        </div>

        {/* Resto del formulario (igual que antes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Básica
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Departamento *
            </label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Departamento Moderno en Miraflores"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe las características del departamento..."
            />
          </div>

          {/* Precio y Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (PEN) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.price}
              onChange={handleChange}
              placeholder="250000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="status"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
            </select>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño (m²)
            </label>
            <input
              type="number"
              name="size"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.size}
              onChange={handleChange}
              placeholder="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habitaciones
            </label>
            <input
              type="number"
              name="bed"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.bed}
              onChange={handleChange}
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baños
            </label>
            <input
              type="number"
              name="bathrooms"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piso
            </label>
            <input
              type="number"
              name="floor"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.floor}
              onChange={handleChange}
              placeholder="5"
            />
          </div>

          {/* Ubicación */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">
              Ubicación
            </h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calle
            </label>
            <input
              type="text"
              name="street"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.street}
              onChange={handleChange}
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona/Distrito
            </label>
            <input
              type="text"
              name="zone"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.zone}
              onChange={handleChange}
              placeholder="Miraflores"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitud
            </label>
            <input
              type="number"
              name="latitude"
              step="any"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="-12.123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <input
              type="number"
              name="longitude"
              step="any"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="-77.123456"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push("/architect/apartments")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subiendo imágenes...
              </div>
            ) : loading ? (
              "Guardando..."
            ) : (
              "Guardar Departamento"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
