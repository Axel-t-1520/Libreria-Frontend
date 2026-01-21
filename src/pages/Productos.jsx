import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { formatCurrency } from "../utils/format";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Menu,
  X,
  LogOut,
  TrendingUp,
  ShoppingCart,
  Users,
  Upload,
  Image as ImageIcon,
  FileText,
  UserMinus2
} from "lucide-react";

// --- CONSTANTES ---
const CATEGORIAS = [
  "papeleria", "color", "marcador", "boligrafo", "lapiz",
  "borrador-tajador", "tijeras", "plastilina", "pintura",
  "instrumento-musical", "instrumento-laboratorio", "regalo",
  "tela", "pegamento", "otros",
];

// --- 1. SIDEBAR (Optimizado Flexbox) ---
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
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <TrendingUp size={20} />
            <span>Dashboard</span>
          </a>
          <a href="/productos" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white">
            <Package size={20} />
            <span>Productos</span>
          </a>
          <a href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Users size={20} />
            <span>Clientes</span>
          </a>
          <a href="/ventas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            <span>Ventas</span>
          </a>
          <a href="/proveedores" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <UserMinus2 size={20} />
            <span>Proveedores</span>
          </a>
          <a href="/facturas" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <FileText size={20} />
            <span>Facturas</span>
          </a>
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

// --- 2. MODAL DE PRODUCTO ---
const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio_unitario: "",
    stock: "",
    precio_venta: "",
    categoria: "",
  });
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setPreviewUrl(product.imagen_url);
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio_unitario: "",
        stock: "",
        precio_venta: "",
        categoria: "",
      });
      setImagen(null);
      setPreviewUrl(null);
    }
  }, [product]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("nombre", formData.nombre);
      if (formData.descripcion)
        formDataToSend.append("descripcion", formData.descripcion);

      formDataToSend.append(
        "precio_unitario",
        parseFloat(formData.precio_unitario) || 0,
      );
      formDataToSend.append(
        "stock",
        Math.floor(parseFloat(formData.stock)) || 0,
      );
      formDataToSend.append(
        "precio_venta",
        parseFloat(formData.precio_venta) || 0,
      );

      if (formData.categoria)
        formDataToSend.append("categoria", formData.categoria);

      if (imagen) {
        formDataToSend.append("imagen", imagen);
      }

      await onSave(formDataToSend, product);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8 relative animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del Producto
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={32} />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full">
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex flex-col items-center text-center">
                      <Upload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-600 mb-1">
                        Click para subir imagen
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG hasta 5MB
                      </span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 capitalize"
              placeholder="Descripción del producto"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Compra *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_unitario}
                onChange={(e) =>
                  setFormData({ ...formData, precio_unitario: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Venta *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_venta}
                onChange={(e) =>
                  setFormData({ ...formData, precio_venta: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() +
                      cat.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Guardando..." : product ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL ---
const Products = () => {
  const { vendedor, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/product");
      
      // ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE!
      // Tu backend devuelve la lista procesada en 'data.product' (singular)
      // Usamos 'data.product' si existe, si no 'data.productos' como respaldo
      const productosRecibidos = data.product || data.productos || [];
      
      setProductos(productosRecibidos);
    } catch (error) {
      console.error("❌ ERROR COMPLETO:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData, isUpdate) => {
    try {
      if (isUpdate) {
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
          if (key !== "imagen") {
            if (key === "precio_unitario" || key === "precio_venta") {
              jsonData[key] = parseFloat(value) || 0;
            } else if (key === "stock") {
              jsonData[key] = Math.floor(parseFloat(value)) || 0;
            } else {
              jsonData[key] = value || "";
            }
          }
        }

        await api.put(`/api/product/update/${selectedProduct.id}`, jsonData);
      } else {
        await api.post("/api/regisProd", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setModalOpen(false);
      setSelectedProduct(null);
      cargarProductos();
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al guardar producto");
    }
  };

  const handleDeleteClick = (producto) => {
    setProductToDelete(producto);
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/product/delete/${productToDelete.id}`);
      cargarProductos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el producto");
    } finally {
        setConfirmDelete(false);
        setProductToDelete(null);
    }
  };

  const filteredProducts = productos.filter((p) => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    // CONTENEDOR FLEX (Layout Responsivo)
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        vendedor={vendedor}
        logout={logout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Productos</span>
          </div>
          <div className="w-10" />
        </div>

        {/* CONTENIDO PRINCIPAL SCROLLABLE */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Productos
              </h1>
              <p className="text-gray-600">
                Gestiona tu inventario de productos
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No hay productos disponibles</p>
            </div>
          ) : (
            // GRID RESPONSIVO AUTOMÁTICO
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 pb-10">
              {filteredProducts.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 flex flex-col h-full group"
                >
                  <div className="relative w-full pt-[75%] bg-gray-50 border-b border-gray-50">
                    <div className="absolute inset-0 p-4 flex items-center justify-center">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="text-gray-300" size={48} />
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-gray-900 truncate" title={producto.nombre}>
                          {producto.nombre}
                        </h3>
                        {producto.categoria && (
                          <span className="inline-block px-2 py-0.5 mt-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            {producto.categoria}
                          </span>
                        )}
                      </div>
                      
                      {/* --- AQUÍ ESTÁ LA LÓGICA DE ELIMINAR --- */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedProduct(producto);
                            setModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-green-600"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>

                        {/* Botón condicional */}
                        {producto.se_puede_eliminar ? (
                          <button
                            onClick={() => handleDeleteClick(producto)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div 
                            className="p-1.5 text-gray-300 cursor-not-allowed" 
                            title="No se puede eliminar porque tiene ventas asociadas"
                          >
                            <Trash2 size={16} />
                          </div>
                        )}
                      </div>
                    </div>

                    {producto.descripcion && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
                        {producto.descripcion}
                      </p>
                    )}

                    <div className="mt-auto space-y-2 pt-3 border-t border-gray-50">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Precio</span>
                        <span className="font-bold text-gray-900 text-lg">
                          {formatCurrency(producto.precio_venta)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Stock</span>
                        <span
                          className={`font-medium px-2 py-0.5 rounded ${
                            producto.stock < 10
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {producto.stock} uds.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar producto?"
        message={`¿Estás seguro de eliminar "${productToDelete?.nombre}"?`}
        type="danger"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Products;