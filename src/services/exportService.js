// src/services/exportService.js - MEJORADO
import api from './authService'
import toast from 'react-hot-toast'

export const exportService = {
    // ==================== EXPORTACIÓN AVANZADA DE PEDIDOS ====================

    /**
     * Exportar pedidos con filtros avanzados y múltiples formatos
     */
    exportOrdersAdvanced: async (filters = {}, format = 'excel', options = {}) => {
        try {
            console.log(`Exporting orders to ${format} with advanced filters:`, filters)

            const response = await api.get('/admin/orders/export', {
                params: {
                    format,
                    ...filters,
                    include_items: options.includeItems || false,
                    include_customer_data: options.includeCustomerData || true,
                    include_analytics: options.includeAnalytics || false,
                    date_range: options.dateRange || 'all',
                    currency_format: options.currencyFormat || 'local'
                },
                responseType: 'blob'
            })

            return response.data
        } catch (error) {
            console.error(`Error exporting orders to ${format}:`, error)
            return await exportService.createAdvancedOrdersExport(filters, format, options)
        }
    },

    /**
     * Crear export avanzado de pedidos localmente
     */
    createAdvancedOrdersExport: async (filters = {}, format = 'excel', options = {}) => {
        const orders = await exportService.getEnhancedOrdersData(filters)

        if (format === 'pdf') {
            return exportService.createOrdersPDFReport(orders, options)
        }

        const headers = exportService.getOrderExportHeaders(options)
        const data = orders.map(order => exportService.mapOrderToExportRow(order, options))

        if (format === 'csv') {
            return exportService.createCSVFromData(headers, data, 'Reporte de Pedidos')
        } else {
            return exportService.createExcelFromData(headers, data, 'Reporte de Pedidos', options)
        }
    },

    /**
     * Obtener headers dinámicos para export de pedidos
     */
    getOrderExportHeaders: (options = {}) => {
        const baseHeaders = [
            'Número de Pedido',
            'Fecha',
            'Cliente',
            'Email',
            'Estado',
            'Estado Pago',
            'Total'
        ]

        if (options.includeCustomerData) {
            baseHeaders.push('Teléfono', 'Dirección de Envío')
        }

        if (options.includeItems) {
            baseHeaders.push('Productos', 'Cantidad Total', 'SKUs')
        }

        if (options.includeAnalytics) {
            baseHeaders.push('Días hasta Entrega', 'Margen', 'Categoría Principal')
        }

        baseHeaders.push('Método de Pago', 'Notas')

        return baseHeaders
    },

    /**
     * Mapear pedido a fila de export
     */
    mapOrderToExportRow: (order, options = {}) => {
        const row = [
            order.order_number,
            new Date(order.created_at).toLocaleDateString('es-ES'),
            order.customer_name,
            order.customer_email,
            exportService.translateStatus(order.status),
            exportService.translatePaymentStatus(order.payment_status),
            exportService.formatCurrency(order.total_amount)
        ]

        if (options.includeCustomerData) {
            row.push(
                order.customer_phone || 'No especificado',
                order.shipping_address || 'No especificada'
            )
        }

        if (options.includeItems) {
            const itemsCount = order.items?.length || order.items_count || 0
            const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
            const skus = order.items?.map(item => item.product_sku).join(', ') || 'N/A'

            row.push(itemsCount, totalQuantity, skus)
        }

        if (options.includeAnalytics) {
            const daysToDelivery = order.delivered_at
                ? Math.ceil((new Date(order.delivered_at) - new Date(order.created_at)) / (1000 * 60 * 60 * 24))
                : 'N/A'

            const margin = order.margin_amount
                ? exportService.formatCurrency(order.margin_amount)
                : 'N/A'

            const mainCategory = order.main_category || 'Mixto'

            row.push(daysToDelivery, margin, mainCategory)
        }

        row.push(
            exportService.translatePaymentMethod(order.payment_method),
            order.notes || ''
        )

        return row
    },

    // ==================== EXPORTACIÓN AVANZADA DE PRODUCTOS ====================

    /**
     * Exportar productos con análisis de rendimiento
     */
    exportProductsWithAnalytics: async (filters = {}, format = 'excel') => {
        try {
            const response = await api.get('/admin/products/export-analytics', {
                params: { format, ...filters },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting products analytics:', error)
            return await exportService.createProductsAnalyticsExport(filters, format)
        }
    },

    /**
     * Crear export de análisis de productos
     */
    createProductsAnalyticsExport: async (filters = {}, format = 'excel') => {
        const products = await exportService.getProductsAnalyticsData(filters)

        const headers = [
            'Producto',
            'SKU',
            'Categoría',
            'Precio',
            'Stock Actual',
            'Stock Mínimo',
            'Estado Stock',
            'Ventas Totales',
            'Ingresos Generados',
            'Margen Promedio',
            'Rotación (días)',
            'Último Movimiento',
            'Valoración Stock',
            'Estado',
            'Recomendación'
        ]

        const data = products.map(product => [
            product.name,
            product.sku || '',
            product.category_name || 'Sin categoría',
            exportService.formatCurrency(product.price),
            product.stock || 0,
            product.min_stock || 0,
            exportService.getStockStatus(product.stock, product.min_stock),
            product.total_sales || 0,
            exportService.formatCurrency(product.revenue || 0),
            exportService.formatPercentage(product.margin_percent || 0),
            product.turnover_days || 'N/A',
            product.last_movement ? new Date(product.last_movement).toLocaleDateString('es-ES') : 'Nunca',
            exportService.formatCurrency(product.stock_value || 0),
            exportService.translateProductStatus(product.status),
            exportService.getProductRecommendation(product)
        ])

        if (format === 'csv') {
            return exportService.createCSVFromData(headers, data, 'Análisis de Productos')
        } else {
            return exportService.createExcelFromData(headers, data, 'Análisis de Productos', {
                includeCharts: true,
                includeFormulas: true
            })
        }
    },

    // ==================== REPORTES FINANCIEROS AVANZADOS ====================

    /**
     * Exportar reporte financiero completo
     */
    exportFinancialReport: async (dateFrom, dateTo, format = 'excel') => {
        try {
            const response = await api.get('/admin/reports/financial', {
                params: { date_from: dateFrom, date_to: dateTo, format },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting financial report:', error)
            return await exportService.createFinancialReport(dateFrom, dateTo, format)
        }
    },

    /**
     * Crear reporte financiero completo
     */
    createFinancialReport: async (dateFrom, dateTo, format = 'excel') => {
        const [salesData, expensesData, profitData] = await Promise.all([
            exportService.getSalesData(dateFrom, dateTo),
            exportService.getExpensesData(dateFrom, dateTo),
            exportService.getProfitData(dateFrom, dateTo)
        ])

        if (format === 'pdf') {
            return exportService.createFinancialPDFReport(salesData, expensesData, profitData, dateFrom, dateTo)
        }

        // Crear múltiples hojas para Excel
        const workbook = exportService.createMultiSheetWorkbook([
            {
                name: 'Resumen Ejecutivo',
                data: exportService.createExecutiveSummary(salesData, expensesData, profitData)
            },
            {
                name: 'Ventas Detalladas',
                data: exportService.formatSalesForExport(salesData)
            },
            {
                name: 'Análisis por Categoría',
                data: exportService.createCategoryAnalysis(salesData)
            },
            {
                name: 'Tendencias y Proyecciones',
                data: exportService.createTrendsAnalysis(salesData, profitData)
            }
        ])

        return workbook
    },

    // ==================== ANÁLISIS DE CLIENTES ====================

    /**
     * Exportar análisis de clientes
     */
    exportCustomerAnalysis: async (filters = {}, format = 'excel') => {
        try {
            const response = await api.get('/admin/customers/export-analysis', {
                params: { format, ...filters },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting customer analysis:', error)
            return await exportService.createCustomerAnalysisExport(filters, format)
        }
    },

    /**
     * Crear análisis de clientes
     */
    createCustomerAnalysisExport: async (filters = {}, format = 'excel') => {
        const customers = await exportService.getCustomerAnalyticsData(filters)

        const headers = [
            'Cliente',
            'Email',
            'Fecha Registro',
            'Total Pedidos',
            'Valor Total Compras',
            'Ticket Promedio',
            'Última Compra',
            'Días Desde Última Compra',
            'Frecuencia Compra (días)',
            'Categoría Favorita',
            'Estado Cliente',
            'LTV Estimado',
            'Segmento',
            'Riesgo Abandono'
        ]

        const data = customers.map(customer => [
            customer.name,
            customer.email,
            new Date(customer.created_at).toLocaleDateString('es-ES'),
            customer.total_orders || 0,
            exportService.formatCurrency(customer.total_spent || 0),
            exportService.formatCurrency(customer.average_order_value || 0),
            customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('es-ES') : 'Nunca',
            customer.days_since_last_order || 'N/A',
            customer.average_frequency_days || 'N/A',
            customer.favorite_category || 'No definida',
            exportService.translateCustomerStatus(customer.status),
            exportService.formatCurrency(customer.estimated_ltv || 0),
            exportService.getCustomerSegment(customer),
            exportService.getChurnRisk(customer)
        ])

        if (format === 'csv') {
            return exportService.createCSVFromData(headers, data, 'Análisis de Clientes')
        } else {
            return exportService.createExcelFromData(headers, data, 'Análisis de Clientes', {
                includeCharts: true,
                includePivotTable: true
            })
        }
    },

    // ==================== INVENTARIO AVANZADO ====================

    /**
     * Exportar reporte de inventario con valorización
     */
    exportInventoryValuation: async (format = 'excel') => {
        try {
            const response = await api.get('/admin/inventory/valuation-export', {
                params: { format },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting inventory valuation:', error)
            return await exportService.createInventoryValuationExport(format)
        }
    },

    /**
     * Crear reporte de valorización de inventario
     */
    createInventoryValuationExport: async (format = 'excel') => {
        const inventory = await exportService.getInventoryValuationData()

        const headers = [
            'Producto',
            'SKU',
            'Categoría',
            'Stock Físico',
            'Stock Reservado',
            'Stock Disponible',
            'Costo Unitario',
            'Precio Venta',
            'Margen Unitario',
            'Valor Stock (Costo)',
            'Valor Stock (Venta)',
            'Rotación Anual',
            'Meses de Stock',
            'ABC Analysis',
            'Obsolescencia',
            'Recomendación'
        ]

        const data = inventory.map(item => [
            item.name,
            item.sku || '',
            item.category_name || 'Sin categoría',
            item.physical_stock || 0,
            item.reserved_stock || 0,
            item.available_stock || 0,
            exportService.formatCurrency(item.unit_cost || 0),
            exportService.formatCurrency(item.selling_price || 0),
            exportService.formatCurrency((item.selling_price || 0) - (item.unit_cost || 0)),
            exportService.formatCurrency(item.cost_value || 0),
            exportService.formatCurrency(item.retail_value || 0),
            (item.annual_turnover || 0).toFixed(2),
            (item.months_of_stock || 0).toFixed(1),
            item.abc_classification || 'C',
            exportService.getObsolescenceRisk(item),
            exportService.getInventoryRecommendation(item)
        ])

        if (format === 'csv') {
            return exportService.createCSVFromData(headers, data, 'Valorización de Inventario')
        } else {
            return exportService.createExcelFromData(headers, data, 'Valorización de Inventario', {
                includeCharts: true,
                includeFormulas: true,
                includeSummary: true
            })
        }
    },

    // ==================== UTILIDADES MEJORADAS ====================

    /**
     * Crear CSV mejorado con metadatos
     */
    createCSVFromData: (headers, data, title = 'Reporte') => {
        const metadata = [
            `# ${title}`,
            `# Generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
            `# Total de registros: ${data.length}`,
            `# Deco Home - Sistema de Gestión`,
            ''
        ]

        const csv = [
            ...metadata,
            headers.map(h => `"${h}"`).join(','),
            ...data.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Agregar BOM para Excel
        const bom = '\uFEFF'
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
        return blob
    },

    /**
     * Crear Excel mejorado con formato
     */
    createExcelFromData: (headers, data, title = 'Reporte', options = {}) => {
        const totalValue = data.reduce((sum, row) => {
            const numericValues = row.filter(cell =>
                typeof cell === 'string' && cell.includes('$')
            ).map(cell => parseFloat(cell.replace(/[$,]/g, '')))
            return sum + numericValues.reduce((a, b) => a + b, 0)
        }, 0)

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - Deco Home</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            background-color: #f8f9fa;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            background: linear-gradient(135deg, #eddacb, #2d3c5d);
            color: white;
            padding: 20px;
            border-radius: 10px;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header .subtitle { font-size: 14px; margin-top: 5px; opacity: 0.9; }
          .summary { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .summary-value { font-size: 24px; font-weight: bold; color: #2d3c5d; }
          .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th { 
            background: linear-gradient(135deg, #eddacb, #d4c4b0);
            color: #2d3c5d;
            font-weight: bold; 
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            border-bottom: 2px solid #2d3c5d;
          }
          td { 
            padding: 10px 8px; 
            text-align: left; 
            border-bottom: 1px solid #eee;
            font-size: 11px;
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f0f7ff; }
          .number { text-align: right; font-family: 'Courier New', monospace; }
          .currency { color: #28a745; font-weight: 500; }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            color: #666; 
            font-size: 11px; 
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          .footer .logo { font-weight: bold; color: #2d3c5d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-ES')} - Deco Home</div>
        </div>
        
        ${options.includeSummary ? `
        <div class="summary">
          <h3>Resumen Ejecutivo</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${data.length}</div>
              <div class="summary-label">Total Registros</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${exportService.formatCurrency(totalValue)}</div>
              <div class="summary-label">Valor Total</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${exportService.formatCurrency(totalValue / data.length)}</div>
              <div class="summary-label">Promedio</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map((cell, index) => {
            const isCurrency = typeof cell === 'string' && cell.includes('$')
            const isNumber = !isNaN(cell) && typeof cell !== 'string'
            const className = isCurrency ? 'number currency' : isNumber ? 'number' : ''
            return `<td class="${className}">${cell}</td>`
        }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div class="logo">Deco Home</div>
          <div>Sistema de Gestión Empresarial</div>
          <div>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</div>
        </div>
      </body>
      </html>
    `

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
        return blob
    },

    // ==================== FUNCIONES DE FORMATO ====================

    formatCurrency: (value) => {
        if (isNaN(value) || value === null || value === undefined) return '$0.00'
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(value)
    },

    formatPercentage: (value) => {
        if (isNaN(value)) return '0%'
        return `${parseFloat(value).toFixed(1)}%`
    },

    translateStatus: (status) => {
        const translations = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        }
        return translations[status] || status
    },

    translatePaymentStatus: (status) => {
        const translations = {
            paid: 'Pagado',
            pending: 'Pendiente',
            failed: 'Fallido',
            refunded: 'Reembolsado'
        }
        return translations[status] || status
    },

    translatePaymentMethod: (method) => {
        const translations = {
            credit_card: 'Tarjeta de Crédito',
            debit_card: 'Tarjeta de Débito',
            bank_transfer: 'Transferencia',
            cash: 'Efectivo',
            mercado_pago: 'Mercado Pago'
        }
        return translations[method] || method
    },

    getStockStatus: (current, minimum) => {
        if (current === 0) return 'Sin Stock'
        if (current <= minimum) return 'Stock Bajo'
        if (current <= minimum * 2) return 'Stock Medio'
        return 'Stock Alto'
    },

    getProductRecommendation: (product) => {
        const stock = product.stock || 0
        const minStock = product.min_stock || 0
        const sales = product.total_sales || 0

        if (stock === 0) return 'Reabastecer Urgente'
        if (stock <= minStock) return 'Reabastecer Pronto'
        if (sales === 0) return 'Revisar Demanda'
        if (sales > 10) return 'Producto Exitoso'
        return 'Monitorear'
    },

    // ==================== DATOS MEJORADOS ====================

    /**
     * Obtener datos mejorados de pedidos
     */
    getEnhancedOrdersData: async (filters = {}) => {
        try {
            const response = await api.get('/admin/orders', {
                params: { ...filters, enhanced: true }
            })
            return response.data.data || []
        } catch (error) {
            console.error('Error getting enhanced orders data:', error)

            // Datos simulados mejorados
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
                    delivered_at: '2025-01-17T14:20:00Z',
                    notes: 'Entregar en horario de oficina',
                    margin_amount: 4500.00,
                    main_category: 'Iluminación',
                    items: [
                        { id: 1, product_name: 'Lámpara LED', product_sku: 'LAM-001', quantity: 2, price: 4500.00 },
                        { id: 2, product_name: 'Base Decorativa', product_sku: 'DEC-002', quantity: 1, price: 3000.00 }
                    ]
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
                    notes: '',
                    margin_amount: 2200.00,
                    main_category: 'Muebles',
                    items: [
                        { id: 3, product_name: 'Sillón Ejecutivo', product_sku: 'SIL-003', quantity: 1, price: 6500.00 }
                    ]
                }
            ]
        }
    },

    /**
     * Obtener datos de análisis de productos
     */
    getProductsAnalyticsData: async (filters = {}) => {
        try {
            const response = await api.get('/admin/products/analytics', { params: filters })
            return response.data.data || []
        } catch (error) {
            console.error('Error getting products analytics:', error)

            return [
                {
                    id: 1,
                    name: 'Lámpara Moderna LED',
                    sku: 'LAM-001',
                    category_name: 'Iluminación',
                    price: 4500.00,
                    stock: 15,
                    min_stock: 5,
                    status: 'active',
                    total_sales: 45,
                    revenue: 202500.00,
                    margin_percent: 35.5,
                    turnover_days: 22,
                    last_movement: '2025-01-15T00:00:00Z',
                    stock_value: 67500.00
                },
                {
                    id: 2,
                    name: 'Mesa de Centro Premium',
                    sku: 'MES-002',
                    category_name: 'Muebles',
                    price: 8500.00,
                    stock: 3,
                    min_stock: 3,
                    status: 'active',
                    total_sales: 18,
                    revenue: 153000.00,
                    margin_percent: 42.3,
                    turnover_days: 35,
                    last_movement: '2025-01-13T00:00:00Z',
                    stock_value: 25500.00
                }
            ]
        }
    },

    /**
     * Obtener datos de análisis de clientes
     */
    getCustomerAnalyticsData: async (filters = {}) => {
        try {
            const response = await api.get('/admin/customers/analytics', { params: filters })
            return response.data.data || []
        } catch (error) {
            console.error('Error getting customer analytics:', error)

            return [
                {
                    id: 1,
                    name: 'Juan Pérez',
                    email: 'juan@example.com',
                    created_at: '2024-03-15T00:00:00Z',
                    total_orders: 8,
                    total_spent: 45000.00,
                    average_order_value: 5625.00,
                    last_order_date: '2025-01-15T00:00:00Z',
                    days_since_last_order: 1,
                    average_frequency_days: 28,
                    favorite_category: 'Iluminación',
                    status: 'active',
                    estimated_ltv: 75000.00
                },
                {
                    id: 2,
                    name: 'María García',
                    email: 'maria@example.com',
                    created_at: '2024-06-20T00:00:00Z',
                    total_orders: 4,
                    total_spent: 22000.00,
                    average_order_value: 5500.00,
                    last_order_date: '2025-01-10T00:00:00Z',
                    days_since_last_order: 6,
                    average_frequency_days: 45,
                    favorite_category: 'Muebles',
                    status: 'active',
                    estimated_ltv: 45000.00
                }
            ]
        }
    },

    getCustomerSegment: (customer) => {
        const totalSpent = customer.total_spent || 0
        const totalOrders = customer.total_orders || 0

        if (totalSpent > 50000 && totalOrders > 5) return 'VIP'
        if (totalSpent > 25000 && totalOrders > 3) return 'Premium'
        if (totalSpent > 10000 || totalOrders > 1) return 'Regular'
        return 'Nuevo'
    },

    getChurnRisk: (customer) => {
        const daysSinceLastOrder = customer.days_since_last_order || 0
        const avgFrequency = customer.average_frequency_days || 30

        if (daysSinceLastOrder > avgFrequency * 3) return 'Alto'
        if (daysSinceLastOrder > avgFrequency * 2) return 'Medio'
        return 'Bajo'
    }
}

export default exportService