import api from './authService'

export const apiService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Products
  getProducts: async (params = {}) => {
    console.log('Getting products with params:', params)
    console.log('Token from localStorage:', localStorage.getItem('token'))
    
    try {
      const response = await api.get('/admin/products', { params })
      console.log('Products response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error in getProducts:', error.response?.data || error.message)
      throw error
    }
  },

  getProduct: async (id) => {
    const response = await api.get(`/admin/products/${id}`)
    return response.data
  },

  createProduct: async (productData) => {
    console.log('Creating product with data:', productData)
    console.log('Token being sent:', localStorage.getItem('token'))
    
    // Detectar si es FormData (con imagen) o JSON normal
    const isFormData = productData instanceof FormData
    
    // Log FormData contents
    if (isFormData) {
      console.log('FormData contents:')
      for (let [key, value] of productData.entries()) {
        console.log(key, ':', value)
      }
    }
    
    try {
      if (isFormData) {
        console.log('Sending FormData with image')
        // Para FormData, no establecer Content-Type manualmente, deja que axios lo maneje
        const response = await api.post('/admin/products', productData, {
          headers: {
            // No establecer Content-Type para FormData, axios lo maneja automáticamente
          }
        })
        console.log('FormData response:', response.data)
        return response.data
      } else {
        console.log('Sending JSON data')
        // Para JSON, establecer Content-Type explícitamente
        const response = await api.post('/admin/products', productData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        console.log('JSON response:', response.data)
        return response.data
      }
    } catch (error) {
      console.error('Error in createProduct:', error.response?.data || error.message)
      console.error('Full error:', error)
      throw error
    }
  },

  updateProduct: async (id, productData) => {
    console.log('Updating product', id, 'with data:', productData)
    
    // Detectar si es FormData (con imagen) o JSON normal
    const isFormData = productData instanceof FormData
    
    try {
      if (isFormData) {
        console.log('Sending FormData for update')
        // Para FormData, no establecer Content-Type manualmente
        const response = await api.put(`/admin/products/${id}`, productData, {
          headers: {
            // No establecer Content-Type para FormData
          }
        })
        return response.data
      } else {
        console.log('Sending JSON for update')
        // Para JSON, establecer Content-Type explícitamente
        const response = await api.put(`/admin/products/${id}`, productData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        return response.data
      }
    } catch (error) {
      console.error('Error in updateProduct:', error.response?.data || error.message)
      throw error
    }
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`)
    return response.data
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories') // Usar endpoint público para obtener categorías
    return response.data
  },

  getAdminCategories: async () => {
    const response = await api.get('/admin/categories')
    return response.data
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`)
    return response.data
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params })
    return response.data
  },

  getOrder: async (id) => {
    const response = await api.get(`/admin/orders/${id}`)
    return response.data
  },

  createOrder: async (orderData) => {
    const response = await api.post('/admin/orders', orderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/admin/orders/${id}`)
    return response.data
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
}