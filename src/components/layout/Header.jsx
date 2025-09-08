import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user } = useAuth()

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex-1 px-4 lg:px-6 flex justify-between items-center">
        {/* Search - Oculto en móvil muy pequeño */}
        <div className="flex-1 flex max-w-lg ml-12 lg:ml-0">
          <div className="w-full flex">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 text-sm font-medium"
                placeholder="Buscar..."
                type="search"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-4 lg:ml-6 flex items-center space-x-3 lg:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all duration-200">
            <BellIcon className="h-6 w-6" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
          </button>

          {/* Profile - Solo en desktop */}
          <div className="relative hidden lg:flex items-center">
            <div className="flex items-center bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-200/80 hover:border-slate-300 transition-colors duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
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
            </div>
          </div>

          {/* Profile mobile - Solo avatar */}
          <div className="lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-slate-900 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header

