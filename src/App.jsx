import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Productos';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';

// --- 1. COMPONENTE RUTA PRIVADA (Está perfecto) ---
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// --- 2. COMPONENTE PRINCIPAL APP (Corregido) ---
function App() {
  return (
    // 1. Router va PRIMERO (Engloba todo)
    <BrowserRouter>
      {/* 2. AuthProvider va SEGUNDO (Para tener acceso a navegación y proteger rutas) */}
      <AuthProvider>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            }
          />
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Customers />
              </PrivateRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <PrivateRoute>
                <Sales />
              </PrivateRoute>
            }
          />
          <Route
            path="/facturas"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />
          
          {/* Ruta por defecto (opcional): Redirigir cualquier URL desconocida a Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;