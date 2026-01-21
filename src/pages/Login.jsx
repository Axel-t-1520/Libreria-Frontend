import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Eye, EyeOff, AlertCircle, LogIn, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [view, setView] = useState('login'); // 'login' | 'recover'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // Para mensaje de recuperación
  const [loading, setLoading] = useState(false);
  
  // Traemos las funciones que creamos en el AuthContext
  const { login, recuperarPassword } = useAuth();
  const navigate = useNavigate();

  // --- MANEJO DE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llama a la ruta /vendedor/login via Context
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/'); // Redirige al Dashboard
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- MANEJO DE RECUPERACIÓN ---
  const handleRecovery = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Llama a la ruta /vendedor/recuperar-password via Context
      const result = await recuperarPassword(email);
      
      if (result.success) {
        setSuccessMsg('Se ha enviado un enlace a tu correo.');
        setTimeout(() => setView('login'), 3000); // Volver al login después de 3s
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al intentar recuperar contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      
      <div className="w-full max-w-md w-full animate-in fade-in zoom-in duration-300">
        
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-200 transform transition-transform hover:scale-105">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Librería T&M</h1>
          <p className="text-gray-600">
            {view === 'login' ? 'Bienvenido de nuevo' : 'Recuperar acceso'}
          </p>
        </div>

        {/* Card del Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          
          {/* Mensajes de Error o Éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6 animate-pulse">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700 text-sm font-medium text-center">
              {successMsg}
            </div>
          )}

          {/* === VISTA DE LOGIN === */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-field" // Asume que tienes clases CSS o usa las largas de Tailwind
                  placeholder="ejemplo@libreria.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-field pr-12"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-green-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => { setError(''); setView('recover'); }}
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
              >
                {loading ? 'Verificando...' : <><LogIn size={20} /> Iniciar Sesión</>}
              </button>
            </form>
          )}

          {/* === VISTA DE RECUPERAR CONTRASEÑA === */}
          {view === 'recover' && (
            <form onSubmit={handleRecovery} className="space-y-6">
              <p className="text-sm text-gray-500 mb-4">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full input-field"
                  placeholder="ejemplo@libreria.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5"
              >
                {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
              </button>

              <button 
                type="button"
                onClick={() => { setError(''); setSuccessMsg(''); setView('login'); }}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium py-2"
              >
                <ArrowLeft size={18} /> Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400 font-medium">
               Librería T&M &copy; {new Date().getFullYear()}
             </p>
          </div>
        </div>
      </div>

      {/* Estilos locales para mantener el código limpio */}
      <style>{`
        .input-field {
          @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 focus:bg-white;
        }
        .btn-primary {
          @apply bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none;
        }
      `}</style>
    </div>
  );
};

export default Login;