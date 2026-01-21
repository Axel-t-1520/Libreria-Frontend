import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { formatCurrency, formatDate } from "../utils/format";
import { Link, useLocation } from "react-router-dom"; // Importante: Link y useLocation
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  UserMinus2,
  FileText,
  Calendar
} from "lucide-react";

// =========================================================
// 1. COMPONENTE SIDEBAR (Movido AFUERA de Dashboard)
// =========================================================
const Sidebar = ({ sidebarOpen, setSidebarOpen, vendedor, logout }) => {
  const location = useLocation(); // Hook para saber dónde estamos

  // Función para pintar activo el botón
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? "bg-green-600 text-white shadow-md" 
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        shrink-0
      `}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package size={24} />
            </div>
            <span className="text-xl font-bold">Librería T&M</span>
          </div>

          <nav className="space-y-1">
            <div className="text-xs text-gray-500 uppercase mb-3 font-semibold">
              General
            </div>
            {/* USAMOS LINK PARA NO RECARGAR LA PÁGINA */}
            <Link to="/" className={getLinkClass("/")}>
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </Link>
            <Link to="/productos" className={getLinkClass("/productos")}>
              <Package size={20} />
              <span>Productos</span>
            </Link>
            <Link to="/clientes" className={getLinkClass("/clientes")}>
              <Users size={20} />
              <span>Clientes</span>
            </Link>
            <Link to="/ventas" className={getLinkClass("/ventas")}>
              <ShoppingCart size={20} />
              <span>Ventas</span>
            </Link>
            <Link to="/facturas" className={getLinkClass("/facturas")}>
              <FileText size={20} />
              <span>Facturas</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-900">
          <div className="p-4 bg-gray-800 rounded-lg mb-3">
            <p className="text-sm font-medium truncate">
              {vendedor?.nombre} {vendedor?.apellido}
            </p>
            <p className="text-xs text-gray-400 truncate">{vendedor?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// =========================================================
// 2. COMPONENTE STAT CARD (Movido AFUERA de Dashboard)
// =========================================================
const StatCard = ({ title, value, change, label, icon: Icon, type = "neutral" }) => {
  const isPositive = type === "positive";
  const isNegative = type === "negative";

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3 lg:mb-4">
        <div className={`p-2 lg:p-3 rounded-lg ${
            title.includes("Mes") || title.includes("Inventario") ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
        }`}>
          <Icon size={20} />
        </div>
        
        {change && (
          <div className={`flex items-center gap-1 text-xs lg:text-sm font-medium ${
            isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"
          }`}>
            {type !== "neutral" && (
                <TrendingUp size={14} className={isPositive ? "" : "rotate-180"} />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs lg:text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
        {label && <p className="text-xs text-gray-400 mt-1">{label}</p>}
      </div>
    </div>
  );
};

// =========================================================
// 3. COMPONENTE PRINCIPAL DASHBOARD
// =========================================================
const Dashboard = () => {
  const { vendedor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- ESTADOS DE DATOS ---
  const [loading, setLoading] = useState(true);
  const [statsHoy, setStatsHoy] = useState(null);
  const [ventas7Dias, setVentas7Dias] = useState([]);
  const [statsMes, setStatsMes] = useState(null);
  const [comparacion, setComparacion] = useState(null);
  const [totalProductos, setTotalProductos] = useState(0);

  useEffect(() => {
    cargarDatosCompletos();
  }, []);

  const cargarDatosCompletos = async () => {
    try {
      setLoading(true);
      const [resHoy, res7Dias, resMes, resComparacion, resProductos] = await Promise.all([
        api.get("/api/ventas/realizadas"),   
        api.get("/api/ventas7dias"),         
        api.get("/api/ventasMes"),          
        api.get("/api/ventasvs"),
        api.get("/api/productosTotal")  
      ]);

      setStatsHoy(resHoy.data.estadisticas);
      setVentas7Dias(res7Dias.data.datos || []);
      setStatsMes(resMes.data);
      setComparacion(resComparacion.data);
      setTotalProductos(resProductos.data.total);

    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComparacionVentas = () => {
    if (!comparacion) return { text: "0%", type: "neutral" };
    const tendencia = comparacion.comparacion.tendencia;
    const porcentaje = comparacion.comparacion.porcentaje_cambio;
    
    return {
        text: `${porcentaje}`,
        type: tendencia === 'subida' ? 'positive' : tendencia === 'bajada' ? 'negative' : 'neutral'
    };
  };

  const getComparacionMonto = () => {
    if (!comparacion || comparacion.ayer.monto === 0) return { text: "N/A", type: "neutral" };
    const hoy = comparacion.hoy.monto;
    const ayer = comparacion.ayer.monto;
    const diffPorcentaje = ((hoy - ayer) / ayer) * 100;
    
    return {
        text: `${diffPorcentaje.toFixed(1)}%`,
        type: diffPorcentaje > 0 ? 'positive' : diffPorcentaje < 0 ? 'negative' : 'neutral'
    };
  };

  const compVentas = getComparacionVentas();
  const compMonto = getComparacionMonto();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        vendedor={vendedor}
        logout={logout}
      />

      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Librería T&M</span>
          </div>
          <div className="w-10" />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto pb-6">
            
            {/* Header */}
            <div className="mb-6 lg:mb-8 w-full">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {vendedor?.nombre} 👋
              </h1>
              <p className="text-sm lg:text-base text-gray-600">
                Resumen de actividad - {new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <StatCard
                title="Ventas Hoy"
                value={statsHoy?.total_ventas || 0}
                change={compVentas.text}
                type={compVentas.type}
                label="Vs. ayer"
                icon={ShoppingCart}
              />
              <StatCard
                title="Ingresos Hoy"
                value={formatCurrency(statsHoy?.monto_total || 0)}
                change={compMonto.text}
                type={compMonto.type}
                label="Vs. ayer"
                icon={DollarSign}
              />
              <StatCard
                title={`Ingresos ${statsMes?.mes || 'Mes'}`}
                value={formatCurrency(statsMes?.monto_total || 0)}
                label={`${statsMes?.total_ventas || 0} ventas totales`}
                type="neutral"
                icon={Calendar}
              />
              <StatCard
                title="Inventario"
                value={totalProductos}
                label="Productos registrados"
                type="neutral"
                icon={Package}
              />
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  Tendencia últimos 7 Días
                </h2>
              </div>
              {ventas7Dias.length > 0 ? (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ventas7Dias} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="fecha" stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(fecha) => { const date = new Date(fecha); return `${date.getDate()}/${date.getMonth() + 1}`; }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value, name) => [name === "monto_total" ? formatCurrency(value) : value, name === "monto_total" ? "Ingresos" : "Ventas"]} labelFormatter={(fecha) => formatDate(fecha)} />
                      <Line type="monotone" dataKey="total_ventas" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Ventas" />
                      <Line type="monotone" dataKey="monto_total" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No hay datos suficientes para mostrar la gráfica
                </div>
              )}
            </div>

            {/* Acciones Rápidas con LINK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <Link to="/ventas" className="group block">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 lg:p-6 text-white shadow-lg hover:shadow-green-200 hover:-translate-y-1 transition-all duration-200 h-full">
                  <div className="bg-white/20 w-fit p-3 rounded-lg mb-4">
                    <ShoppingCart size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Nueva Venta</h3>
                  <p className="text-green-100 text-sm mb-4">Registra una nueva venta</p>
                  <span className="inline-flex items-center text-sm font-medium bg-white/20 px-3 py-1 rounded-lg group-hover:bg-white group-hover:text-green-600 transition-colors">
                    Ir a Ventas →
                  </span>
                </div>
              </Link>
              {/* ... Repetir Links para Productos y Clientes ... */}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;