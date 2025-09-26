// app/architect/dashboard/page.tsx
'use client';

export default function ArchitectDashboard() {
    // Datos de ejemplo - luego vendrán del backend
    const stats = [
        { name: 'Total Departamentos', value: '24', change: '+4', changeType: 'positive' },
        { name: 'Clientes Activos', value: '156', change: '+12', changeType: 'positive' },
        { name: 'Visitas este Mes', value: '1,234', change: '-3%', changeType: 'negative' },
        { name: 'Ingresos', value: '$45,230', change: '+12%', changeType: 'positive' },
    ];

    const recentActivity = [
        { id: 1, user: 'María González', action: 'Agregó nuevo departamento', time: 'Hace 2 horas' },
        { id: 2, user: 'Carlos López', action: 'Actualizó información', time: 'Hace 4 horas' },
        { id: 3, user: 'Ana Martínez', action: 'Subió nuevas fotos', time: 'Hace 1 día' },
        { id: 4, user: 'Pedro Sánchez', action: 'Completó perfil', time: 'Hace 2 días' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Resumen general de tu actividad y estadísticas.
                </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-base font-normal text-gray-900">{stat.name}</dt>
                            <dd className="mt-1 flex items-baseline justify-between">
                                <div className="flex items-baseline text-2xl font-semibold text-blue-600">
                                    {stat.value}
                                </div>
                                <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${stat.changeType === 'positive'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {stat.change}
                                </div>
                            </dd>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actividad Reciente */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Actividad Reciente</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Últimas acciones en el sistema.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {recentActivity.map((activity) => (
                                <li key={activity.id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-blue-600 truncate">
                                            {activity.user}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {activity.action}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Acciones Rápidas</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Accesos directos a funciones comunes.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    ➕ Nuevo Departamento
                                </button>
                                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                    👥 Gestionar Usuarios
                                </button>
                                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                    📊 Ver Reportes
                                </button>
                                <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                                    ⚙️ Configuración
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de ejemplo */}
            <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Visitas por Mes</h3>
                    <div className="mt-4 h-64 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">📈 Gráfico de visitas se integrará aquí</p>
                    </div>
                </div>
            </div>
        </div>
    );
}