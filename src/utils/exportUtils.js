// src/utils/exportUtils.js
import * as XLSX from 'xlsx'

/**
 * Utilidades para exportar datos de productos
 */

// Función para exportar productos a Excel
export const exportProductsToExcel = (products, filename = 'productos') => {
  try {
    // Preparar los datos para exportar
    const exportData = products.map(product => ({
      'ID': product.id,
      'Nombre': product.name,
      'SKU': product.sku,
      'Descripción': product.description || '',
      'Descripción Corta': product.short_description || '',
      'Precio': parseFloat(product.price || 0),
      'Precio de Oferta': product.sale_price ? parseFloat(product.sale_price) : '',
      'Stock': product.stock || 0,
      'Stock Mínimo': product.min_stock || 0,
      'Estado': product.status === 'active' ? 'Disponible' : 
               product.status === 'inactive' ? 'Agotado' : 'En revisión',
      'Destacado': product.featured ? 'Sí' : 'No',
      'Categoría': product.category_name || '',
      'Peso (kg)': product.weight || '',
      'Dimensiones': product.dimensions || '',
      'Fecha de Creación': product.created_at ? new Date(product.created_at).toLocaleDateString('es-ES') : '',
      'Fecha de Actualización': product.updated_at ? new Date(product.updated_at).toLocaleDateString('es-ES') : ''
    }))

    // Crear el libro de trabajo
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Configurar el ancho de las columnas
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // Nombre
      { wch: 15 },  // SKU
      { wch: 40 },  // Descripción
      { wch: 30 },  // Descripción Corta
      { wch: 12 },  // Precio
      { wch: 15 },  // Precio de Oferta
      { wch: 8 },   // Stock
      { wch: 12 },  // Stock Mínimo
      { wch: 12 },  // Estado
      { wch: 10 },  // Destacado
      { wch: 20 },  // Categoría
      { wch: 12 },  // Peso
      { wch: 20 },  // Dimensiones
      { wch: 15 },  // Fecha de Creación
      { wch: 15 }   // Fecha de Actualización
    ]
    ws['!cols'] = colWidths

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')

    // Generar el archivo y descargarlo
    const timestamp = new Date().toISOString().slice(0, 10)
    const finalFilename = `${filename}_${timestamp}.xlsx`
    XLSX.writeFile(wb, finalFilename)

    return true
  } catch (error) {
    console.error('Error exportando a Excel:', error)
    throw new Error('Error al exportar los productos a Excel')
  }
}

// Función para exportar productos a CSV
export const exportProductsToCSV = (products, filename = 'productos') => {
  try {
    // Preparar los datos
    const exportData = products.map(product => ({
      id: product.id,
      nombre: product.name,
      sku: product.sku,
      descripcion: product.description || '',
      descripcion_corta: product.short_description || '',
      precio: parseFloat(product.price || 0),
      precio_oferta: product.sale_price ? parseFloat(product.sale_price) : '',
      stock: product.stock || 0,
      stock_minimo: product.min_stock || 0,
      estado: product.status,
      destacado: product.featured ? 1 : 0,
      categoria: product.category_name || '',
      peso: product.weight || '',
      dimensiones: product.dimensions || '',
      fecha_creacion: product.created_at || '',
      fecha_actualizacion: product.updated_at || ''
    }))

    // Convertir a CSV
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escapar comillas y envolver en comillas si contiene comas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    const finalFilename = `${filename}_${timestamp}.csv`
    
    link.href = URL.createObjectURL(blob)
    link.download = finalFilename
    link.click()

    return true
  } catch (error) {
    console.error('Error exportando a CSV:', error)
    throw new Error('Error al exportar los productos a CSV')
  }
}

// Función para exportar productos a JSON
export const exportProductsToJSON = (products, filename = 'productos') => {
  try {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalProducts: products.length,
      products: products
    }

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    })
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 10)
    const finalFilename = `${filename}_${timestamp}.json`
    
    link.href = URL.createObjectURL(blob)
    link.download = finalFilename
    link.click()

    return true
  } catch (error) {
    console.error('Error exportando a JSON:', error)
    throw new Error('Error al exportar los productos a JSON')
  }
}

// Función para exportar con filtros aplicados
export const exportFilteredProducts = async (filters, apiService, format = 'excel') => {
  try {
    // Obtener todos los productos que coincidan con los filtros
    const params = {
      ...filters,
      limit: 10000, // Límite alto para obtener todos los productos
      page: 1
    }

    const data = await apiService.getProducts(params)
    const products = data.data || []

    if (products.length === 0) {
      throw new Error('No hay productos para exportar con los filtros aplicados')
    }

    // Exportar según el formato solicitado
    switch (format.toLowerCase()) {
      case 'excel':
        return await exportProductsToExcel(products)
      case 'csv':
        return await exportProductsToCSV(products)
      case 'json':
        return await exportProductsToJSON(products)
      default:
        throw new Error('Formato de exportación no válido')
    }
  } catch (error) {
    console.error('Error en exportación filtrada:', error)
    throw error
  }
}

// Hook para manejar exportaciones
export const useProductExport = (apiService, currentFilters = {}) => {
  const [exporting, setExporting] = useState(false)

  const exportProducts = async (format = 'excel', useFilters = true) => {
    setExporting(true)
    try {
      const filters = useFilters ? currentFilters : {}
      await exportFilteredProducts(filters, apiService, format)
      
      // Mostrar mensaje de éxito
      toast.success(`Productos exportados exitosamente en formato ${format.toUpperCase()}`)
      return true
    } catch (error) {
      console.error('Error en exportación:', error)
      toast.error(error.message || 'Error al exportar productos')
      return false
    } finally {
      setExporting(false)
    }
  }

  return {
    exportProducts,
    exporting
  }
}

// Componente de menú de exportación
export const ExportMenu = ({ onExport, disabled = false, currentFilters = {} }) => {
  const [showMenu, setShowMenu] = useState(false)
  const hasFilters = Object.values(currentFilters).some(value => value && value !== '')

  const handleExport = (format) => {
    onExport(format)
    setShowMenu(false)
  }

  return (
    <div className="relative">
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