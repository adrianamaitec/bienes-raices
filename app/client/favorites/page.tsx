"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Favorite {
  id: number;
  department: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tamano: number;
    calle: string;
    zona: string;
    piso: number;
    dormitorios: number;
    banos: number;
    latitud: number;
    longitud: number;
    url_imagen?: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = supabaseBrowser();

  useEffect(() => {
    const fetchFavorites = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select(
          "id, department:department_id ( id, nombre, precio, calle, zona, dormitorios, banos, tamano, url_imagen )",
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error al obtener favoritos:", error);
      } else {
        setFavorites((data as unknown as Favorite[]) || []);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando favoritos...
      </div>
    );

  if (!favorites.length)
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border max-w-3xl mx-auto mt-10">
        <div className="text-6xl mb-4">🤍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tienes propiedades favoritas aún
        </h3>
        <p className="text-gray-600 mb-6">
          Explora departamentos y agrega tus favoritos para verlos aquí.
        </p>
        <Link
          href="/client/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          🔍 Explorar Departamentos
        </Link>
      </div>
    );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(price);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Favoritos ❤️</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition"
          >
            <img
              src={fav.department.url_imagen || "/placeholder.jpg"}
              alt={fav.department.nombre}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link
                  href={`/client/apartments/${fav.department.id}`}
                  className="hover:text-blue-600"
                >
                  {fav.department.nombre}
                </Link>
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                📍 {fav.department.calle || "Dirección no disponible"}
              </p>
              <div className="text-blue-600 font-bold mb-3">
                {formatPrice(fav.department.precio)}
              </div>
              <div className="flex items-center text-sm text-gray-600 space-x-4 mb-3">
                <span>🛏️ {fav.department.dormitorios ?? "-"} hab.</span>
                <span>🚿 {fav.department.banos ?? "-"} baños</span>
                <span>📐 {fav.department.tamano ?? "-"} m²</span>
              </div>
              <Link
                href={`/client/apartments/${fav.department.id}`}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Ver Detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
