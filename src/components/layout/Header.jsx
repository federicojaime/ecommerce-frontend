import { useState } from 'react'
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon, 
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import toast from 'react-hot-toast'

const Header = () => {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  
  // Hook de notificaciones
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getRelativeTime
  } = useNotifications()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada correctamente')
      navigate('/login')
    } catch (error) {
      toast.success('Sesión cerrada')
      navigate('/login')
    }
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    navigate('/settings')
  }

  const handleNotificationClick = (notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Navegar a la URL de acción si existe
    if (notification.action_url) {
      navigate(notification.action_url)
    }
    
    setShowNotifications(false)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation()
    deleteNotification(notificationId)
  }

  // Iconos para diferentes tipos de notificaciones
  const getNotificationIcon = (type, color) => {
    const iconProps = { className: `h-5 w-5 text-${color}-500` }
    
    switch (type) {
      case 'new_order':
        return <ShoppingCartIcon {...iconProps} />
      case 'low_stock':
        return <ExclamationTriangleIcon {...iconProps} />
      case 'order_delivered':
        return <CheckCircleIcon {...iconProps} />
      case 'user_registered':
        return <UserPlusIcon {...iconProps} />
      default:
        return <BellIcon {...iconProps} />
    }
  }

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex-1 px-4 lg:px-6 flex justify-between items-center">
        <div className="flex-1 flex max-w-lg ml-12 lg:ml-0">
        </div>

        {/* Right side */}
        <div className="ml-4 lg:ml-6 flex items-center space-x-3 lg:space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-[#eddacb]/50 transition-all duration-200"
            >
              {unreadCount > 0 ? (
                <BellSolidIcon className="h-6 w-6 text-[#eddacb]" />
              ) : (
                <BellIcon className="h-6 w-6" />
              )}
              
              {/* Badge de notificaciones */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              
              {/* Indicador de pulse si hay notificaciones nuevas */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-75"></span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <>
                {/* Overlay */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-20 max-h-96 overflow-hidden">
                  {/* Header del dropdown */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Notificaciones {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-[#eddacb] hover:text-[#d4c4b0] font-medium"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  {/* Lista de notificaciones */}
                  <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#eddacb] mx-auto"></div>
                        <p className="text-sm text-slate-500 mt-2">Cargando...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <BellIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No hay notificaciones</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors duration-150 ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {/* Icono de la notificación */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                notification.color === 'blue' ? 'bg-blue-100' :
                                notification.color === 'yellow' ? 'bg-yellow-100' :
                                notification.color === 'green' ? 'bg-green-100' :
                                'bg-slate-100'
                              }`}>
                                {getNotificationIcon(notification.type, notification.color)}
                              </div>
                              
                              {/* Contenido */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium text-slate-900 ${
                                    !notification.read ? 'font-semibold' : ''
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {getRelativeTime(notification.created_at)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Botón eliminar */}
                            <button
                              onClick={(e) => handleDeleteNotification(e, notification.id)}
                              className="ml-2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer si hay notificaciones */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => {
                          navigate('/notifications')
                          setShowNotifications(false)
                        }}
                        className="text-sm text-[#eddacb] hover:text-[#d4c4b0] font-medium"
                      >
                        Ver todas las notificaciones
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown - Solo en desktop */}
          <div className="relative hidden lg:flex items-center" data-tutorial="user-profile">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#eddacb]/50"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-slate-900 font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-700">
                  Hola, {user?.name?.split(' ')[0]}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <ChevronDownIcon className={`ml-2 h-4 w-4 text-slate-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Overlay para cerrar el menú */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-slate-900 font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <UserIcon className="h-4 w-4 mr-3 text-slate-500" />
                      Mi Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        navigate('/settings')
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3 text-slate-500" />
                      Configuración
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile mobile - Solo avatar con menú simple */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-lg flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-[#eddacb]/50"
            >
              <span className="text-slate-900 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </button>

            {/* Mobile Menu */}
            {showProfileMenu && (
              <>
                {/* Overlay */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="h-4 w-4 mr-3 text-slate-500" />
                    Mi Perfil
                  </button>
                  
                  <div className="border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Salir
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header