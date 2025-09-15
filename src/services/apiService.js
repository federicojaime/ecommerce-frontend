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
      // Siempre enviar como FormData para manejar archivos correctamente
      let formData = new FormData()
      
      if (productData instanceof FormData) {
        // Si ya es FormData, usarlo directamente
        formData = productData
      } else {
        // Si es un objeto, convertir a FormData
        Object.keys(productData).forEach(key => {
          if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key])
          }
        })
      }

      // Log FormData contents para debugging
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value instanceof File ? `File: ${value.name}` : value)
      }
      
      const response = await api.post('/admin/products', formData, {
        // NO establecer Content-Type - dejar que axios lo maneje
        timeout: 30000,
      })
      
      console.log('Create product response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error in createProduct:', error.response?.data || error.message)
      console.error('Full error:', error)
      throw error
    }
  },

  // USAR POST PARA UPDATES CON ARCHIVOS
  updateProduct: async (id, productData) => {
    console.log('Updating product', id, 'with data:', productData)
    
    try {
      // Siempre enviar como FormData para manejar archivos correctamente
      let formData = new FormData()
      
      if (productData instanceof FormData) {
        // Si ya es FormData, usarlo directamente
        formData = productData
      } else {
        // Si es un objeto, convertir a FormData
        Object.keys(productData).forEach(key => {
          if (productData[key] !== '' && productData[key] !== null && productData[key] !== undefined) {
            formData.append(key, productData[key])
          }
        })
      }

      // Log FormData contents para debugging
      console.log('Update FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value instanceof File ? `File: ${value.name}` : value)
      }

      // CAMBIO CLAVE: USAR POST EN LUGAR DE PUT PARA ARCHIVOS
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

  // ========== GESTIÓN AVANZADA DE IMÁGENES ==========
  
  // Funciones directas (delegadas al productImageService)
  deleteProductImage: productImageService.deleteImage,
  reorderProductImages: productImageService.reorderImages,
  setPrimaryProductImage: productImageService.setPrimaryImage,
  getProductImages: productImageService.getProductImages,
  uploadProductImages: productImageService.uploadImages,
  updateProductImageInfo: productImageService.updateImageInfo,
  optimizeProductImage: productImageService.optimizeImage,
  getProductImageStats: productImageService.getImageStats,

  // Función helper para gestión completa de imágenes en edición
  manageProductImages: async (productId, images, deletedImageIds = []) => {
    try {
      console.log('Managing product images for product:', productId)
      console.log('Current images:', images)
      console.log('Deleted image IDs:', deletedImageIds)

      const results = {
        deleted: [],
        reordered: false,
        primarySet: false,
        uploaded: []
      }

      // 1. Eliminar imágenes marcadas para eliminación
      for (const imageId of deletedImageIds) {
        try {
          await productImageService.deleteImage(productId, imageId)
          results.deleted.push(imageId)
          console.log('Image deleted successfully:', imageId)
        } catch (error) {
          console.error('Error deleting image:', imageId, error)
        }
      }

      // 2. Reordenar imágenes existentes
      const existingImages = images.filter(img => img.isExisting && img.imageId)
      if (existingImages.length > 1) {
        try {
          const imageIds = existingImages.map(img => img.imageId)
          await productImageService.reorderImages(productId, imageIds)
          results.reordered = true
          console.log('Images reordered successfully')
        } catch (error) {
          console.error('Error reordering images:', error)
        }
      }

      // 3. Establecer imagen primaria si cambió
      const primaryImage = images.find((img, index) => index === 0 && img.isExisting)
      if (primaryImage && primaryImage.imageId) {
        try {
          await productImageService.setPrimaryImage(productId, primaryImage.imageId)
          results.primarySet = true
          console.log('Primary image set successfully')
        } catch (error) {
          console.error('Error setting primary image:', error)
        }
      }

      // 4. Subir nuevas imágenes
      const newImages = images.filter(img => img.isNew && img.file)
      if (newImages.length > 0) {
        try {
          const files = newImages.map(img => img.file)
          const uploadResponse = await productImageService.uploadImages(productId, files)
          results.uploaded = uploadResponse.images || []
          console.log('New images uploaded successfully')
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