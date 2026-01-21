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

  // 1. VERIFICAR SESIÓN AL CARGAR (Más seguro que solo leer localStorage)
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('token');
      
      // Si no hay token, no estamos logueados
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Le preguntamos al backend: "¿Este token sigue siendo válido?"
        // Asegúrate de que tu backend devuelva el objeto del vendedor en esta ruta
        const { data } = await api.get('/api/vendedor/me');
        
        // Si responde bien, actualizamos el estado con datos frescos
        setVendedor(data); 
      } catch (error) {
        console.error("Sesión expirada o inválida:", error);
        // Si el token no sirve, limpiamos todo
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor');
        setVendedor(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  // 2. FUNCIÓN LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/vendedor/login', {
        email,
        password,
      });

      // Guardamos el token (ajusta 'data.token' según lo que devuelva tu backend exacto)
      const token = data.token || data.session?.access_token;
      
      localStorage.setItem('token', token);
      localStorage.setItem('vendedor', JSON.stringify(data.vendedor));
      
      setVendedor(data.vendedor);

      return { success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.response?.data?.message || 'Credenciales incorrectas o error de servidor',
      };
    }
  };

  // 3. FUNCIÓN LOGOUT
  const logout = async () => {
    try {
      // Intentar avisar al backend (opcional pero recomendado)
      await api.post('/api/vendedor/logout');
    } catch (error) {
      console.warn('Error al notificar logout al backend', error);
    } finally {
      // Limpieza del Frontend (Esto es lo importante)
      console.log('🚪 Cerrando sesión...');
      localStorage.removeItem('token');
      localStorage.removeItem('vendedor');
      setVendedor(null);
      // No usamos window.location.href aquí para que React Router maneje la redirección suavemente
      // si estás protegiendo las rutas con un componente PrivateRoute.
    }
  };

  // 4. FUNCIÓN RECUPERAR PASSWORD (Nueva)
  const recuperarPassword = async (email) => {
    try {
      await api.post('/api/vendedor/recuperar-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar el correo de recuperación'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        vendedor,
        loading,
        login,
        logout,
        recuperarPassword,
        isAuthenticated: !!vendedor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};