import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { formatCurrency } from "../utils/format";
import { Link, useLocation } from "react-router-dom"; // Importante para la navegación
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Package,
  Users,
  Trash2,
  FileDown,
  CheckCircle,
  FileText,
  UserMinus2
} from "lucide-react";

// =========================================================
// 1. COMPONENTE SIDEBAR (Optimizado y Fuera del Main)
// =========================================================
const Sidebar = ({ sidebarOpen, setSidebarOpen, vendedor, logout }) => {
  const location = useLocation(); // Para saber en qué página estamos

  // Función para asignar clase activa (verde) o inactiva (gris)
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
            {/* Usamos LINK en lugar de <a> para evitar recargas */}
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
            <Link to="/proveedores" className={getLinkClass("/proveedores")}>
              <UserMinus2 size={20} />
              <span>Proveedores</span>
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
// 2. COMPONENTE MODAL ÉXITO
// =========================================================
const SuccessModal = ({ isOpen, onClose, facturaId }) => {
  if (!isOpen) return null;

  const descargarPDF = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/api/factura/${facturaId}`,
      "_blank",
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center animate-scale-in shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Venta Exitosa!
        </h2>
        <p className="text-gray-600 mb-6">
          La venta se ha registrado correctamente
        </p>

        <div className="flex gap-3">
          <button
            onClick={descargarPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            <FileDown size={20} />
            Descargar PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 3. COMPONENTE PRINCIPAL SALES
// =========================================================
const Sales = () => {
  const { vendedor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Productos disponibles
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchProducto, setSearchProducto] = useState("");

  // Clientes
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");

  // Carrito
  const [carrito, setCarrito] = useState([]);

  // Estados
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [facturaCreada, setFacturaCreada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const filtered = productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(searchProducto.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(searchProducto.toLowerCase()),
    );
    setProductosFiltrados(filtered);
  }, [searchProducto, productos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prodRes, clientRes] = await Promise.all([
        api.get("/api/product"),
        api.get("/api/client"),
      ]);

      setProductos(prodRes.data.productos || []);
      setProductosFiltrados(prodRes.data.productos || []);
      setClientes(clientRes.data.clientes || []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) {
      if (existente.cantidad >= producto.stock) {
        alert(`Stock insuficiente. Disponible: ${producto.stock}`);
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      if (producto.stock < 1) {
        alert("Producto sin stock");
        return;
      }
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    const producto = productos.find((p) => p.id === productoId);

    if (nuevaCantidad > producto.stock) {
      alert(`Stock insuficiente. Disponible: ${producto.stock}`);
      return;
    }

    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter((item) => item.id !== productoId));
    } else {
      setCarrito(
        carrito.map((item) =>
          item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item,
        ),
      );
    }
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter((item) => item.id !== productoId));
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.precio_venta * item.cantidad,
      0,
    );
  };

  const realizarVenta = async () => {
    // 1. VALIDACIÓN DE SEGURIDAD PARA EL VENDEDOR
    if (!vendedor?.id) {
        alert("Error: No se ha identificado al vendedor. Por favor recarga la página.");
        return;
    }

    if (!clienteSeleccionado) {
      alert("Selecciona un cliente");
      return;
    }

    if (carrito.length === 0) {
      alert("Agrega productos al carrito");
      return;
    }

    setProcesando(true);

    try {
      const ventaData = {
        id_cliente: parseInt(clienteSeleccionado),
        id_vendedor: vendedor.id, // ID del vendedor corregido
        productos: carrito.map((item) => ({
          id_producto: item.id,
          cantidad: item.cantidad,
        })),
      };

      const { data } = await api.post("/api/venta", ventaData);

      setFacturaCreada(data.factura.id);
      setSuccessModal(true);
      setCarrito([]);
      setClienteSeleccionado("");
      cargarDatos(); 
    } catch (error) {
      console.error("Error al realizar venta:", error);
      alert(error.response?.data?.message || "Error al realizar la venta");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Nueva Venta</span>
          </div>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 xl:p-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Nueva Venta
              </h1>
              <p className="text-gray-600">Registra una nueva venta</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* --- COLUMNA 1: Productos --- */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Productos Disponibles
                  </h2>

                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                    />
                  </div>

                  <div className="space-y-2 max-h-[60vh] lg:max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {productosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="mx-auto text-gray-300 mb-2" size={48} />
                        <p className="text-gray-500">No hay productos disponibles</p>
                      </div>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <div
                          key={producto.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {producto.imagen_url ? (
                              <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-gray-400" size={24} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate" title={producto.nombre}>
                              {producto.nombre}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                                {formatCurrency(producto.precio_venta)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded font-medium ${producto.stock < 10 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}
                              >
                                Stock: {producto.stock}
                              </span>
                              {producto.categoria && (
                                <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded capitalize">
                                  {producto.categoria}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => agregarAlCarrito(producto)}
                            disabled={producto.stock === 0}
                            className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95 transform"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* --- COLUMNA 2: Carrito --- */}
              <div className="space-y-6 lg:sticky lg:top-0">
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Cliente
                  </label>
                  <select
                    value={clienteSeleccionado}
                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} {cliente.ci ? `- ${cliente.ci}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ShoppingCart size={20} className="text-green-600" />
                      Carrito
                    </h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      {carrito.length} items
                    </span>
                  </div>

                  {carrito.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">Su carrito está vacío</p>
                      <p className="text-xs text-gray-400">Agregue productos para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                      {carrito.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-white transition-colors"
                        >
                          <div className="flex gap-3 mb-3">
                            {item.imagen_url ? (
                              <img
                                src={item.imagen_url}
                                alt={item.nombre}
                                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200">
                                <Package className="text-gray-300" size={20} />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-medium text-sm text-gray-900 line-clamp-2">
                                  {item.nombre}
                                </p>
                                <button
                                  onClick={() => eliminarDelCarrito(item.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(item.precio_venta)} unitario
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-100">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-bold text-green-700 text-sm">
                              {formatCurrency(item.precio_venta * item.cantidad)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {carrito.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-100 bg-white">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500 text-sm font-medium">Total a pagar:</span>
                        <span className="text-3xl font-bold text-gray-900 tracking-tight">
                          {formatCurrency(calcularTotal())}
                        </span>
                      </div>

                      <button
                        onClick={realizarVenta}
                        disabled={procesando || !clienteSeleccionado}
                        className={`
                          w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]
                          ${procesando || !clienteSeleccionado 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
                          }
                        `}
                      >
                        {procesando ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={20} />
                            <span>Confirmar Venta</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        facturaId={facturaCreada}
      />
    </div>
  );
};

export default Sales;