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
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

const navigation = [
  { name: 'Resumen', href: '/dashboard', icon: HomeIcon },
  { name: 'Productos', href: '/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/categories', icon: FolderIcon },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCartIcon },
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
]

const secondaryNavigation = [
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Ayuda', href: '/help', icon: QuestionMarkCircleIcon },
]

const Sidebar = () => {
  const { user, logout } = useAuth()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Deco Home</h1>
              <p className="text-sm text-gray-500">Sin Rival 2025</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-grow">
          <div className="px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-3 text-sm font-medium rounded-l-lg transition-colors duration-200`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-5 w-5"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-8">
            <div className="px-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-l-lg transition-colors duration-200"
                >
                  <item.icon
                    className="mr-3 flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 px-2">
          <button
            onClick={logout}
            className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-l-lg transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon
              className="mr-3 flex-shrink-0 h-5 w-5"
              aria-hidden="true"
            />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
