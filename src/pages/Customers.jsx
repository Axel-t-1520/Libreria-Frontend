import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Menu,
  X,
  LogOut,
  TrendingUp,
  ShoppingCart,
  Package,
  Phone,
  CreditCard,
  FileText,
  Calendar
} from "lucide-react";
import { formatDate, formatDateTime } from "../utils/format";

// --- 1. SIDEBAR OPTIMIZADO (Flexbox) ---
const Sidebar = ({ sidebarOpen, setSidebarOpen, vendedor, logout }) => (
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
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/productos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Package size={20} />
            <span>Productos</span>
          </Link>
          <Link to="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white">
            <Users size={20} />
            <span>Clientes</span>
          </Link>
          <Link to="/ventas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            <span>Ventas</span>
          </Link>
          <Link to="/facturas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
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

const CustomerModal = ({ isOpen, onClose, customer, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    ci: "",
    telefono: "",
    fecha_registro:""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        ci: "",
        telefono: "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? "Editar Cliente" : "Nuevo Cliente"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
                placeholder="Juan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CI *</label>
            <input
              type="text"
              value={formData.ci}
              onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="70123456"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Guardando..." : customer ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Customers = () => {
  const { vendedor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/client");
      setClientes(data.clientes || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedCustomer) {
        await api.put(`/api/upclient/${selectedCustomer.id}`, formData);
      } else {
        await api.post("/api/registclient", formData);
      }
      setModalOpen(false);
      setSelectedCustomer(null);
      cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert(error.response?.data?.message || "Error al guardar cliente");
    }
  };

  const handleDeleteClick = (cliente) => {
    setCustomerToDelete(cliente);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/delclient/${customerToDelete.id}`);
      cargarClientes();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el cliente");
    } finally {
      setConfirmDelete(false);
    }
  };

  const filteredCustomers = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ci?.toString().includes(searchTerm),
  );

  return (
    // --- 2. CONTENEDOR PRINCIPAL FLEX (Full Height) ---
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        vendedor={vendedor}
        logout={logout}
      />

      {/* --- 3. ÁREA DE CONTENIDO (Flex Grow + Scroll Interno) --- */}
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
            <span className="font-bold text-gray-900">Clientes</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Clientes
                </h1>
                <p className="text-gray-600">Gestiona tu base de clientes</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                <span>Nuevo Cliente</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o CI..."
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
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  {searchTerm
                    ? "No se encontraron clientes que coincidan"
                    : "Aún no hay clientes registrados"}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500 font-medium">
                  Mostrando {filteredCustomers.length} de {clientes.length} clientes
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            CI
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Teléfono
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Fecha_Registro
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.map((cliente) => (
                          <tr
                            key={cliente.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-green-700 font-bold text-sm">
                                    {cliente.nombre?.[0]}{cliente.apellido?.[0]}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {cliente.nombre} {cliente.apellido}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: #{cliente.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 bg-gray-50 w-fit px-2 py-1 rounded text-gray-700">
                                <CreditCard size={14} className="text-gray-400" />
                                <span className="text-sm font-medium">
                                  {cliente.ci}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {cliente.telefono ? (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Phone size={14} className="text-gray-400" />
                                  <span className="text-sm">
                                    {cliente.telefono}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No registrado</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 bg-gray-50 w-fit px-2 py-1 rounded text-gray-700">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-sm font-medium">
                                  {formatDateTime(cliente.fecha_registro)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedCustomer(cliente);
                                    setModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(cliente)}
                                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
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

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar cliente?"
        message={`¿Estás seguro de eliminar a "${customerToDelete?.nombre} ${customerToDelete?.apellido}"? Esta acción no se puede deshacer.`}
        type="danger"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Customers;