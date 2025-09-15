import api from './authService'
import { productImageService } from './productImageService'

export const apiService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Products
  getProducts: async (params = {}) => {
    console.log('Getting products with params:', params)
    
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
    
    try {
      let formData = new FormData()
      
      if (productData instanceof FormData) {
        formData = productData
      } else {
        Object.keys(productData).forEach(key => {
          if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key])
          }
        })
      }

      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value instanceof File ? `File: ${value.name}` : value)
      }
      
      const response = await api.post('/admin/products', formData, {
        timeout: 30000,
      })
      
      console.log('Create product response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error in createProduct:', error.response?.data || error.message)
      throw error
    }
  },

  updateProduct: async (id, productData) => {
    console.log('Updating product', id, 'with data:', productData)
    
    try {
      let formData = new FormData()
      
      if (productData instanceof FormData) {
        formData = productData
      } else {
        Object.keys(productData).forEach(key => {
          if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key])
          }
        })
      }

      const response = await api.post(`/admin/products/${id}`, formData, {
        timeout: 30000,
      })
      
      return response.data
    } catch (error) {
      console.error('Error in updateProduct:', error.response?.data || error.message)
      throw error
    }
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`)
    return response.data
  },

  // Product Images
  deleteProductImage: productImageService.deleteImage,
  reorderProductImages: productImageService.reorderImages,
  setPrimaryProductImage: productImageService.setPrimaryImage,
  getProductImages: productImageService.getProductImages,
  uploadProductImages: productImageService.uploadImages,
  updateProductImageInfo: productImageService.updateImageInfo,
  optimizeProductImage: productImageService.optimizeImage,
  getProductImageStats: productImageService.getImageStats,

  manageProductImages: async (productId, images, deletedImageIds = []) => {
    try {
      console.log('Managing product images for product:', productId)

      const results = {
        deleted: [],
        reordered: false,
        primarySet: false,
        uploaded: []
      }

      for (const imageId of deletedImageIds) {
        try {
          await productImageService.deleteImage(productId, imageId)
          results.deleted.push(imageId)
        } catch (error) {
          console.error('Error deleting image:', imageId, error)
        }
      }

      const existingImages = images.filter(img => img.isExisting && img.imageId)
      if (existingImages.length > 1) {
        try {
          const imageIds = existingImages.map(img => img.imageId)
          await productImageService.reorderImages(productId, imageIds)
          results.reordered = true
        } catch (error) {
          console.error('Error reordering images:', error)
        }
      }

      const primaryImage = images.find((img, index) => index === 0 && img.isExisting)
      if (primaryImage && primaryImage.imageId) {
        try {
          await productImageService.setPrimaryImage(productId, primaryImage.imageId)
          results.primarySet = true
        } catch (error) {
          console.error('Error setting primary image:', error)
        }
      }

      const newImages = images.filter(img => img.isNew && img.file)
      if (newImages.length > 0) {
        try {
          const files = newImages.map(img => img.file)
          const uploadResponse = await productImageService.uploadImages(productId, files)
          results.uploaded = uploadResponse.images || []
        } catch (error) {
          console.error('Error uploading new images:', error)
        }
      }

      return results
    } catch (error) {
      console.error('Error managing product images:', error)
      throw error
    }
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories')
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

  // ==================== ORDERS - COMPLETO ====================
  
  /**
   * Obtener lista de pedidos con filtros y paginación
   */
  getOrders: async (params = {}) => {
    try {
      console.log('Getting orders with params:', params)
      
      const response = await api.get('/admin/orders', { params })
      console.log('Orders response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting orders:', error)
      throw error
    }
  },

  /**
   * Obtener un pedido específico por ID
   */
  getOrder: async (id) => {
    try {
      console.log('Getting order:', id)
      
      const response = await api.get(`/admin/orders/${id}`)
      console.log('Order details:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting order details:', error)
      throw error
    }
  },

  /**
   * Crear nuevo pedido
   */
  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData)
      
      const response = await api.post('/admin/orders', orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Order created:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  /**
   * Actualizar pedido completo
   */
  updateOrder: async (id, orderData) => {
    try {
      console.log('Updating order:', id, orderData)
      
      const response = await api.put(`/admin/orders/${id}`, orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Order updated:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },

  /**
   * Actualizar solo el estado de un pedido
   */
  updateOrderStatus: async (id, status) => {
    try {
      console.log('Updating order status:', id, status)
      
      const response = await api.put(`/admin/orders/${id}/status`, { 
        status 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Order status updated:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  /**
   * Actualizar estado de pago de un pedido
   */
  updateOrderPaymentStatus: async (id, paymentStatus) => {
    try {
      console.log('Updating order payment status:', id, paymentStatus)
      
      const response = await api.put(`/admin/orders/${id}/payment-status`, { 
        payment_status: paymentStatus 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error updating order payment status:', error)
      throw error
    }
  },

  /**
   * Eliminar pedido
   */
  deleteOrder: async (id) => {
    try {
      console.log('Deleting order:', id)
      
      const response = await api.delete(`/admin/orders/${id}`)
      console.log('Order deleted:', response.data)
      return response.data
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  },

  /**
   * Obtener items de un pedido específico
   */
  getOrderItems: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/items`)
      return response.data
    } catch (error) {
      console.error('Error getting order items:', error)
      throw error
    }
  },

  /**
   * Agregar item a un pedido
   */
  addOrderItem: async (orderId, itemData) => {
    try {
      const response = await api.post(`/admin/orders/${orderId}/items`, itemData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error adding order item:', error)
      throw error
    }
  },

  /**
   * Actualizar item de un pedido
   */
  updateOrderItem: async (orderId, itemId, itemData) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/items/${itemId}`, itemData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating order item:', error)
      throw error
    }
  },

  /**
   * Eliminar item de un pedido
   */
  removeOrderItem: async (orderId, itemId) => {
    try {
      const response = await api.delete(`/admin/orders/${orderId}/items/${itemId}`)
      return response.data
    } catch (error) {
      console.error('Error removing order item:', error)
      throw error
    }
  },

  /**
   * Calcular totales de un pedido
   */
  calculateOrderTotals: async (orderId) => {
    try {
      const response = await api.post(`/admin/orders/${orderId}/calculate-totals`)
      return response.data
    } catch (error) {
      console.error('Error calculating order totals:', error)
      throw error
    }
  },

  /**
   * Generar factura/invoice para un pedido
   */
  generateOrderInvoice: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error generating order invoice:', error)
      throw error
    }
  },

  /**
   * Enviar notificación al cliente
   */
  sendOrderNotification: async (orderId, notificationType) => {
    try {
      const response = await api.post(`/admin/orders/${orderId}/notify`, {
        type: notificationType
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error sending order notification:', error)
      throw error
    }
  },

  /**
   * Obtener historial de cambios de un pedido
   */
  getOrderHistory: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/history`)
      return response.data
    } catch (error) {
      console.error('Error getting order history:', error)
      throw error
    }
  },

  /**
   * Exportar pedidos a Excel/CSV
   */
  exportOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders/export', {
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting orders:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de pedidos
   */
  getOrdersStats: async (dateRange = {}) => {
    try {
      const response = await api.get('/admin/orders/stats', {
        params: dateRange
      })
      return response.data
    } catch (error) {
      console.error('Error getting orders stats:', error)
      throw error
    }
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