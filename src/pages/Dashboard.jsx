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
  ArrowUpIcon,
  ArrowDownIcon,
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
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#eddacb]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#eddacb] animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <ExclamationTriangleIcon className="w-12 h-12 text-[#eddacb] mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No se pudieron cargar las estadísticas</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-[#eddacb] text-slate-900 rounded-lg font-medium hover:bg-[#eddacb] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total ventas',
      stat: `$${parseFloat(stats.totals?.total_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      count: `${stats.totals?.total_orders || 0} ventas`,
    },
    {
      name: 'Visitas del mes',
      stat: (stats.totals?.total_orders * 8.5 || 0).toLocaleString('es-ES', { maximumFractionDigits: 0 }),
      change: '+8.2%',
      changeType: 'increase',
      icon: EyeIcon,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      count: 'este mes',
    },
    {
      name: 'Ganancias',
      stat: `$${parseFloat(stats.totals?.monthly_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      change: '+15.8%',
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
      gradient: 'from-[#eddacb] to-[#eddacb]',
      bg: 'bg-amber-50',
      iconColor: 'text-[#eddacb]',
      count: 'este mes',
    },
    {
      name: 'Productos',
      stat: (stats.totals?.total_products || 142).toLocaleString('es-ES'),
      change: '+3.1%',
      changeType: 'increase',
      icon: ShoppingBagIcon,
      gradient: 'from-purple-500 to-violet-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      count: 'en catálogo',
    },
  ]

  const pieColors = ['#3b82f6', '#eab308', '#ef4444', '#10b981', '#f59e0b']

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel de Control</h1>
          <p className="text-slate-600 text-lg">Bienvenido de nuevo, aquí tienes el resumen de tu negocio</p>
        </div>
        <button className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-[#eddacb]/25 hover:shadow-xl hover:shadow-[#eddacb]/30 hover:scale-105">
          Exportar Reporte
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item) => (
          <div key={item.name} className="group bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`${item.bg} p-3 rounded-xl`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <div className="flex items-center text-right">
                <ArrowUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-sm font-semibold text-emerald-600">
                  {item.change}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">{item.name}</p>
              <p className="text-3xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                {item.stat}
              </p>
              <p className="text-xs text-slate-500">{item.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Rendimiento de Ventas</h3>
              <p className="text-slate-600">Ingresos mensuales del año</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
                <span className="text-sm text-slate-600 font-medium">Ingresos</span>
              </div>
              <button className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                Ver detalles
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={stats.monthly_sales || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                fontSize={12}
                fontWeight="500"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('es-ES', { month: 'short' })
                }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                fontWeight="500"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500'
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
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 3, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Categorías Top</h3>
            <p className="text-slate-600">Productos más vendidos</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-slate-700">Revestimientos</span>
              </div>
              <span className="text-sm font-bold text-slate-900">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#eddacb] rounded-full mr-3"></div>
                <span className="text-sm font-medium text-slate-700">Muebles</span>
              </div>
              <span className="text-sm font-bold text-slate-900">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-slate-700">Jardín</span>
              </div>
              <span className="text-sm font-bold text-slate-900">22%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-slate-700">Otros</span>
              </div>
              <span className="text-sm font-bold text-slate-900">15%</span>
            </div>
          </div>
          
          {stats.top_products && stats.top_products.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.top_products.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={30}
                  paddingAngle={3}
                  dataKey="total_sold"
                  nameKey="name"
                >
                  {stats.top_products.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontWeight: '500'
                  }}
                  formatter={(value, name) => [value, 'Vendidos']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400">
              <ChartBarIcon className="w-8 h-8 mr-2" />
              <span className="font-medium">Sin datos disponibles</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Pedidos Recientes</h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
              {stats.recent_orders?.length || 0} pedidos
            </span>
          </div>
          
          <div className="space-y-4">
            {stats.recent_orders && stats.recent_orders.length > 0 ? (
              stats.recent_orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{order.order_number}</p>
                    <p className="text-sm text-slate-600">{order.customer_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
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
              <div className="text-center text-slate-400 py-8">
                <ShoppingBagIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Stock Bajo</h3>
            <span className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full font-medium">
              {stats.low_stock?.length || 0} alertas
            </span>
          </div>
          
          <div className="space-y-4">
            {stats.low_stock && stats.low_stock.length > 0 ? (
              stats.low_stock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0 hover:bg-red-50/30 rounded-lg px-2 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">
                      {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">Min: {product.min_stock}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="font-medium text-emerald-600">Stock en niveles normales</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard