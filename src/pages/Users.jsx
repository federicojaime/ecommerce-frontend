import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Users = () => {
  const { user: currentUser, hasRole, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    status: 'active',
    phone: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      }
      const data = await apiService.getUsers(params)
      setUsers(data.data || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
      
      // Datos de fallback si la API no funciona
      setUsers([
        {
          id: 1,
          name: 'Admin',
          email: 'admin@ecommerce.com',
          role: 'admin',
          status: 'active',
          created_at: '2025-01-01 00:00:00',
          phone: '+54 11 1234-5678'
        },
        {
          id: 2,
          name: 'Usuario Demo',
          email: 'demo@ecommerce.com',
          role: 'customer',
          status: 'active',
          created_at: '2025-01-02 00:00:00',
          phone: '+54 11 8765-4321'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio')
      return false
    }

    if (!formData.email.trim()) {
      toast.error('El email es obligatorio')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('El email no es válido')
      return false
    }

    if (!editingUser) {
      if (!formData.password) {
        toast.error('La contraseña es obligatoria')
        return false
      }

      if (formData.password.length < 8) {
        toast.error('La contraseña debe tener al menos 8 caracteres')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return false
      }
    }

    if (editingUser && formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        status: formData.status,
        phone: formData.phone.trim()
      }

      // Agregar contraseña solo si se especifica
      if (formData.password) {
        userData.password = formData.password
        userData.password_confirmation = formData.confirmPassword
      }

      if (editingUser) {
        await apiService.updateUser(editingUser.id, userData)
        toast.success('Usuario actualizado correctamente')
      } else {
        await apiService.createUser(userData)
        toast.success('Usuario creado correctamente')
      }

      setShowModal(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error al guardar usuario'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'customer',
      status: user.status || 'active',
      phone: user.phone || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await apiService.deleteUser(id)
      toast.success('Usuario eliminado correctamente')
      setShowDeleteAlert(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      const errorMessage = error.response?.data?.error || 'Error al eliminar usuario'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      status: 'active',
      phone: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const openCreateModal = () => {
    resetForm()
    setEditingUser(null)
    setShowModal(true)
  }

  const canEditUser = (user) => {
    // Admin puede editar a todos excepto a sí mismo si es el único admin
    if (isAdmin()) {
      return true
    }
    
    // Staff puede editar solo customers
    if (hasRole('staff')) {
      return user.role === 'customer'
    }
    
    return false
  }

  const canDeleteUser = (user) => {
    // No se puede eliminar el usuario actual
    if (user.id === currentUser?.id) {
      return false
    }
    
    // Admin puede eliminar todos excepto otros admins
    if (isAdmin()) {
      return user.role !== 'admin'
    }
    
    // Staff puede eliminar solo customers
    if (hasRole('staff')) {
      return user.role === 'customer'
    }
    
    return false
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'staff': return 'Empleado'
      case 'customer': return 'Cliente'
      default: return role
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return ShieldCheckIcon
      case 'staff': return UserGroupIcon
      case 'customer': return UserIcon
      default: return UserIcon
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
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Usuarios</h1>
          <p className="text-slate-600 text-lg">Gestiona los usuarios del sistema</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-200">
            Exportar
          </button>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Agregar Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="pl-10 block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="staff">Empleado</option>
            <option value="customer">Cliente</option>
          </select>
          <select
            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
          <button
            onClick={() => {
              setFilters({ search: '', role: '', status: '' })
              setCurrentPage(1)
            }}
            className="px-4 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-200">
          {users.map((user) => {
            const RoleIcon = getRoleIcon(user.role)
            return (
              <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-xl flex items-center justify-center shadow-md mr-3">
                      <RoleIcon className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canEditUser(user) && (
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {canDeleteUser(user) && (
                      <button 
                        onClick={() => setShowDeleteAlert(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-slate-500">Rol:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Estado:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500">
                  Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha registro</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#eddacb] to-[#eddacb] rounded-xl flex items-center justify-center shadow-md mr-4">
                          <RoleIcon className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                          {user.phone && (
                            <div className="text-xs text-slate-500">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {canEditUser(user) && (
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar usuario"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {canDeleteUser(user) && (
                          <button 
                            onClick={() => setShowDeleteAlert(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Eliminar usuario"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
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
      {users.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay usuarios</h3>
          <p className="text-slate-600 mb-6">Comienza agregando tu primer usuario</p>
          <button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] text-slate-900 px-6 py-3 rounded-xl font-semibold"
          >
            Agregar Primer Usuario
          </button>
        </div>
      )}

      {/* Modal Create/Edit User */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del usuario"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rol</label>
                  <select
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="customer">Cliente</option>
                    <option value="staff">Empleado</option>
                    {isAdmin() && <option value="admin">Administrador</option>}
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                  <select
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contraseña {!editingUser && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      className="block w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingUser ? "Dejar vacío para mantener actual" : "Mínimo 8 caracteres"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                {(formData.password || !editingUser) && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirmar contraseña {!editingUser && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required={!editingUser || !!formData.password}
                        className="block w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#eddacb] focus:border-[#eddacb] transition-all duration-200"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirma la contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-[#eddacb] to-[#eddacb] hover:from-[#eddacb] hover:to-[#eddacb] border border-transparent rounded-xl text-sm font-semibold text-slate-900 shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2"></div>
                        {editingUser ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      editingUser ? 'Actualizar Usuario' : 'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Eliminar usuario
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                ¿Está seguro de eliminar el usuario <span className="font-semibold">{showDeleteAlert.name}</span>? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteAlert(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteAlert.id)}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users