import { useState } from 'react'
import { BellIcon, MagnifyingGlassIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Header = () => {
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Sesión cerrada correctamente')
      navigate('/login')
    } catch (error) {
      // El logout en el contexto ya maneja la limpieza local
      toast.success('Sesión cerrada')
      navigate('/login')
    }
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    navigate('/settings')
  }

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="flex-1 px-4 lg:px-6 flex justify-between items-center">
        <div className="flex-1 flex max-w-lg ml-12 lg:ml-0">
        </div>
        {/* Search - Oculto en móvil muy pequeño 
        <div className="flex-1 flex max-w-lg ml-12 lg:ml-0">
          <div className="w-full flex">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#eddacb]/50 focus:border-[#eddacb] transition-all duration-200 text-sm font-medium"
                placeholder="Buscar..."
                type="search"
              />
            </div>
          </div>
        </div>*/}

        {/* Right side */}
        <div className="ml-4 lg:ml-6 flex items-center space-x-3 lg:space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-[#eddacb]/50 transition-all duration-200">
            <BellIcon className="h-6 w-6" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
          </button>

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