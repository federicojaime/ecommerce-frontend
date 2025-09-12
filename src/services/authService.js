import axios from 'axios'

// CAMBIO: Usar puerto 80 para XAMPP en lugar de 8000
const API_URL = 'http://localhost/ecommerce-api/public/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Limpiar respuesta de caracteres especiales si es necesario
    if (typeof response.data === 'string' && response.data.charCodeAt(0) === 0xFEFF) {
      response.data = JSON.parse(response.data.substring(1))
    }
    return response
  },
  (error) => {
    console.error('API Error:', error)

    // Manejar errores de CORS
    if (error.code === 'ERR_NETWORK') {
      console.error('Error de red o CORS. Verifica que el servidor API esté ejecutándose.')
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      console.log('Login response:', response.data)

      if (!response.data.user || !response.data.token) {
        throw new Error('Respuesta de login inválida')
      }

      return {
        token: response.data.token,
        user: response.data.user
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
}

export default api