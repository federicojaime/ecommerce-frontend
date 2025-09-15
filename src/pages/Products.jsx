import { useState, useEffect, useRef } from 'react'
import { apiService } from '../services/apiService'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  PhotoIcon, 
  XMarkIcon,
  CloudArrowUpIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import ImageUploader from '../components/ImageUploader'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  })
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // Estado para imágenes
  const [images, setImages] = useState([])
  const [deletedImageIds, setDeletedImageIds] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    sale_price: '',
    stock: '',
    min_stock: '',
    status: 'active',
    featured: false,
    category_id: '',
    weight: '',
    dimensions: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [currentPage, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      }
      const data = await apiService.getProducts(params)
      setProducts(data.data || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleImagesChange = (newImages) => {
    console.log('Images changed:', newImages)
    setImages(newImages)
  }

  const getFiles = () => {
    const files = images.filter(img => !img.isExisting && img.file).map(img => img.file)
    console.log('Getting files for upload:', files.length, 'new files')
    return files
  }

  const clearImages = () => {
    setImages([])
    setDeletedImageIds([])
  }

  // Función para construir URLs de imágenes
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null
    }
    
    // Si ya es una URL completa, devolverla como está
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Construir URL para XAMPP
    const baseUrl = 'http://localhost/ecommerce-api/public'
    const cleanPath = imagePath.replace(/^\/+/, '') // Remover barras al inicio
    const fullUrl = `${baseUrl}/uploads/${cleanPath}`
    
    return fullUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Agregar todos los campos del producto
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? '1' : '0')
          } else {
            formDataToSend.append(key, value)
          }
        }
      })
      
      // Agregar solo archivos nuevos (no existentes)
      const newImageFiles = getFiles()
      newImageFiles.forEach((file, index) => {
        if (index === 0 && !images.some(img => img.isExisting)) {
          formDataToSend.append('image', file)
        } else {
          formDataToSend.append('images[]', file)
        }
      })

      let response
      if (editingProduct) {
        // Actualizar producto básico
        response = await apiService.updateProduct(editingProduct.id, formDataToSend)
        
        // Gestionar imágenes avanzadas por separado
        try {
          await apiService.manageProductImages(editingProduct.id, images, deletedImageIds)
          console.log('Images managed successfully')
        } catch (imageError) {
          console.error('Error managing images:', imageError)
          toast.warning('Producto actualizado, pero hubo problemas con algunas imágenes')
        }
        
        toast.success('Producto actualizado correctamente')
      } else {
        response = await apiService.createProduct(formDataToSend)
        toast.success('Producto creado correctamente')
      }
      
      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      
      let errorMessage = 'Error al guardar producto'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.'
      } else if (error.response?.status === 413) {
        errorMessage = 'Archivo demasiado grande. Reduce el tamaño de las imágenes.'
      } else if (error.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica todos los campos.'
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (product) => {
    console.log('=== INICIANDO EDICION ===')
    console.log('Producto seleccionado:', product)
    
    // Configurar datos del formulario
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      short_description: product.short_description || '',
      sku: product.sku || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock: product.stock || '',
      min_stock: product.min_stock || '',
      status: product.status || 'active',
      featured: !!product.featured,
      category_id: product.category_id || '',
      weight: product.weight || '',
      dimensions: product.dimensions || ''
    })
    
    // Limpiar imágenes y mostrar modal
    clearImages()
    setShowModal(true)
    
    // Cargar imágenes en segundo plano
    try {
      console.log('Obteniendo detalles completos del producto ID:', product.id)
      const productDetails = await apiService.getProduct(product.id)
      console.log('Detalles recibidos:', productDetails)
      
      if (productDetails.images && productDetails.images.length > 0) {
        console.log('Procesando', productDetails.images.length, 'imágenes')
        
        const processedImages = productDetails.images
          .sort((a, b) => {
            // Primero por is_primary, luego por sort_order
            if (a.is_primary && !b.is_primary) return -1
            if (!a.is_primary && b.is_primary) return 1
            return a.sort_order - b.sort_order
          })
          .map((img, index) => {
            const imageUrl = getImageUrl(img.image_path)
            console.log(`Imagen ${index + 1}: ${img.image_path} -> ${imageUrl}`)
            
            return {
              id: `existing_${img.id}`,
              preview: imageUrl,
              name: img.alt_text || product.name || `Imagen ${index + 1}`,
              size: 0,
              isExisting: true,
              imageId: img.id,
              imagePath: img.image_path,
              isPrimary: img.is_primary === 1,
              sortOrder: img.sort_order
            }
          })
        
        console.log('Imágenes procesadas:', processedImages)
        
        // Actualizar estado con pequeño delay para asegurar que el modal esté renderizado
        setTimeout(() => {
          setImages(processedImages)
          toast.success(`${processedImages.length} imágenes cargadas`)
        }, 200)
      } else {
        console.log('El producto no tiene imágenes')
        toast.info('Este producto no tiene imágenes')
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error)
      toast.error('Error al cargar las imágenes del producto')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await apiService.deleteProduct(id)
        toast.success('Producto eliminado correctamente')
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Error al eliminar producto')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      price: '',
      sale_price: '',
      stock: '',
      min_stock: '',
      status: 'active',
      featured: false,
      category_id: '',
      weight: '',
      dimensions: ''
    })
    clearImages()
  }

  const openCreateModal = () => {
    resetForm()
    setEditingProduct(null)
    setShowModal(true)
  }

  const renderProductImage = (product) => {
    const imageUrl = getImageUrl(product.primary_image || product.image)
    
    if (!imageUrl) return null
    
    return (
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Error loading product image:', imageUrl)
          e.target.style.display = 'none'
          e.target.nextElementSibling.style.display = 'flex'
        }}
      />
    )
  }

  // Funciones para gestión rápida de imágenes desde la lista
  const handleQuickImageDelete = async (productId, imageId) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return

    try {
      await apiService.deleteProductImage(productId, imageId)
      toast.success('Imagen eliminada')
      fetchProducts() // Recargar lista
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen')
    }
  }

  const handleQuickSetPrimary = async (productId, imageId) => {
    try {
      await apiService.setPrimaryProductImage(productId, imageId)
      toast.success('Imagen establecida como principal')
      fetchProducts() // Recargar lista
    } catch (error) {
      console.error('Error setting primary image:', error)
      toast.error('Error al establecer imagen principal')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#eddacb]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Productos</h1>
          <p className="text-slate-600 text-lg">Gestiona tu inventario de productos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-200">
            Exportar
          </button>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Disponible</option>
            <option value="inactive">Agotado</option>
            <option value="draft">En revisión</option>
          </select>
          <button
            onClick={() => {
              setFilters({ search: '', category: '', status: '' })
              setCurrentPage(1)
            }}
            className="px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Products Grid/Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-200">
          {products.map((product) => (
            <div key={product.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4 mb-3">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                    {renderProductImage(product)}
                    <div className="w-full h-full flex items-center justify-center text-slate-400" style={{ display: product.primary_image || product.image ? 'none' : 'flex' }}>
                      <PhotoIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{product.sku}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Precio:</span>
                  <p className="font-semibold text-slate-900">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Stock:</span>
                  <p className="font-semibold text-slate-900">{product.stock || 0}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                  product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {product.status === 'active' ? 'Disponible' :
                   product.status === 'inactive' ? 'Agotado' : 'En revisión'}
                </span>
                <span className="text-sm text-slate-500">{product.category_name || '-'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Precio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">SKU</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                          {renderProductImage(product)}
                          <div className="w-full h-full flex items-center justify-center text-slate-400" style={{ display: product.primary_image || product.image ? 'none' : 'flex' }}>
                            <PhotoIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                        {product.featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      product.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {product.status === 'active' ? 'Disponible' :
                       product.status === 'inactive' ? 'Agotado' : 'En revisión'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.category_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      ${parseFloat(product.price || 0).toFixed(2)}
                      {product.sale_price && (
                        <div className="text-xs text-emerald-600">
                          Oferta: ${parseFloat(product.sale_price).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{product.stock || 0}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Página <span className="font-bold">{currentPage}</span> de{' '}
                  <span className="font-bold">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2)
                    if (page > totalPages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold ${
                          currentPage === page
                            ? 'z-10 bg-amber-50 border-[#eddacb] text-[#eddacb]'
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        } ${i === 0 ? 'rounded-l-xl' : ''} ${i === Math.min(5, totalPages) - 1 ? 'rounded-r-xl' : ''}`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay productos</h3>
          <p className="text-slate-600 mb-6">Comienza agregando tu primer producto</p>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-3 rounded-xl font-semibold"
          >
            Agregar Primer Producto
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de Imágenes */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Imágenes del producto</h4>
                  
                  <ImageUploader
                    images={images}
                    onImagesChange={handleImagesChange}
                    maxImages={7}
                    maxSize={10 * 1024 * 1024}
                    productId={editingProduct?.id}
                    mode={editingProduct ? 'edit' : 'create'}
                  />
                </div>

                {/* Información Básica */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Información Básica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre *</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">SKU *</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                      <select
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.category_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                      <select
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="active">Disponible</option>
                        <option value="inactive">Agotado</option>
                        <option value="draft">En revisión</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Precios e Inventario */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Precios e Inventario</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Precio *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Precio de oferta</label>
                      <input
                        type="number"
                        step="0.01"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.sale_price}
                        onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Stock</label>
                      <input
                        type="number"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Stock mínimo</label>
                      <input
                        type="number"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.min_stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Descripción</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción corta</label>
                      <input
                        type="text"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.short_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                        placeholder="Breve descripción del producto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción completa</label>
                      <textarea
                        rows={4}
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción detallada del producto"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles Adicionales */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Detalles Adicionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Peso (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Dimensiones</label>
                      <input
                        type="text"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.dimensions}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                        placeholder="Largo x Ancho x Alto"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center">
                      <input
                        id="featured"
                        type="checkbox"
                        className="h-4 w-4 text-[#eddacb] focus:ring-[#eddacb] border-slate-300 rounded"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <label htmlFor="featured" className="ml-3 block text-sm font-semibold text-slate-700">
                        Producto destacado
                      </label>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Los productos destacados aparecerán primero en los listados</p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={uploading}
                    className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] border border-transparent rounded-xl text-sm font-semibold text-slate-900 shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2"></div>
                        {editingProduct ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      editingProduct ? 'Actualizar Producto' : 'Crear Producto'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products