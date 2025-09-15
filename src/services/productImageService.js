import api from './authService'

export const productImageService = {
  /**
   * Eliminar imagen específica de un producto
   * @param {number} productId - ID del producto
   * @param {number} imageId - ID de la imagen a eliminar
   */
  deleteImage: async (productId, imageId) => {
    try {
      console.log(`Deleting image ${imageId} from product ${productId}`)
      
      const response = await api.delete(`/admin/products/${productId}/images/${imageId}`)
      
      console.log('Delete image response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error deleting product image:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Reordenar imágenes de un producto
   * @param {number} productId - ID del producto
   * @param {Array<number>} imageIds - Array de IDs en el nuevo orden
   */
  reorderImages: async (productId, imageIds) => {
    try {
      console.log(`Reordering images for product ${productId}:`, imageIds)
      
      const response = await api.put(`/admin/products/${productId}/images/reorder`, {
        image_ids: imageIds
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Reorder images response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error reordering product images:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Establecer imagen como principal
   * @param {number} productId - ID del producto
   * @param {number} imageId - ID de la imagen a establecer como principal
   */
  setPrimaryImage: async (productId, imageId) => {
    try {
      console.log(`Setting image ${imageId} as primary for product ${productId}`)
      
      const response = await api.put(`/admin/products/${productId}/images/${imageId}/primary`)
      
      console.log('Set primary image response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error setting primary image:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtener todas las imágenes de un producto
   * @param {number} productId - ID del producto
   */
  getProductImages: async (productId) => {
    try {
      console.log(`Getting images for product ${productId}`)
      
      const response = await api.get(`/admin/products/${productId}/images`)
      
      console.log('Get product images response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting product images:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Subir nuevas imágenes a un producto existente
   * @param {number} productId - ID del producto
   * @param {Array<File>} files - Archivos de imagen a subir
   */
  uploadImages: async (productId, files) => {
    try {
      console.log(`Uploading ${files.length} images to product ${productId}`)
      
      const formData = new FormData()
      
      files.forEach((file, index) => {
        formData.append('images[]', file)
      })
      
      const response = await api.post(`/admin/products/${productId}/images`, formData, {
        timeout: 60000, // 60 segundos para uploads
      })
      
      console.log('Upload images response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error uploading product images:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Actualizar información de una imagen (alt text, descripción)
   * @param {number} productId - ID del producto
   * @param {number} imageId - ID de la imagen
   * @param {Object} imageData - Datos a actualizar
   */
  updateImageInfo: async (productId, imageId, imageData) => {
    try {
      console.log(`Updating image ${imageId} info for product ${productId}:`, imageData)
      
      const response = await api.put(`/admin/products/${productId}/images/${imageId}`, imageData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Update image info response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating image info:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Optimizar imagen (redimensionar, comprimir)
   * @param {number} productId - ID del producto
   * @param {number} imageId - ID de la imagen
   * @param {Object} options - Opciones de optimización
   */
  optimizeImage: async (productId, imageId, options = {}) => {
    try {
      console.log(`Optimizing image ${imageId} for product ${productId}:`, options)
      
      const response = await api.post(`/admin/products/${productId}/images/${imageId}/optimize`, {
        width: options.width || 800,
        height: options.height || 600,
        quality: options.quality || 85,
        format: options.format || 'webp'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Optimize image response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error optimizing image:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtener estadísticas de imágenes del producto
   * @param {number} productId - ID del producto
   */
  getImageStats: async (productId) => {
    try {
      console.log(`Getting image stats for product ${productId}`)
      
      const response = await api.get(`/admin/products/${productId}/images/stats`)
      
      console.log('Image stats response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting image stats:', error.response?.data || error.message)
      throw error
    }
  }
}