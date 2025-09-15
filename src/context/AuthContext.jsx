import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider: Checking for existing token...')
    const token = localStorage.getItem('token')
    if (token) {
      console.log('AuthProvider: Token found, getting profile...')
      authService.getProfile()
        .then(userData => {
          console.log('AuthProvider: Profile loaded:', userData)
          setUser(userData)
        })
        .catch((error) => {
          console.log('AuthProvider: Error loading profile:', error)
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      console.log('AuthProvider: No token found')
      setLoading(false)
    }
  }, [])

  /**
   * Login de usuario
   */
  const login = async (email, password) => {
    try {
      console.log('AuthProvider: Attempting login...')
      const response = await authService.login(email, password)
      console.log('AuthProvider: Login successful:', response)
      
      localStorage.setItem('token', response.token)
      setUser(response.user)
      
      console.log('AuthProvider: User set:', response.user)
      return response
    } catch (error) {
      console.log('AuthProvider: Login error:', error)
      throw error
    }
  }

  /**
   * Registro de nuevo usuario
   */
  const register = async (userData) => {
    try {
      console.log('AuthProvider: Attempting registration...')
      const response = await authService.register(userData)
      console.log('AuthProvider: Registration successful:', response)
      
      // Si el registro incluye token, auto-login
      if (response.token) {
        localStorage.setItem('token', response.token)
        setUser(response.user)
      }
      
      return response
    } catch (error) {
      console.log('AuthProvider: Registration error:', error)
      throw error
    }
  }

  /**
   * Cambiar contraseña
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('AuthProvider: Changing password...')
      const response = await authService.changePassword(currentPassword, newPassword)
      console.log('AuthProvider: Password changed successfully')
      
      toast.success('Contraseña cambiada correctamente')
      return response
    } catch (error) {
      console.log('AuthProvider: Change password error:', error)
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al cambiar contraseña'
      toast.error(errorMessage)
      
      throw error
    }
  }

  /**
   * Actualizar perfil
   */
  const updateProfile = async (profileData) => {
    try {
      console.log('AuthProvider: Updating profile...')
      const response = await authService.updateProfile(profileData)
      console.log('AuthProvider: Profile updated successfully:', response)
      
      // Actualizar usuario en el contexto
      if (response.user) {
        setUser(response.user)
      }
      
      toast.success('Perfil actualizado correctamente')
      return response
    } catch (error) {
      console.log('AuthProvider: Update profile error:', error)
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar perfil'
      toast.error(errorMessage)
      
      throw error
    }
  }

  /**
   * Logout de usuario
   */
  const logout = async () => {
    try {
      console.log('AuthProvider: Logging out...')
      
      // Intentar logout en el servidor
      await authService.logout()
      
      console.log('AuthProvider: Server logout successful')
    } catch (error) {
      console.log('AuthProvider: Server logout error (continuing with local logout):', error)
      // Continuar con logout local aunque falle el servidor
    } finally {
      // Siempre limpiar estado local
      localStorage.removeItem('token')
      setUser(null)
      console.log('AuthProvider: Local logout completed')
    }
  }

  /**
   * Validar token actual
   */
  const validateToken = async () => {
    try {
      console.log('AuthProvider: Validating token...')
      const response = await authService.validateToken()
      console.log('AuthProvider: Token is valid:', response)
      return true
    } catch (error) {
      console.log('AuthProvider: Token validation failed:', error)
      
      // Si el token no es válido, hacer logout
      localStorage.removeItem('token')
      setUser(null)
      
      return false
    }
  }

  /**
   * Refrescar datos del usuario
   */
  const refreshUser = async () => {
    try {
      console.log('AuthProvider: Refreshing user data...')
      const userData = await authService.getProfile()
      setUser(userData)
      return userData
    } catch (error) {
      console.log('AuthProvider: Error refreshing user:', error)
      throw error
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token')
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role) => {
    return user?.role === role
  }

  /**
   * Verificar si el usuario tiene uno de varios roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  /**
   * Verificar si es administrador
   */
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  /**
   * Verificar si es staff (admin o empleado)
   */
  const isStaff = () => {
    return ['admin', 'staff'].includes(user?.role)
  }

  const value = {
    // Estado
    user,
    loading,
    
    // Métodos de autenticación
    login,
    register,
    logout,
    
    // Métodos de gestión de perfil
    changePassword,
    updateProfile,
    refreshUser,
    
    // Métodos de validación
    validateToken,
    isAuthenticated,
    
    // Métodos de roles
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    
    // Método legacy para compatibilidad
    updateUser: setUser
  }

  console.log('AuthProvider: Current state - user:', user, 'loading:', loading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}