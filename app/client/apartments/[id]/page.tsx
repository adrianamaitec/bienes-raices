"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabaseBrowser } from "@/lib/supabase/client";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ModelViewer = dynamic(
  () => import("@/components/ModelViewer/ModelViewer"),
  {
    ssr: false,
  },
);

interface Property {
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
  images: string[];
  model_url?: string | null;
  architect?: {
    first_name: string | null;
    last_name: string | null;
    profile_image_url?: string | null;
    experience?: string | null;
    phone?: string | null;
  } | null;
}

export default function PropertyDetail() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "features" | "location" | "contact" | "model"
  >("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = supabaseBrowser();
  // ✅ Verificar si el usuario está logueado
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          checkIfFavorite(user.id);
        }
      };
      getUser();
      const { data: dept, error: deptError } = await supabase
        .from("departamentos")
        .select(
          `
    *,
    images ( image_url ),
    models ( storage_url ),
    users:arquitecto_id (
      first_name,
      last_name,
      profile_image_url,
      experience,
      phone,
      bio,
      linkedin
    )
  `,
        )
        .eq("id", params.id)
        .single();

      if (deptError || !dept) {
        console.error("Error cargando departamento:", deptError);
        setLoading(false);
        return;
      }

      const { data: images } = await supabase
        .from("images")
        .select("image_url")
        .eq("department_id", dept.id);

      const { data: model } = await supabase
        .from("models")
        .select("storage_url, user_id")
        .eq("department_id", dept.id)
        .maybeSingle();

      let architect = null;

      const { data: user } = await supabase
        .from("users")
        .select("first_name, last_name, profile_image_url, experience, phone")
        .eq("id", dept.arquitecto_id)
        .maybeSingle();
      architect = user;

      const propertyData: Property = {
        ...dept,
        images: images?.map((img) => img.image_url) || [],
        model_url: model?.storage_url || null,
        architect: architect || dept.users || null,
      };

      setProperty(propertyData);
      setLoading(false);
    };

    fetchProperty();
  }, [params.id]);

  // ✅ Revisar si ya es favorito
  const checkIfFavorite = async (uid: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", uid)
      .eq("department_id", params.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  // ✅ Alternar favorito
  const toggleFavorite = async () => {
    if (!userId) {
      alert("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    if (isFavorite) {
      // eliminar
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("department_id", params.id);
      if (!error) {
        setIsFavorite(false);
      }
    } else {
      // agregar
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, department_id: params.id });
      if (!error) {
        setIsFavorite(true);
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Cargando propiedad...
      </div>
    );

  if (!property)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Propiedad no encontrada 😕
      </div>
    );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/client/dashboard" className="hover:text-gray-700">
          Inicio
        </Link>
        <span>›</span>
        <Link href="/client/dashboard" className="hover:text-gray-700">
          Departamentos
        </Link>
        <span>›</span>
        <span className="text-gray-900">{property.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda */}
        <div className="lg:col-span-2">
          {/* Galería */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
            <div className="relative h-80 bg-gray-100 flex items-center justify-center text-6xl">
              {property.images.length > 0 ? (
                <img
                  src={property.images[activeImage]}
                  alt={property.nombre}
                  className="object-cover w-full h-full transition-all duration-300"
                />
              ) : property.url_imagen ? (
                <img
                  src={property.url_imagen}
                  alt={property.nombre}
                  className="object-cover w-full h-full"
                />
              ) : (
                "🏙️"
              )}
            </div>

            {/* Miniaturas */}
            {property.images.length > 1 && (
              <div className="p-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {property.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`h-20 rounded-md overflow-hidden border-2 ${
                      activeImage === index
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vista ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: "overview", name: "Descripción", icon: "📋" },
                  { id: "features", name: "Detalles", icon: "📐" },
                  { id: "location", name: "Ubicación", icon: "📍" },
                  { id: "model", name: "Modelo 3D", icon: "🎮" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Descripción
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {property.descripcion || "Sin descripción disponible."}
                  </p>
                </div>
              )}

              {activeTab === "features" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    🏠 <b>Piso:</b> {property.piso ?? "-"}
                  </div>
                  <div>
                    🛏️ <b>Habitaciones:</b> {property.dormitorios ?? "-"}
                  </div>
                  <div>
                    🚿 <b>Baños:</b> {property.banos ?? "-"}
                  </div>
                  <div>
                    📐 <b>Tamaño:</b>{" "}
                    {property.tamano ? `${property.tamano} m²` : "-"}
                  </div>
                  <div>
                    📍 <b>Zona:</b> {property.zona ?? "-"}
                  </div>
                </div>
              )}

              {activeTab === "location" && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ubicación
                  </h3>
                  <p className="mb-2 text-gray-700">
                    {property.calle || ""}{" "}
                    {property.zona ? `- ${property.zona}` : ""}
                  </p>
                  {property.latitud && property.longitud ? (
                    <iframe
                      className="mt-2 rounded-lg w-full h-80 border"
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${property.latitud},${property.longitud}&hl=es;z=16&output=embed`}
                    ></iframe>
                  ) : (
                    <p className="text-gray-500">
                      No hay coordenadas de ubicación disponibles.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "model" && property.model_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Modelo 3D
                  </h3>
                  <div style={{ height: "500px" }}>
                    <ModelViewer url={property.model_url} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {property.architect && (
            <div className="flex items-center space-x-6">
                <img
                  src={property.architect.profile_image_url || ""}
                  alt="Arquitecto"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 center"
                />
              <div>
                <h3 className="font-semibold text-lg mb-1 ">
                  {property.architect.first_name} {property.architect.last_name}
                </h3>
                <p className="text-gray-600 ">{property.architect.experience}</p>
                <p className="text-gray-600">{property.architect.phone}</p>
              </div>

            </div>
          )}

          <div className="grid grid-cols-2 gap-2  p-4 mt-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                {formatPrice(Number(property.precio))}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{property.calle}</p>
            </div>
            <div className="flex justify-end row-span-2 mb-8">
              <button
                onClick={toggleFavorite}
                className={`text-2xl transition ${
                  isFavorite
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                {isFavorite ? <FaHeart className="text-red-500 w-10 h-10" /> : <FaRegHeart className="text-gray-400 hover:text-red-500 w-10 h-10" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
