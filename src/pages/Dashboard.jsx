import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('Error al cargar estadísticas del dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total ventas',
      stat: `$${parseFloat(stats.totals?.total_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      change: '+9.12%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-600',
      count: stats.totals?.total_orders || 0,
    },
    {
      name: 'Visitas',
      stat: (stats.totals?.total_orders || 0).toLocaleString('es-ES'),
      change: '+12.18%',
      changeType: 'increase',
      icon: EyeIcon,
      color: 'bg-yellow-500',
      count: stats.totals?.total_orders || 0,
    },
    {
      name: 'Ganancias',
      stat: `$${parseFloat(stats.totals?.monthly_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      change: '+9.12%',
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-600',
      count: stats.totals?.pending_orders || 0,
    },
  ]

  const pieColors = ['#3b82f6', '#eab308', '#ef4444', '#10b981', '#f59e0b']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resumen</h1>
          <p className="text-gray-600 mt-1">Panel de control de ventas</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm">
          Exportar data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className={`${item.color} p-4 rounded-xl`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <div className="ml-5 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">{item.name}</p>
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                    {item.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.stat}</p>
                <p className="text-xs text-gray-500 mt-1">{item.count.toLocaleString()} Ordenes</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance de ventas</h3>
              <p className="text-sm text-gray-600">Ingresos mensuales</p>
            </div>
            <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
              Exportar data
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={stats.monthly_sales || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('es-ES', { month: 'short' })
                }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`$${parseFloat(value).toLocaleString('es-ES')}`, 'Ingresos']}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorRevenue)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top categorias</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Revestimientos y placas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Muebles</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Jardin</span>
            </div>
          </div>
          {stats.top_products && stats.top_products.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.top_products.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="total_sold"
                  nameKey="name"
                >
                  {stats.top_products.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'Vendidos']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <ChartBarIcon className="w-8 h-8 mr-2" />
              <span>Sin datos de productos</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos recientes</h3>
            <span className="text-sm text-gray-500">{stats.recent_orders?.length || 0} pedidos</span>
          </div>
          <div className="space-y-4">
            {stats.recent_orders && stats.recent_orders.length > 0 ? (
              stats.recent_orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-gray-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                       order.status === 'processing' ? 'Procesando' :
                       order.status === 'delivered' ? 'Entregado' :
                       order.status === 'cancelled' ? 'Cancelado' :
                       order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2" />
                <p>No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock bajo</h3>
            <span className="text-sm text-gray-500">{stats.low_stock?.length || 0} productos</span>
          </div>
          <div className="space-y-4">
            {stats.low_stock && stats.low_stock.length > 0 ? (
              stats.low_stock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-red-600">
                      {product.stock} unidades
                    </p>
                    <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                <p>Stock en niveles normales</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
