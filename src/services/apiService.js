import api from './authService'

export const apiService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params })
    return response.data
  },

  getProduct: async (id) => {
    const response = await api.get(`/admin/products/${id}`)
    return response.data
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData)
    return response.data
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`)
    return response.data
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/categories')
    return response.data
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData)
    return response.data
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData)
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
    const response = await api.post('/admin/orders', orderData)
    return response.data
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { status })
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
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
}
