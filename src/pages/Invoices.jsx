import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { formatDateTime } from '../utils/format';
import { Link, useLocation } from "react-router-dom";
import { 
  FileText, 
  Search, 
  Menu,
  X,
  LogOut,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Download,
  Calendar,
  User,
  UserMinus2,
  ChevronRight,
} from 'lucide-react';

// --- SIDEBAR (Se mantiene igual) ---
const Sidebar = ({ sidebarOpen, setSidebarOpen, vendedor, logout }) => (
  <>
    {sidebarOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <aside className={`
      fixed lg:static top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      shrink-0
    `}>
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
          <div className="text-xs text-gray-500 uppercase mb-3 font-semibold">General</div>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/productos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Package size={20} />
            <span>Productos</span>
          </Link>
          <Link to="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Users size={20} />
            <span>Clientes</span>
          </Link>
          <Link to="/ventas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            <span>Nueva Venta</span>
          </Link>
          <Link to="/facturas" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white">
            <FileText size={20} />
            <span>Facturas</span>
          </Link>
        </nav>
      </div>

      <div className="p-6 border-t border-gray-800 bg-gray-900">
        <div className="p-4 bg-gray-800 rounded-lg mb-3">
          <p className="text-sm font-medium truncate">{vendedor?.nombre} {vendedor?.apellido}</p>
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

const Invoices = () => {
  const { vendedor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/list/facturas');
      setFacturas(data.facturas || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = (facturaId) => {
    window.open(`${import.meta.env.VITE_API_URL}/api/factura/${facturaId}`, '_blank');
  };

  const filteredFacturas = facturas.filter(f => 
    f.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.Cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.Cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Facturas</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Contenido Principal con Scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Historial de Facturas</h1>
                <p className="text-gray-600">Consulta y descarga facturas anteriores</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por código o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : filteredFacturas.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500 font-medium">
                  Mostrando {filteredFacturas.length} de {facturas.length} facturas
                </div>

                {/* --- AQUÍ EMPIEZA LA VISTA DE LISTA/TABLA --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap text-left">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Código / ID
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Fecha de Emisión
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Descargar
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredFacturas.map((factura) => (
                          <tr key={factura.id} className="hover:bg-gray-50 transition-colors group">
                            {/* Columna Código */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                                  <FileText size={16} />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{factura.codigo}</div>
                                  <div className="text-xs text-gray-400">#{factura.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Columna Cliente */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-gray-100 rounded-full">
                                  <User size={14} className="text-gray-500" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">
                                  {factura.Cliente?.nombre} {factura.Cliente?.apellido}
                                </span>
                              </div>
                            </td>

                            {/* Columna Fecha */}
                            <td className="px-6 py-4">
                              {factura.fecha ? (
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <Calendar size={16} className="text-gray-400" />
                                  <span>{formatDateTime(factura.fecha)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>

                            {/* Columna Acciones */}
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => descargarPDF(factura.id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                title="Descargar PDF"
                              >
                                <Download size={16} />
                                <span className="hidden sm:inline">PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoices;