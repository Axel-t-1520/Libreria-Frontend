import { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [vendedor, setVendedor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vendedorGuardado = localStorage.getItem('vendedor');
    const token = localStorage.getItem('token');
    
    if (vendedorGuardado && token) {
      setVendedor(JSON.parse(vendedorGuardado));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/vendedor/login', {
        email,
        password,
      });

      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('vendedor', JSON.stringify(data.vendedor));
      setVendedor(data.vendedor);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const logout = async () => {
  try {
    // Intentar cerrar sesión en el backend (opcional)
    await api.post('/api/vendedor/logout').catch(() => {
      // Ignorar errores del backend
    });
  } finally {
    // Siempre limpiar el frontend
    console.log('🚪 Cerrando sesión...'); // Debug
    localStorage.removeItem('token');
    localStorage.removeItem('vendedor');
    setVendedor(null);
    window.location.href = '/login'; // Forzar redirección
  }
};
  return (
    <AuthContext.Provider
      value={{
        vendedor,
        loading,
        login,
        logout,
        isAuthenticated: !!vendedor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};