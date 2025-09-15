// src/services/settingsService.js
import api from './authService'

export const settingsService = {
  // Obtener todas las configuraciones
  getSettings: async () => {
    try {
      const response = await api.get('/admin/settings')
      return response.data
    } catch (error) {
      console.error('Error getting settings from API:', error)
      
      // Fallback a localStorage si no hay endpoint de API
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
      
      // Configuraciones por defecto si no hay nada guardado
      return {
        store: {
          name: 'Deco Home',
          phone: '+54 11 4567-8900',
          email: 'contacto@decohome.com',
          address: 'Av. Corrientes 1234, CABA, Argentina',
          description: 'Tu tienda de decoración y hogar',
          currency: 'ARS',
          timezone: 'America/Argentina/Buenos_Aires',
          logo: null
        },
        style: {
          primaryColor: '#eddacb',
          secondaryColor: '#2d3c5d',
          accentColor: '#3b82f6',
          logoPosition: 'center',
          sidebarStyle: 'dark',
          headerStyle: 'light'
        },
        notifications: {
          emailNotifications: true,
          orderNotifications: true,
          stockAlerts: true,
          marketingEmails: false,
          weeklyReports: true,
          monthlyReports: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginAlerts: true,
          passwordExpiry: 90
        },
        payment: {
          mercadoPago: { enabled: false, accessToken: '', publicKey: '' },
          stripe: { enabled: false, secretKey: '', publishableKey: '' },
          paypal: { enabled: false, clientId: '', clientSecret: '' }
        },
        shipping: {
          freeShippingThreshold: 15000,
          defaultShippingCost: 500,
          processingTime: '1-2 días hábiles',
          shippingZones: [
            { name: 'CABA', cost: 500, time: '24-48hs' },
            { name: 'GBA', cost: 800, time: '48-72hs' },
            { name: 'Interior', cost: 1200, time: '3-5 días' }
          ]
        }
      }
    }
  },

  // Guardar configuraciones
  saveSettings: async (settings) => {
    try {
      console.log('Saving settings to API:', settings)
      const response = await api.put('/admin/settings', settings, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error saving settings to API:', error)
      
      // Fallback a localStorage
      const settingsWithTimestamp = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        savedToAPI: false
      }
      localStorage.setItem('appSettings', JSON.stringify(settingsWithTimestamp))
      
      throw new Error('Configuraciones guardadas localmente. API no disponible.')
    }
  },

  // Cambiar contraseña del usuario
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      
      // Simular cambio exitoso para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: simulating successful password change')
        return { success: true, message: 'Contraseña cambiada (simulado)' }
      }
      
      throw error
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Simular actualización exitosa para desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: simulating successful profile update')
        return { success: true, user: profileData }
      }
      
      throw error
    }
  },

  // Subir logo de la tienda
  uploadLogo: async (file) => {
    try {
      const formData = new FormData()
      formData.append('logo', file)
      
      const response = await api.post('/admin/settings/logo', formData)
      return response.data
    } catch (error) {
      console.error('Error uploading logo:', error)
      
      // Crear URL temporal para preview en desarrollo
      if (process.env.NODE_ENV === 'development') {
        const tempUrl = URL.createObjectURL(file)
        return { 
          success: true, 
          logo_url: tempUrl,
          message: 'Logo temporal (desarrollo)'
        }
      }
      
      throw error
    }
  },

  // Obtener estadísticas de configuración
  getConfigurationStats: async () => {
    try {
      const response = await api.get('/admin/settings/stats')
      return response.data
    } catch (error) {
      console.error('Error getting configuration stats:', error)
      
      // Estadísticas simuladas
      return {
        last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        total_settings: 50,
        active_integrations: 2,
        security_score: 85
      }
    }
  },

  // Exportar configuraciones
  exportSettings: async () => {
    try {
      const response = await api.get('/admin/settings/export', {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting settings:', error)
      
      // Exportar configuraciones locales
      const settings = await this.getSettings()
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json'
      })
      return blob
    }
  },

  // Importar configuraciones
  importSettings: async (file) => {
    try {
      const formData = new FormData()
      formData.append('settings_file', file)
      
      const response = await api.post('/admin/settings/import', formData)
      return response.data
    } catch (error) {
      console.error('Error importing settings:', error)
      throw error
    }
  },

  // Probar conexión de método de pago
  testPaymentConnection: async (provider, credentials) => {
    try {
      const response = await api.post('/admin/settings/test-payment', {
        provider,
        credentials
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error testing payment connection:', error)
      throw error
    }
  },

  // Validar configuraciones
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
      
      // Validación básica local
      const errors = []
      
      if (!settings.store?.name || settings.store.name.length < 2) {
        errors.push('El nombre de la tienda debe tener al menos 2 caracteres')
      }
      
      if (!settings.store?.email || !/\S+@\S+\.\S+/.test(settings.store.email)) {
        errors.push('El email de la tienda no es válido')
      }
      
      if (settings.shipping?.freeShippingThreshold < 0) {
        errors.push('El umbral de envío gratis no puede ser negativo')
      }
      
      return {
        valid: errors.length === 0,
        errors
      }
    }
  }
}