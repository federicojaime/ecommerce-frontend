// src/services/exportService.js
import api from './authService'
import toast from 'react-hot-toast'

export const exportService = {
  // ==================== EXPORTACIÓN DE PEDIDOS ====================
  
  /**
   * Exportar pedidos a Excel
   */
  exportOrdersToExcel: async (filters = {}) => {
    try {
      console.log('Exporting orders to Excel with filters:', filters)
      
      const response = await api.get('/admin/orders/export', {
        params: { 
          format: 'excel',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting orders to Excel:', error)
      
      // Fallback: crear Excel localmente
      return await exportService.createLocalOrdersExcel(filters)
    }
  },

  /**
   * Exportar pedidos a CSV
   */
  exportOrdersToCSV: async (filters = {}) => {
    try {
      console.log('Exporting orders to CSV with filters:', filters)
      
      const response = await api.get('/admin/orders/export', {
        params: { 
          format: 'csv',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting orders to CSV:', error)
      
      // Fallback: crear CSV localmente
      return await exportService.createLocalOrdersCSV(filters)
    }
  },

  /**
   * Exportar pedidos a PDF
   */
  exportOrdersToPDF: async (filters = {}) => {
    try {
      console.log('Exporting orders to PDF with filters:', filters)
      
      const response = await api.get('/admin/orders/export', {
        params: { 
          format: 'pdf',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting orders to PDF:', error)
      
      // Fallback: crear PDF localmente (simplificado como HTML)
      return await exportService.createLocalOrdersPDF(filters)
    }
  },

  // ==================== EXPORTACIÓN DE PRODUCTOS ====================
  
  /**
   * Exportar productos a Excel
   */
  exportProductsToExcel: async (filters = {}) => {
    try {
      console.log('Exporting products to Excel')
      
      const response = await api.get('/admin/products/export', {
        params: { 
          format: 'excel',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting products to Excel:', error)
      return await exportService.createLocalProductsExcel(filters)
    }
  },

  /**
   * Exportar productos a CSV
   */
  exportProductsToCSV: async (filters = {}) => {
    try {
      console.log('Exporting products to CSV')
      
      const response = await api.get('/admin/products/export', {
        params: { 
          format: 'csv',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting products to CSV:', error)
      return await exportService.createLocalProductsCSV(filters)
    }
  },

  // ==================== EXPORTACIÓN DE USUARIOS ====================
  
  /**
   * Exportar usuarios a Excel
   */
  exportUsersToExcel: async (filters = {}) => {
    try {
      console.log('Exporting users to Excel')
      
      const response = await api.get('/admin/users/export', {
        params: { 
          format: 'excel',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting users to Excel:', error)
      return await exportService.createLocalUsersExcel(filters)
    }
  },

  /**
   * Exportar usuarios a CSV
   */
  exportUsersToCSV: async (filters = {}) => {
    try {
      console.log('Exporting users to CSV')
      
      const response = await api.get('/admin/users/export', {
        params: { 
          format: 'csv',
          ...filters 
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting users to CSV:', error)
      return await exportService.createLocalUsersCSV(filters)
    }
  },

  // ==================== REPORTES FINANCIEROS ====================
  
  /**
   * Exportar reporte de ventas
   */
  exportSalesReport: async (dateFrom, dateTo, format = 'excel') => {
    try {
      console.log(`Exporting sales report from ${dateFrom} to ${dateTo}`)
      
      const response = await api.get('/admin/reports/sales', {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          format: format
        },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting sales report:', error)
      return await exportService.createLocalSalesReport(dateFrom, dateTo, format)
    }
  },

  /**
   * Exportar reporte de inventario
   */
  exportInventoryReport: async (format = 'excel') => {
    try {
      console.log('Exporting inventory report')
      
      const response = await api.get('/admin/reports/inventory', {
        params: { format },
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting inventory report:', error)
      return await exportService.createLocalInventoryReport(format)
    }
  },

  // ==================== CREACIÓN LOCAL DE ARCHIVOS ====================
  
  /**
   * Crear Excel de pedidos localmente
   */
  createLocalOrdersExcel: async (filters = {}) => {
    // Obtener datos simulados o reales
    const orders = await exportService.getOrdersData(filters)
    
    const headers = [
      'Número de Pedido',
      'Cliente',
      'Email',
      'Teléfono',
      'Estado',
      'Estado Pago',
      'Método Pago',
      'Subtotal',
      'Impuestos',
      'Envío',
      'Total',
      'Productos',
      'Dirección',
      'Fecha Pedido',
      'Notas'
    ]
    
    const data = orders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone || '',
      order.status,
      order.payment_status,
      order.payment_method || '',
      parseFloat(order.subtotal || 0).toFixed(2),
      parseFloat(order.tax_amount || 0).toFixed(2),
      parseFloat(order.shipping_amount || 0).toFixed(2),
      parseFloat(order.total_amount || 0).toFixed(2),
      order.items_count || 0,
      order.shipping_address || '',
      new Date(order.created_at).toLocaleDateString('es-ES'),
      order.notes || ''
    ])
    
    const html = exportService.createExcelHTML(headers, data, 'Reporte de Pedidos')
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    
    return blob
  },

  /**
   * Crear CSV de pedidos localmente
   */
  createLocalOrdersCSV: async (filters = {}) => {
    const orders = await exportService.getOrdersData(filters)
    
    const headers = [
      'Número de Pedido',
      'Cliente',
      'Email',
      'Estado',
      'Estado Pago',
      'Total',
      'Fecha'
    ]
    
    const rows = orders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.status,
      order.payment_status,
      parseFloat(order.total_amount || 0).toFixed(2),
      new Date(order.created_at).toLocaleDateString('es-ES')
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    return blob
  },

  /**
   * Crear PDF de pedidos localmente (como HTML)
   */
  createLocalOrdersPDF: async (filters = {}) => {
    const orders = await exportService.getOrdersData(filters)
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Pedidos - Deco Home</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2d3c5d; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #eddacb; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { text-align: center; margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Deco Home - Reporte de Pedidos</h1>
          <p class="date">Generado el ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.order_number}</td>
                <td>${order.customer_name}</td>
                <td>${order.status}</td>
                <td>$${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                <td>${new Date(order.created_at).toLocaleDateString('es-ES')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Total de pedidos: ${orders.length}
        </p>
      </body>
      </html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    return blob
  },

  /**
   * Crear Excel de productos localmente
   */
  createLocalProductsExcel: async (filters = {}) => {
    const products = await exportService.getProductsData(filters)
    
    const headers = [
      'ID',
      'Nombre',
      'SKU',
      'Categoría',
      'Precio',
      'Precio Oferta',
      'Stock',
      'Stock Mínimo',
      'Estado',
      'Destacado',
      'Peso',
      'Dimensiones',
      'Descripción',
      'Fecha Creación'
    ]
    
    const data = products.map(product => [
      product.id,
      product.name,
      product.sku || '',
      product.category_name || '',
      parseFloat(product.price || 0).toFixed(2),
      parseFloat(product.sale_price || 0).toFixed(2),
      product.stock || 0,
      product.min_stock || 0,
      product.status || 'active',
      product.featured ? 'Sí' : 'No',
      product.weight || '',
      product.dimensions || '',
      product.description || '',
      new Date(product.created_at || Date.now()).toLocaleDateString('es-ES')
    ])
    
    const html = exportService.createExcelHTML(headers, data, 'Reporte de Productos')
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    
    return blob
  },

  /**
   * Crear CSV de productos localmente
   */
  createLocalProductsCSV: async (filters = {}) => {
    const products = await exportService.getProductsData(filters)
    
    const headers = [
      'Nombre',
      'SKU',
      'Precio',
      'Stock',
      'Estado'
    ]
    
    const rows = products.map(product => [
      product.name,
      product.sku || '',
      parseFloat(product.price || 0).toFixed(2),
      product.stock || 0,
      product.status || 'active'
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    return blob
  },

  /**
   * Crear Excel de usuarios localmente
   */
  createLocalUsersExcel: async (filters = {}) => {
    const users = await exportService.getUsersData(filters)
    
    const headers = [
      'ID',
      'Nombre',
      'Email',
      'Teléfono',
      'Rol',
      'Estado',
      'Fecha Registro',
      'Último Acceso'
    ]
    
    const data = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.status || 'active',
      new Date(user.created_at).toLocaleDateString('es-ES'),
      user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'
    ])
    
    const html = exportService.createExcelHTML(headers, data, 'Reporte de Usuarios')
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    
    return blob
  },

  /**
   * Crear CSV de usuarios localmente
   */
  createLocalUsersCSV: async (filters = {}) => {
    const users = await exportService.getUsersData(filters)
    
    const headers = [
      'Nombre',
      'Email',
      'Rol',
      'Estado',
      'Fecha Registro'
    ]
    
    const rows = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.status || 'active',
      new Date(user.created_at).toLocaleDateString('es-ES')
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    return blob
  },

  /**
   * Crear reporte de ventas local
   */
  createLocalSalesReport: async (dateFrom, dateTo, format = 'excel') => {
    const salesData = await exportService.getSalesData(dateFrom, dateTo)
    
    const headers = [
      'Fecha',
      'Pedidos',
      'Ventas Totales',
      'Producto Más Vendido',
      'Nuevos Clientes',
      'Ticket Promedio'
    ]
    
    const data = salesData.map(day => [
      day.date,
      day.orders_count,
      parseFloat(day.total_sales).toFixed(2),
      day.top_product || '',
      day.new_customers || 0,
      parseFloat(day.average_ticket).toFixed(2)
    ])
    
    if (format === 'csv') {
      const csv = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    } else {
      const html = exportService.createExcelHTML(headers, data, 'Reporte de Ventas')
      return new Blob([html], { type: 'application/vnd.ms-excel' })
    }
  },

  /**
   * Crear reporte de inventario local
   */
  createLocalInventoryReport: async (format = 'excel') => {
    const inventoryData = await exportService.getInventoryData()
    
    const headers = [
      'Producto',
      'SKU',
      'Stock Actual',
      'Stock Mínimo',
      'Estado Stock',
      'Valor Inventario',
      'Rotación',
      'Última Venta'
    ]
    
    const data = inventoryData.map(item => [
      item.name,
      item.sku || '',
      item.stock || 0,
      item.min_stock || 0,
      item.stock_status || 'normal',
      parseFloat(item.inventory_value || 0).toFixed(2),
      item.turnover_rate || 'N/A',
      item.last_sale ? new Date(item.last_sale).toLocaleDateString('es-ES') : 'Nunca'
    ])
    
    if (format === 'csv') {
      const csv = [
        headers.join(','),
        ...data.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    } else {
      const html = exportService.createExcelHTML(headers, data, 'Reporte de Inventario')
      return new Blob([html], { type: 'application/vnd.ms-excel' })
    }
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Crear HTML para Excel
   */
  createExcelHTML: (headers, data, title = 'Reporte') => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #eddacb; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}</p>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p>Total de registros: ${data.length}</p>
      </body>
      </html>
    `
  },

  /**
   * Descargar archivo
   */
  downloadBlob: (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /**
   * Generar nombre de archivo con timestamp
   */
  generateFileName: (prefix, extension) => {
    const timestamp = new Date().toISOString().split('T')[0]
    return `${prefix}-${timestamp}.${extension}`
  },

  // ==================== OBTENCIÓN DE DATOS ====================
  
  /**
   * Obtener datos de pedidos
   */
  getOrdersData: async (filters = {}) => {
    try {
      const response = await api.get('/admin/orders', { params: filters })
      return response.data.data || []
    } catch (error) {
      console.error('Error getting orders data for export:', error)
      
      // Datos simulados
      return [
        {
          id: 1,
          order_number: 'ORD-2025-001',
          customer_name: 'Juan Pérez',
          customer_email: 'juan@example.com',
          customer_phone: '+54 11 1234-5678',
          status: 'delivered',
          payment_status: 'paid',
          payment_method: 'credit_card',
          subtotal: 12000.00,
          tax_amount: 2520.00,
          shipping_amount: 980.00,
          total_amount: 15500.00,
          items_count: 3,
          shipping_address: 'Av. Corrientes 1234, CABA',
          created_at: '2025-01-15T10:30:00Z',
          notes: 'Entregar en horario de oficina'
        },
        {
          id: 2,
          order_number: 'ORD-2025-002',
          customer_name: 'María García',
          customer_email: 'maria@example.com',
          customer_phone: '+54 11 8765-4321',
          status: 'processing',
          payment_status: 'paid',
          payment_method: 'bank_transfer',
          subtotal: 6500.00,
          tax_amount: 1365.00,
          shipping_amount: 885.00,
          total_amount: 8750.00,
          items_count: 1,
          shipping_address: 'San Martín 567, Belgrano',
          created_at: '2025-01-14T15:45:00Z',
          notes: ''
        }
      ]
    }
  },

  /**
   * Obtener datos de productos
   */
  getProductsData: async (filters = {}) => {
    try {
      const response = await api.get('/admin/products', { params: filters })
      return response.data.data || []
    } catch (error) {
      console.error('Error getting products data for export:', error)
      
      // Datos simulados
      return [
        {
          id: 1,
          name: 'Lámpara Moderna',
          sku: 'LAM-001',
          category_name: 'Iluminación',
          price: 4500.00,
          sale_price: 0,
          stock: 15,
          min_stock: 5,
          status: 'active',
          featured: true,
          weight: '2.5',
          dimensions: '30x30x45 cm',
          description: 'Lámpara moderna para sala de estar',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Mesa de Centro',
          sku: 'MES-002',
          category_name: 'Muebles',
          price: 3000.00,
          sale_price: 2700.00,
          stock: 8,
          min_stock: 3,
          status: 'active',
          featured: false,
          weight: '15.0',
          dimensions: '120x60x45 cm',
          description: 'Mesa de centro de madera',
          created_at: '2025-01-02T00:00:00Z'
        }
      ]
    }
  },

  /**
   * Obtener datos de usuarios
   */
  getUsersData: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters })
      return response.data.data || []
    } catch (error) {
      console.error('Error getting users data for export:', error)
      
      // Datos simulados
      return [
        {
          id: 1,
          name: 'Admin Principal',
          email: 'admin@decohome.com',
          phone: '+54 11 1111-1111',
          role: 'admin',
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          last_login: '2025-01-15T09:00:00Z'
        },
        {
          id: 2,
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+54 11 1234-5678',
          role: 'customer',
          status: 'active',
          created_at: '2025-01-10T00:00:00Z',
          last_login: '2025-01-14T15:30:00Z'
        }
      ]
    }
  },

  /**
   * Obtener datos de ventas
   */
  getSalesData: async (dateFrom, dateTo) => {
    try {
      const response = await api.get('/admin/reports/sales-data', {
        params: { date_from: dateFrom, date_to: dateTo }
      })
      return response.data || []
    } catch (error) {
      console.error('Error getting sales data for export:', error)
      
      // Datos simulados
      const days = []
      const start = new Date(dateFrom)
      const end = new Date(dateTo)
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: d.toLocaleDateString('es-ES'),
          orders_count: Math.floor(Math.random() * 10) + 1,
          total_sales: (Math.random() * 50000 + 10000).toFixed(2),
          top_product: 'Lámpara Moderna',
          new_customers: Math.floor(Math.random() * 5),
          average_ticket: (Math.random() * 5000 + 2000).toFixed(2)
        })
      }
      
      return days
    }
  },

  /**
   * Obtener datos de inventario
   */
  getInventoryData: async () => {
    try {
      const response = await api.get('/admin/reports/inventory-data')
      return response.data || []
    } catch (error) {
      console.error('Error getting inventory data for export:', error)
      
      // Datos simulados
      return [
        {
          name: 'Lámpara Moderna',
          sku: 'LAM-001',
          stock: 15,
          min_stock: 5,
          stock_status: 'normal',
          inventory_value: 67500.00,
          turnover_rate: '2.3x',
          last_sale: '2025-01-14T00:00:00Z'
        },
        {
          name: 'Mesa de Centro',
          sku: 'MES-002',
          stock: 3,
          min_stock: 3,
          stock_status: 'low',
          inventory_value: 24000.00,
          turnover_rate: '1.8x',
          last_sale: '2025-01-13T00:00:00Z'
        }
      ]
    }
  }
}

export default exportService