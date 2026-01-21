import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { vendedor, loading } = useAuth(); // Asumo que usas 'vendedor' como usuario

  // 1. Si aún está verificando sesión, mostramos un spinner
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );

  // 2. Si NO hay vendedor (no está logueado), lo mandamos al Login
  if (!vendedor) return <Navigate to="/login" replace />;

  // 3. Si SÍ hay vendedor, dejamos pasar (renderizamos la ruta hija)
  return <Outlet />;
};

export default ProtectedRoute;