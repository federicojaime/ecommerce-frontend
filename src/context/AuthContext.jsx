import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

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

  const logout = () => {
    console.log('AuthProvider: Logging out...')
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  console.log('AuthProvider: Current state - user:', user, 'loading:', loading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}