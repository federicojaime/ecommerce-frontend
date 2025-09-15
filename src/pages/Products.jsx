import { useState, useEffect, useRef, useCallback } from 'react'
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
// Importar las utilidades de exportación
import { exportFilteredProducts } from '../utils/exportUtils'

// Hook personalizado para debounce mejorado
const useDebounce = (value, delay = 800) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (!value || value.trim() === '') {
      setDebouncedValue(value)
      return
    }

    if (value.trim().length < 2) {
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Componente de menú de exportación
const ExportMenu = ({ onExport, disabled = false, currentFilters = {} }) => {
  const [showMenu, setShowMenu] = useState(false)
  const hasFilters = Object.values(currentFilters).some(value => value && value !== '')

  const handleExport = (format) => {
    onExport(format)
    setShowMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.export-menu')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenu])

  return (
    <div className="relative export-menu">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
          <div className="p-2">
            {hasFilters && (
              <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100 mb-2">
                Se exportarán los productos filtrados
              </div>
            )}
            
            <button
              onClick={() => handleExport('excel')}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div className="font-medium">Excel (.xlsx)</div>
                <div className="text-xs text-slate-500">Recomendado para análisis</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div className="font-medium">CSV (.csv)</div>
                <div className="text-xs text-slate-500">Compatible con cualquier software</div>
              </div>
            </button>

            <button
              onClick={() => handleExport('json')}
              className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div>
                <div className="font-medium">JSON (.json)</div>
                <div className="text-xs text-slate-500">Para desarrolladores</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [exporting, setExporting] = useState(false) // Nuevo estado para exportación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [filters, setFilters] = useState({
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

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 800)

  // Crear filtros combinados
  const combinedFilters = {
    search: debouncedSearchTerm,
    ...filters
  }

  // Función para manejar exportación
  const handleExport = async (format) => {
    setExporting(true)
    try {
      // Crear filtros para la exportación
      const exportFilters = {}
      
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
        exportFilters.search = debouncedSearchTerm
      }
      
      if (filters.category) {
        exportFilters.category = filters.category
      }
      
      if (filters.status) {
        exportFilters.status = filters.status
      }

      await exportFilteredProducts(exportFilters, apiService, format)
      
      const hasFilters = Object.keys(exportFilters).length > 0
      const message = hasFilters 
        ? `Productos filtrados exportados exitosamente en formato ${format.toUpperCase()}`
        : `Todos los productos exportados exitosamente en formato ${format.toUpperCase()}`
      
      toast.success(message)
    } catch (error) {
      console.error('Error en exportación:', error)
      toast.error(error.message || 'Error al exportar productos')
    } finally {
      setExporting(false)
    }
  }

  // Cargar productos cuando cambien los filtros o la página
  useEffect(() => {
    fetchProducts()
  }, [currentPage, debouncedSearchTerm, filters])

  // Cargar categorías solo una vez
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [])

  // Mostrar indicador de búsqueda
  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2 && searchTerm !== debouncedSearchTerm) {
      setSearching(true)
    } else {
      setSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...combinedFilters
      }
      
      console.log('Buscando productos con filtros:', params)
      
      const data = await apiService.getProducts(params)
      setProducts(data.data || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
      setSearching(false)
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

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setCurrentPage(1)
    
    if (value === '') {
      setSearching(false)
    }
  }

  // Manejar cambio en otros filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('')
    setFilters({ category: '', status: '' })
    setCurrentPage(1)
  }

  // Limpiar solo la búsqueda
  const clearSearch = () => {
    setSearchTerm('')
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
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    const baseUrl = 'http://localhost/ecommerce-api/public'
    const cleanPath = imagePath.replace(/^\/+/, '')
    const fullUrl = `${baseUrl}/uploads/${cleanPath}`
    
    return fullUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      const formDataToSend = new FormData()
      
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
        response = await apiService.updateProduct(editingProduct.id, formDataToSend)
        
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
    
    clearImages()
    setShowModal(true)
    
    try {
      console.log('Obteniendo detalles completos del producto ID:', product.id)
      const productDetails = await apiService.getProduct(product.id)
      console.log('Detalles recibidos:', productDetails)
      
      if (productDetails.images && productDetails.images.length > 0) {
        console.log('Procesando', productDetails.images.length, 'imágenes')
        
        const processedImages = productDetails.images
          .sort((a, b) => {
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

  // Determinar si mostrar indicador de "buscando"
  const showSearchIndicator = searching || (searchTerm && searchTerm.length >= 1 && searchTerm.length < 2)

  // Verificar si hay filtros activos
  const hasActiveFilters = searchTerm || filters.category || filters.status

  if (loading && !searching) {
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
          {/* Botón de exportar con menú desplegable */}
          <ExportMenu 
            onExport={handleExport}
            disabled={exporting || loading}
            currentFilters={combinedFilters}
          />
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Resto del componente permanece igual... */}
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos... (mín. 2 caracteres)"
              className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {showSearchIndicator && (
                <div className="mr-2">
                  {searchTerm.length < 2 ? (
                    <span className="text-xs text-amber-600 font-medium">
                      {searchTerm.length}/2
                    </span>
                  ) : (
                    <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-[#eddacb] rounded-full"></div>
                  )}
                </div>
              )}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-slate-400 hover:text-slate-600"
                  title="Limpiar búsqueda"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
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
            onClick={clearAllFilters}
            className="px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            Limpiar Todo
          </button>
        </div>
        
        {/* Indicador de búsqueda mínima */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 2 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 Escribe al menos 2 caracteres para buscar productos
            </p>
          </div>
        )}
        
        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-600 font-medium">Filtros activos:</span>
              {searchTerm && searchTerm.length >= 2 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Búsqueda: "{searchTerm}"
                  <button
                    onClick={clearSearch}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Categoría: {categories.find(c => c.id == filters.category)?.name}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  Estado: {filters.status === 'active' ? 'Disponible' : filters.status === 'inactive' ? 'Agotado' : 'En revisión'}
                  <button
                    onClick={() => handleFilterChange('status', '')}
                    className="ml-1 text-amber-600 hover:text-amber-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid/Table - El resto del código permanece igual */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Loading overlay mientras busca */}
        {(loading || searching || exporting) && (
          <div className="relative">
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-[#eddacb] rounded-full"></div>
                <span className="text-sm text-slate-600">
                  {exporting ? 'Exportando...' : searching ? 'Buscando...' : 'Cargando...'}
                </span>
              </div>
            </div>
          </div>
        )}

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
      {products.length === 0 && !loading && !searching && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {hasActiveFilters ? 
              'No se encontraron productos' : 
              'No hay productos'
            }
          </h3>
          <p className="text-slate-600 mb-6">
            {hasActiveFilters ? 
              'Intenta ajustar los filtros de búsqueda' : 
              'Comienza agregando tu primer producto'
            }
          </p>
          {!hasActiveFilters ? (
            <button 
              onClick={openCreateModal}
              className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-3 rounded-xl font-semibold"
            >
              Agregar Primer Producto
            </button>
          ) : (
            <button 
              onClick={clearAllFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}

      {/* Modal - El resto del código del modal permanece igual */}
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