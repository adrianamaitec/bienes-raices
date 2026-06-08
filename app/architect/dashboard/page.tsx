"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import DepartmentsByZoneChart from "@/components/Chart/DepartmentsByZoneChart";
import DepartmentStatusChart from "@/components/Chart/DepartmentStatusChart";
import { FaBuilding, FaPlus } from "react-icons/fa";

export default function ArchitectDashboard() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalDepartamentos, setTotalDepartamentos] = useState(0);
  const [porEstado, setPorEstado] = useState<any[]>([]);
  const [porZona, setPorZona] = useState<any[]>([]);
  const estadoLabel: Record<string, string> = {
    available: "Disponible",
    reserved: "Reservado",
    sold: "Vendido",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 🔹 Total de departamentos
      const { count } = await supabase
        .from("departamentos")
        .select("*", { count: "exact", head: true });

      setTotalDepartamentos(count ?? 0);

      // 🔹 Departamentos por estado
      const { data } = await supabase
        .from("departamentos_por_estado")
        .select("estado, total");

      const formattedData =
        data?.map((e) => ({
          estado: estadoLabel[e.estado] ?? e.estado,
          total: e.total,
        })) ?? [];

      setPorEstado(formattedData);
      // 🔹 Departamentos por zona
      const { data: zonaData } = await supabase
        .from("departamentos_por_zona")
        .select("zona, total");

      setPorZona(
        zonaData?.map((z) => ({
          zona: z.zona || "Sin zona",
          total: z.total,
        })) ?? [],
      );

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Cargando dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Resumen de tu actividad como arquitecto
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Departamentos</p>
          <p className="text-3xl font-bold text-blue-600">
            {totalDepartamentos}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Departamentos por Estado</h3>
          <DepartmentStatusChart data={porEstado} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Departamentos por Zona</h3>
          <DepartmentsByZoneChart data={porZona} />
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/architect/departments/new")}
            className="bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-blue-700 inline-flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium shadow-sm"
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Nuevo Departamento</span>
          </button>

          <button
            onClick={() => router.push("/architect/apartments")}
            className="bg-green-600 text-white py-2 px-3 sm:px-4 rounded-md hover:bg-green-700 inline-flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium shadow-sm"
          >
            <FaBuilding className="w-3 h-3 sm:w-4 sm:h-4" />
            Mis Departamentos
          </button>
        </div>
      </div>
    </div>
  );
}
