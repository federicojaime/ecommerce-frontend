import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  ShoppingBagIcon,
  FolderIcon,
  ShoppingCartIcon,
  UsersIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: HomeIcon },
  { name: 'Productos', href: '/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/categories', icon: FolderIcon },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
]

const secondaryNavigation = [
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon, disabled: false },
  { name: 'Ayuda', href: '/help', icon: QuestionMarkCircleIcon, disabled: false },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-lg transition-all duration-200"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#2d3c5d' }}
      >
        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
          {/* Logo GRANDE - Más pequeño en móvil */}
          <div className="flex items-center justify-center px-4 mb-6 lg:mb-10">
            <div className="text-center">
              <div className="w-24 h-24 lg:w-40 lg:h-40 mx-auto mb-3 lg:mb-4">
                <img
                  src={logo}
                  alt="Deco Home Logo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <p className="text-slate-300 text-sm font-medium">Panel Admin</p>
            </div>
          </div>

          {/* Navigation Principal */}
          <nav className="flex-1 px-3">
            <div className="space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  data-tutorial={
                    item.href === '/dashboard' ? 'dashboard-link' : 
                    item.href === '/products' ? 'products-link' :
                    item.href === '/categories' ? 'categories-link' :
                    item.href === '/orders' ? 'orders-link' : undefined
                  }
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#eddacb]/15 text-[#eddacb] shadow-lg shadow-[#eddacb]/25'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Indicador activo - línea dorada */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-[#eddacb] to-[#eddacb] rounded-r-full shadow-lg shadow-[#eddacb]/40" />
                      )}
                      <item.icon
                        className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                          isActive ? 'text-[#eddacb]' : 'text-slate-300 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Separador */}
            <div className="my-6 lg:my-8 border-t border-white/10" />

            {/* Navigation Secundaria */}
            <div className="space-y-2">
              {secondaryNavigation.map((item) => (
                item.disabled ? (
                  <div
                    key={item.name}
                    className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-slate-400 cursor-not-allowed opacity-60 relative"
                  >
                    <item.icon
                      className="mr-4 flex-shrink-0 h-6 w-6 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="ml-auto text-xs bg-[#eddacb]/20 text-amber-300 px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  </div>
                ) : (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                        isActive
                          ? 'bg-[#eddacb]/15 text-[#eddacb] shadow-lg shadow-[#eddacb]/25'
                          : 'text-slate-200 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Indicador activo - línea dorada */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-[#eddacb] to-[#eddacb] rounded-r-full shadow-lg shadow-[#eddacb]/40" />
                        )}
                        <item.icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200 ${
                            isActive ? 'text-[#eddacb]' : 'text-slate-300 group-hover:text-white'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="truncate font-medium">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                )
              ))}
            </div>
          </nav>

          {/* User Info - Solo en móvil */}
          <div className="mx-4 mb-4 p-3 bg-black/20 rounded-xl border border-white/10 lg:hidden">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-slate-900 font-bold text-xs">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-slate-300 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={() => {
                logout()
                closeMobileMenu()
              }}
              className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-slate-200 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/30"
            >
              <ArrowRightOnRectangleIcon
                className="mr-4 flex-shrink-0 h-6 w-6 text-slate-300 group-hover:text-red-400 transition-colors duration-200"
                aria-hidden="true"
              />
              <span className="truncate font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar