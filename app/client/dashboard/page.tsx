// app/client/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Pagination, PaginationItem } from "@heroui/react";

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
  status: "available" | "sold" | "reserved";
  architect: string;
  vrTour: boolean;
}

export default function ClientDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    bedrooms: "all",
    minArea: 0,
    maxArea: 500,
    sortBy: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = supabaseBrowser();
        setLoading(true);
        // Traer departamentos y modelos asociados
        const { data: depts, error: deptError } = await supabase
          .from("departamentos")
          .select(
            `
    *,
    users:arquitecto_id (
      first_name,
      last_name
    ),
    models ( storage_url )
  `,
          )
          .order("creado_en", { ascending: false });

        if (deptError) throw deptError;

        // Mapear a la estructura Property
        const mapped: Property[] = (depts || []).map((d: any) => ({
          id: d.id,
          name: d.nombre || "Departamento Sin Nombre",
          address: [d.calle, d.zona].filter(Boolean).join(", "),
          price: Number(d.precio) || 0,
          area: d.tamano || 0,
          bedrooms: d.dormitorios || 0,
          bathrooms: d.banos || 0,
          images: d.url_imagen ? [d.url_imagen] : [],
          isFavorite: false, // implementar por usuario si lo necesitas
          features:
            d.descripcion && Array.isArray(d.descripcion) ? d.descripcion : [], // si tienes un campo features JSON/texto
          status: d.estatus || "available",
          architect: d.users
            ? `${d.users.first_name ?? ""} ${d.users.last_name ?? ""}`.trim()
            : "No asignado",
          vrTour: Boolean(d.models && d.models.length > 0),
        }));
        console.log("Fetched properties:", mapped);
        setProperties(mapped);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filtrar y ordenar en cliente (igual que tu mock original)
  const filteredProperties = properties
    .filter(
      (property) =>
        (property.name || ``)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (property.address || ``)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (property.features || []).some((feature) =>
          feature.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
    .filter((property) => {
      if (filters.bedrooms !== "all") {
        // soporta "3" como 3 habitaciones o "3+" — en tu UI usas 3+ texto, así que aquí asumimos igualdad numérica
        if (filters.bedrooms === "3" && property.bedrooms < 3) return false;
        if (
          filters.bedrooms !== "3" &&
          property.bedrooms !== parseInt(filters.bedrooms)
        )
          return false;
      }
      if (property.area < filters.minArea || property.area > filters.maxArea) {
        return false;
      }
      if (
        property.price < filters.priceRange[0] ||
        property.price > filters.priceRange[1]
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "area":
          return b.area - a.area;
        default:
          return b.id - a.id; // newest first (según id)
      }
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
    }).format(price);
  };
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading)
    return <div className="text-center py-12">Cargando departamentos...</div>;

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Encuentra tu Departamento Ideal
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explora nuestra selección de departamentos exclusivos con tours
          virtuales en 3D.
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
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

          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <span className="mr-2">⚙️</span> Filtros
            </button>

            <select
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
            >
              <option value="newest">Más recientes</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="area">Área: mayor a menor</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Precio
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: [
                        parseInt(e.target.value) || 0,
                        filters.priceRange[1],
                      ],
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Máx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priceRange: [
                        filters.priceRange[0],
                        parseInt(e.target.value) || 1000000,
                      ],
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Habitaciones
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.bedrooms}
                onChange={(e) =>
                  setFilters({ ...filters, bedrooms: e.target.value })
                }
              >
                <option value="all">Todas</option>
                <option value="1">1 habitación</option>
                <option value="2">2 habitaciones</option>
                <option value="3">3+ habitaciones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área Mínima (m²)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.minArea}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minArea: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área Máxima (m²)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={filters.maxArea}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxArea: parseInt(e.target.value) || 1000,
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {filteredProperties.length} Departamentos Encontrados
        </h2>
        <div className="text-sm text-gray-600">
          Ordenado por:{" "}
          {filters.sortBy === "newest"
            ? "Más recientes"
            : filters.sortBy === "price-low"
              ? "Precio menor"
              : filters.sortBy === "price-high"
                ? "Precio mayor"
                : "Área mayor"}
        </div>
      </div>

      {/* Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 bg-gray-200 flex items-center justify-center text-white text-6xl overflow-hidden">
                {property.images.length > 0 ? (
                  // imagen principal
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">🏠</div>
                )}
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
              </div>

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

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>🛏️ {property.bedrooms} hab.</span>
                  <span>🚿 {property.bathrooms} baños</span>
                  <span>📐 {property.area} m²</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {property.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                  {property.features.length > 3 && (
                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      +{property.features.length - 3} más
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Arquitecto:{" "}
                  <span className="font-medium">{property.architect}</span>
                </div>

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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron departamentos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilters({
                priceRange: [0, 1000000],
                bedrooms: "all",
                minArea: 0,
                maxArea: 500,
                sortBy: "newest",
              });
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            showControls
            siblings={1}
            boundaries={1}
            radius="full"
            variant="light"
            classNames={{
              wrapper: "flex items-center",
              item: "flex items-center justify-center w-10 h-10 text-sm bg-gray-100 font-medium rounded-full text-primary hover:bg-primary/10 transition-all",
              cursor: "bg-primary text-white shadow-md",
              prev: "flex items-center justify-center w-10 h-10 text-primary hover:bg-primary/10 rounded-full",
              next: "flex items-center justify-center w-10 h-10 text-primary hover:bg-primary/10 rounded-full",
            }}
            renderItem={(item) => {
              const { key, ...props } = item;

              if (item.value === "prev") {
                return (
                  <PaginationItem key={key} {...props}>
                    &lt;
                  </PaginationItem>
                );
              }

              if (item.value === "next") {
                return (
                  <PaginationItem key={key} {...props}>
                    &gt;
                  </PaginationItem>
                );
              }

              return <PaginationItem key={key} {...props} />;
            }}
          />
        </div>
      )}
    </div>
  );
}
