// src/services/settingsService.js
import api from './authService'

export const settingsService = {
  // ==================== CONFIGURACIONES PRINCIPALES ====================
  
  /**
   * Obtener todas las configuraciones del sistema
   */
  getSettings: async () => {
    try {
      console.log('Getting all settings from API...')
      const response = await api.get('/admin/settings')
      console.log('Settings received from API:', response.data)
      return response.data
    } catch (error) {
      console.error('Error getting settings from API:', error)
      throw error
    }
  },

  /**
   * Obtener configuraciones por categoría específica
   */
  getSettingsByCategory: async (category) => {
    try {
      console.log(`Getting settings for category: ${category}`)
      const response = await api.get('/admin/settings', { 
        params: { category } 
      })
      return response.data
    } catch (error) {
      console.error(`Error getting settings for category ${category}:`, error)
      throw error
    }
  },

  /**
   * Guardar configuraciones en el servidor
   */
  saveSettings: async (settings) => {
    try {
      console.log('Saving settings to API:', settings)
      
      const response = await api.put('/admin/settings', settings, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Settings saved successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error saving settings to API:', error)
      throw error
    }
  },

  /**
   * Actualizar configuración específica
   */
  updateSetting: async (category, key, value) => {
    try {
      const response = await api.patch('/admin/settings', {
        category,
        key,
        value
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error updating specific setting:', error)
      throw error
    }
  },

  // ==================== VALIDACIONES ====================
  
  /**
   * Validar configuraciones en el servidor
   */
  validateSettings: async (settings) => {
    try {
      const response = await api.post('/admin/settings/validate', settings, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error validating settings:', error)
      throw error
    }
  },

  // ==================== GESTIÓN DE ARCHIVOS ====================
  
  /**
   * Subir logo de la tienda
   */
  uploadLogo: async (file) => {
    try {
      console.log('Uploading logo:', file.name)
      
      // Validar archivo
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('El archivo es muy grande. Máximo 5MB')
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen')
      }
      
      const formData = new FormData()
      formData.append('logo', file)
      
      const response = await api.post('/admin/settings/logo', formData, {
        timeout: 60000 // 60 segundos para uploads
      })
      
      console.log('Logo uploaded successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw error
    }
  },

  /**
   * Exportar configuraciones como archivo JSON
   */
  exportSettings: async () => {
    try {
      console.log('Exporting settings...')
      
      const response = await api.get('/admin/settings/export', {
        responseType: 'blob'
      })
      
      return response.data
    } catch (error) {
      console.error('Error exporting settings from API:', error)
      throw error
    }
  },

  /**
   * Importar configuraciones desde archivo
   */
  importSettings: async (file) => {
    try {
      console.log('Importing settings from file:', file.name)
      
      const formData = new FormData()
      formData.append('settings_file', file)
      
      const response = await api.post('/admin/settings/import', formData)
      console.log('Settings imported via API:', response.data)
      return response.data
    } catch (error) {
      console.error('Error importing settings:', error)
      throw error
    }
  },

  // ==================== ESTADÍSTICAS Y MONITOREO ====================
  
  /**
   * Obtener estadísticas del sistema de configuraciones
   */
  getConfigurationStats: async () => {
    try {
      console.log('Getting configuration stats...')
      
      const response = await api.get('/admin/settings/stats')
      return response.data
    } catch (error) {
      console.error('Error getting configuration stats:', error)
      throw error
    }
  },

  // ==================== INTEGRACIONES DE PAGO ====================
  
  /**
   * Probar conexión con proveedor de pago
   */
  testPaymentConnection: async (provider, credentials) => {
    try {
      console.log(`Testing payment connection for ${provider}...`)
      
      const response = await api.post('/admin/settings/test-payment', {
        provider,
        credentials
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`${provider} connection test successful`)
      return response.data
    } catch (error) {
      console.error(`Error testing ${provider} connection:`, error)
      throw error
    }
  },

  /**
   * Obtener configuraciones de pago disponibles desde la API
   */
  getPaymentProviders: async () => {
    try {
      const response = await api.get('/admin/settings/payment-providers')
      return response.data
    } catch (error) {
      console.error('Error getting payment providers from API:', error)
      // Solo si la API no está disponible, usar datos básicos
      return [
        {
          id: 'mercadoPago',
          name: 'Mercado Pago',
          description: 'Acepta pagos con tarjetas y efectivo en Argentina',
          icon: 'MP',
          color: 'blue',
          fields: [
            { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
            { key: 'publicKey', label: 'Public Key', type: 'text', required: true },
            { key: 'sandboxMode', label: 'Modo Sandbox', type: 'boolean', required: false }
          ]
        },
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'Pagos internacionales con tarjeta',
          icon: 'S',
          color: 'purple',
          fields: [
            { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
            { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true }
          ]
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Pagos con cuenta PayPal',
          icon: 'PP',
          color: 'yellow',
          fields: [
            { key: 'clientId', label: 'Client ID', type: 'text', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
            { key: 'sandboxMode', label: 'Modo Sandbox', type: 'boolean', required: false }
          ]
        }
      ]
    }
  }
}