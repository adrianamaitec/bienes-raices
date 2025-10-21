export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-3xl font-bold text-red-600 mb-2">Acceso denegado 🚫</h1>
      <p className="text-gray-700">No tienes permiso para acceder a esta página.</p>
    </div>
  );
}
