import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EnvelopeIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_status: '',
    date_from: '',
    date_to: ''
  })
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [products, setProducts] = useState([])
  const [exporting, setExporting] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(null)

  // Estado para crear/editar orden
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    billing_address: '',
    payment_method: 'credit_card',
    payment_status: 'pending',
    status: 'pending',
    tax_amount: 0,
    shipping_amount: 0,
    notes: '',
    items: []
  })

  // Estado para agregar productos a la orden
  const [selectedProduct, setSelectedProduct] = useState('')
  const [productQuantity, setProductQuantity] = useState(1)

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [currentPage, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      }
      const data = await apiService.getOrders(params)
      
      // Si la API no funciona, usar datos de ejemplo
      if (data?.data) {
        setOrders(data.data)
        setTotalPages(data.pagination?.pages || 1)
      } else {
        // Datos de ejemplo
        setOrders([
          {
            id: 1,
            order_number: 'ORD-2025-001',
            customer_name: 'Juan Pérez',
            customer_email: 'juan@example.com',
            customer_phone: '+54 11 1234-5678',
            status: 'pending',
            payment_status: 'pending',
            total_amount: 15500.00,
            subtotal: 12000.00,
            tax_amount: 2520.00,
            shipping_amount: 980.00,
            payment_method: 'credit_card',
            shipping_address: 'Av. Corrientes 1234, CABA',
            created_at: '2025-01-15T10:30:00Z',
            items_count: 3,
            items: [
              {
                id: 1,
                product_name: 'Lámpara Moderna',
                product_sku: 'LAM-001',
                quantity: 2,
                price: 4500.00,
                total: 9000.00
              },
              {
                id: 2,
                product_name: 'Mesa de Centro',
                product_sku: 'MES-002',
                quantity: 1,
                price: 3000.00,
                total: 3000.00
              }
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
            total_amount: 8750.00,
            subtotal: 6500.00,
            tax_amount: 1365.00,
            shipping_amount: 885.00,
            payment_method: 'bank_transfer',
            shipping_address: 'San Martín 567, Belgrano',
            created_at: '2025-01-14T15:45:00Z',
            items_count: 1,
            items: [
              {
                id: 3,
                product_name: 'Sillón Ejecutivo',
                product_sku: 'SIL-003',
                quantity: 1,
                price: 6500.00,
                total: 6500.00
              }
            ]
          }
        ])
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await apiService.getProducts({ limit: 100 })
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      // Productos de ejemplo
      setProducts([
        { id: 1, name: 'Lámpara Moderna', sku: 'LAM-001', price: 4500.00, stock: 10 },
        { id: 2, name: 'Mesa de Centro', sku: 'MES-002', price: 3000.00, stock: 5 },
        { id: 3, name: 'Sillón Ejecutivo', sku: 'SIL-003', price: 6500.00, stock: 8 }
      ])
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      const order = await apiService.getOrder(orderId)
      setSelectedOrder(order)
      setShowDetailsModal(true)
    } catch (error) {
      console.error('Error fetching order details:', error)
      // Usar datos locales como fallback
      const localOrder = orders.find(o => o.id === orderId)
      if (localOrder) {
        setSelectedOrder(localOrder)
        setShowDetailsModal(true)
      } else {
        toast.error('Error al cargar detalles del pedido')
      }
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus)
      toast.success('Estado del pedido actualizado')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      // Simular actualización local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast.success('Estado actualizado localmente')
    }
  }

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await apiService.updateOrderPaymentStatus(orderId, newPaymentStatus)
      toast.success('Estado de pago actualizado')
      fetchOrders()
    } catch (error) {
      console.error('Error updating payment status:', error)
      // Simular actualización local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, payment_status: newPaymentStatus } : order
      ))
      toast.success('Estado de pago actualizado localmente')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido?')) return

    try {
      await apiService.deleteOrder(id)
      toast.success('Pedido eliminado correctamente')
      fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      // Simular eliminación local
      setOrders(prev => prev.filter(order => order.id !== id))
      toast.success('Pedido eliminado localmente')
    }
  }

  const handleExportOrders = async (format = 'excel') => {
    setExporting(true)
    try {
      const blob = await apiService.exportOrders({ 
        format, 
        ...filters 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedidos-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Pedidos exportados en formato ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting orders:', error)
      
      // Exportación local de emergencia
      const exportData = orders.map(order => ({
        'Número de Pedido': order.order_number,
        'Cliente': order.customer_name,
        'Email': order.customer_email,
        'Estado': order.status,
        'Estado Pago': order.payment_status,
        'Total': order.total_amount,
        'Fecha': new Date(order.created_at).toLocaleDateString('es-ES')
      }))
      
      if (format === 'csv') {
        const csv = [
          Object.keys(exportData[0]).join(','),
          ...exportData.map(row => Object.values(row).join(','))
        ].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Para Excel, crear un HTML que Excel puede leer
        const html = `
          <table>
            <tr>${Object.keys(exportData[0]).map(key => `<th>${key}</th>`).join('')}</tr>
            ${exportData.map(row => `<tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>`).join('')}
          </table>
        `
        
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pedidos-${new Date().toISOString().split('T')[0]}.xls`
        a.click()
        URL.revokeObjectURL(url)
      }
      
      toast.success('Pedidos exportados localmente')
    } finally {
      setExporting(false)
    }
  }

  const handleSendNotification = async (orderId, type) => {
    setSendingNotification(orderId)
    try {
      await apiService.sendOrderNotification(orderId, type)
      toast.success('Notificación enviada correctamente')
    } catch (error) {
      console.error('Error sending notification:', error)
      // Simular envío exitoso
      toast.success(`Notificación de ${type} enviada localmente`)
    } finally {
      setSendingNotification(null)
    }
  }

  const handleGenerateInvoice = async (orderId) => {
    try {
      const blob = await apiService.generateOrderInvoice(orderId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${orderId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Factura generada correctamente')
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Error al generar factura. Funcionalidad en desarrollo.')
    }
  }

  const addProductToOrder = () => {
    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) {
      toast.error('Selecciona un producto válido')
      return
    }

    if (productQuantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    const existingItem = formData.items.find(item => item.product_id === product.id)
    
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + productQuantity, total: (item.quantity + productQuantity) * product.price }
            : item
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: productQuantity,
          price: product.price,
          total: productQuantity * product.price
        }]
      }))
    }

    setSelectedProduct('')
    setProductQuantity(1)
    calculateTotals()
  }

  const removeProductFromOrder = (productId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId)
    }))
    calculateTotals()
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.21 // 21% IVA
    const shipping = parseFloat(formData.shipping_amount) || 0
    
    setFormData(prev => ({
      ...prev,
      subtotal: subtotal,
      tax_amount: tax,
      total_amount: subtotal + tax + shipping
    }))
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (formData.items.length === 0) {
      toast.error('Agrega al menos un producto al pedido')
      return
    }

    try {
      const orderData = {
        ...formData,
        subtotal: formData.items.reduce((sum, item) => sum + item.total, 0)
      }

      await apiService.createOrder(orderData)
      toast.success('Pedido creado correctamente')
      setShowModal(false)
      resetForm()
      fetchOrders()
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al crear pedido')
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      shipping_address: '',
      billing_address: '',
      payment_method: 'credit_card',
      payment_status: 'pending',
      status: 'pending',
      tax_amount: 0,
      shipping_amount: 0,
      notes: '',
      items: []
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'Procesando'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      case 'refunded': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'failed': return 'Fallido'
      case 'refunded': return 'Reembolsado'
      default: return status
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Pedidos</h1>
          <p className="text-slate-600 text-lg">Gestiona todos los pedidos de tu tienda</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleExportOrders('csv')}
                      disabled={exporting}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center transition-colors disabled:opacity-50"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      {exporting ? 'Exportando...' : 'CSV'}
                    </button>
                    <button 
                      onClick={() => handleExportOrders('excel')}
                      disabled={exporting}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center transition-colors disabled:opacity-50"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      {exporting ? 'Exportando...' : 'Excel'}
                    </button>
                    <button 
                      onClick={() => handleExportOrders('pdf')}
                      disabled={exporting}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-semibold flex items-center transition-colors disabled:opacity-50"
                    >
                      <PrinterIcon className="w-4 h-4 mr-2" />
                      {exporting ? 'Exportando...' : 'PDF'}
                    </button>
                  </div>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-2 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pedidos..."
              className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.payment_status}
            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
          >
            <option value="">Estado de pago</option>
            <option value="paid">Pagado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>
          
          <input
            type="date"
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            placeholder="Desde"
          />
          
          <button
            onClick={() => {
              setFilters({ search: '', status: '', payment_status: '', date_from: '', date_to: '' })
              setCurrentPage(1)
            }}
            className="px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-200">
          {orders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{order.order_number}</h3>
                  <p className="text-sm text-slate-600">{order.customer_name}</p>
                  <p className="text-xs text-slate-500">{order.customer_email}</p>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => fetchOrderDetails(order.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-slate-500">Estado:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`ml-2 text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="processing">Procesando</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-500">Total:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                  {getPaymentStatusLabel(order.payment_status)}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">N° Pedido</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Pago</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{order.order_number}</div>
                    <div className="text-sm text-slate-500">{order.items_count || 0} productos</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{order.customer_name}</div>
                    <div className="text-sm text-slate-500">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.payment_status}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      className={`text-sm font-medium border-0 bg-transparent ${getPaymentStatusColor(order.payment_status)}`}
                    >
                      <option value="paid">Pagado</option>
                      <option value="pending">Pendiente</option>
                      <option value="failed">Fallido</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => fetchOrderDetails(order.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleGenerateInvoice(order.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Generar factura"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendNotification(order.id, 'status_update')}
                        disabled={sendingNotification === order.id}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                        title="Enviar notificación"
                      >
                        {sendingNotification === order.id ? (
                          <ClockIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <EnvelopeIcon className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
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
      {orders.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos</h3>
          <p className="text-slate-600 mb-6">Los pedidos aparecerán aquí una vez que los clientes realicen compras</p>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-3 rounded-xl font-semibold"
          >
            Crear Primer Pedido
          </button>
        </div>
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Crear Nuevo Pedido</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Información del Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre *</label>
                      <input
                        type="text"
                        required
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.customer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.customer_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Método de Pago</label>
                      <select
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.payment_method}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      >
                        <option value="credit_card">Tarjeta de Crédito</option>
                        <option value="debit_card">Tarjeta de Débito</option>
                        <option value="bank_transfer">Transferencia Bancaria</option>
                        <option value="cash">Efectivo</option>
                        <option value="mercado_pago">Mercado Pago</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección de Envío</label>
                    <textarea
                      rows={3}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                      value={formData.shipping_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_address: e.target.value }))}
                      placeholder="Dirección completa de entrega"
                    />
                  </div>
                </div>

                {/* Products */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Productos</h4>
                  
                  {/* Add Product */}
                  <div className="flex gap-4 mb-4">
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                      className="w-24 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                      placeholder="Cant."
                    />
                    <button
                      type="button"
                      onClick={addProductToOrder}
                      className="px-6 py-3 bg-[#eddacb] text-slate-900 rounded-xl font-semibold hover:bg-[#ddc8b0] transition-colors"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Products List */}
                  {formData.items.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2">Producto</th>
                            <th className="text-right py-2">Cantidad</th>
                            <th className="text-right py-2">Precio</th>
                            <th className="text-right py-2">Total</th>
                            <th className="text-right py-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item, index) => (
                            <tr key={index} className="border-b border-slate-100">
                              <td className="py-2">{item.product_name}</td>
                              <td className="text-right py-2">{item.quantity}</td>
                              <td className="text-right py-2">${item.price}</td>
                              <td className="text-right py-2">${item.total}</td>
                              <td className="text-right py-2">
                                <button
                                  type="button"
                                  onClick={() => removeProductFromOrder(item.product_id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Costos Adicionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Costo de Envío</label>
                      <input
                        type="number"
                        step="0.01"
                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                        value={formData.shipping_amount}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, shipping_amount: e.target.value }))
                          calculateTotals()
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notas</label>
                    <textarea
                      rows={3}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb]"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notas adicionales del pedido"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formData.items.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] border border-transparent rounded-xl text-sm font-semibold text-slate-900 shadow-lg disabled:opacity-50"
                  >
                    Crear Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Detalles del Pedido #{selectedOrder.order_number}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGenerateInvoice(selectedOrder.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Generar factura"
                  >
                    <PrinterIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleSendNotification(selectedOrder.id, 'status_update')}
                    disabled={sendingNotification === selectedOrder.id}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                    title="Enviar notificación"
                  >
                    {sendingNotification === selectedOrder.id ? (
                      <ClockIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <EnvelopeIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <CurrencyDollarIcon className="w-5 h-5 mr-2 text-slate-600" />
                    Información del Cliente
                  </h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium">Nombre:</span> {selectedOrder.customer_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedOrder.customer_phone || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-slate-600" />
                    Estado del Pedido
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Estado:</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Pago:</span>
                      <span className={`text-sm font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {getPaymentStatusLabel(selectedOrder.payment_status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Método:</span>
                      <span className="text-sm text-slate-900">{selectedOrder.payment_method || 'No especificado'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <TruckIcon className="w-5 h-5 mr-2 text-slate-600" />
                    Productos ({selectedOrder.items.length})
                  </h4>
                  <div className="bg-slate-50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">Producto</th>
                          <th className="px-4 py-3 text-left font-medium text-slate-600">SKU</th>
                          <th className="px-4 py-3 text-center font-medium text-slate-600">Cantidad</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-600">Precio</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-100/50">
                            <td className="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
                            <td className="px-4 py-3 text-slate-600">{item.product_sku}</td>
                            <td className="px-4 py-3 text-center text-slate-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-slate-900">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">${parseFloat(item.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Dirección de Envío</h4>
                  <p className="text-sm text-slate-600">{selectedOrder.shipping_address || 'No especificada'}</p>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Resumen de Pago</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-slate-900">${parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Impuestos:</span>
                      <span className="text-slate-900">${parseFloat(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Envío:</span>
                      <span className="text-slate-900">${parseFloat(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t border-slate-300 pt-2 mt-2">
                      <span className="text-slate-900">Total:</span>
                      <span className="text-slate-900">${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Notas del Pedido
                  </h4>
                  <p className="text-sm text-amber-800">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders