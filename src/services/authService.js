import axios from 'axios'

// URL base para XAMPP
const API_URL = 'http://localhost/ecommerce-api/public/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos timeout
  withCredentials: false,
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Solo establecer Content-Type si no es FormData
    if (!config.data || !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
    }

    console.log('Request config:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      hasFormData: config.data instanceof FormData
    })

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    })

    // Limpiar respuesta de BOM si es necesario
    if (typeof response.data === 'string' && response.data.charCodeAt(0) === 0xFEFF) {
      try {
        response.data = JSON.parse(response.data.substring(1))
      } catch (e) {
        console.error('Error parsing response after removing BOM:', e)
      }
    }

    return response
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })

    // Manejar errores específicos
    if (error.code === 'ERR_NETWORK') {
      console.error('Error de red - Verifica que el servidor esté ejecutándose en:', API_URL)
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Timeout - La petición tardó más de 30 segundos')
    }

    if (error.response?.status === 401) {
      console.log('Token expirado, redirigiendo al login')
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (error.response?.status === 413) {
      console.error('Archivo demasiado grande - Reduce el tamaño de la imagen')
    }

    return Promise.reject(error)
  }
)

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password: password 
      })
      
      console.log('Login response:', response.data)

      if (!response.data.user || !response.data.token) {
        throw new Error('Respuesta de login inválida')
      }

      return {
        token: response.data.token,
        user: response.data.user
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  },

  getProfile: async () => {
    try {
      console.log('Getting user profile...')
      const response = await api.get('/auth/me')
      console.log('Profile response:', response.data)
      return response.data
    } catch (error) {
      console.error('Profile error:', error.response?.data || error.message)
      throw error
    }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
}

export default api