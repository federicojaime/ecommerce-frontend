// src/services/settingsService.js
import api from './authService'
import toast from 'react-hot-toast'

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
      
      // Fallback a configuraciones locales guardadas
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        console.log('Using saved local settings')
        return JSON.parse(savedSettings)
      }
      
      // Configuraciones por defecto si no hay nada guardado
      console.log('Using default settings')
      return this.getDefaultSettings()
    }
  },

  /**
   * Obtener configuraciones por categoría específica
   */
  getSettingsByCategory: async (category) => {
    try {
      console.log(`Getting settings for category: ${category}`)
      const response = await api.get(`/admin/settings?category=${category}`)
      return response.data
    } catch (error) {
      console.error(`Error getting settings for category ${category}:`, error)
      
      // Fallback a configuraciones locales
      const allSettings = await this.getSettings()
      return allSettings[category] || {}
    }
  },

  /**
   * Guardar configuraciones en el servidor
   */
  saveSettings: async (settings) => {
    try {
      console.log('Saving settings to API:', settings)
      
      // Validar configuraciones antes de enviar
      const validation = await this.validateSettings(settings)
      if (!validation.valid) {
        throw new Error(`Configuraciones inválidas: ${validation.errors.join(', ')}`)
      }

      const response = await api.put('/admin/settings', settings, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Settings saved successfully:', response.data)
      
      // Guardar también localmente como backup
      this.saveSettingsLocally(settings)
      
      return response.data
    } catch (error) {
      console.error('Error saving settings to API:', error)
      
      // Fallback: guardar solo localmente y mostrar advertencia
      this.saveSettingsLocally(settings)
      
      throw new Error('Configuraciones guardadas localmente. Verifica la conexión con el servidor.')
    }
  },

  /**
   * Actualizar configuración específica
   */
  updateSetting: async (category, key, value) => {
    try {
      const currentSettings = await this.getSettings()
      
      if (!currentSettings[category]) {
        currentSettings[category] = {}
      }
      
      // Actualizar la configuración específica
      currentSettings[category][key] = value
      
      // Guardar todas las configuraciones
      return await this.saveSettings(currentSettings)
    } catch (error) {
      console.error('Error updating specific setting:', error)
      throw error
    }
  },

  // ==================== VALIDACIONES ====================
  
  /**
   * Validar configuraciones antes de guardar
   */
  validateSettings: async (settings) => {
    try {
      // Si hay endpoint de validación, usarlo
      try {
        const response = await api.post('/admin/settings/validate', settings, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        return response.data
      } catch (apiError) {
        console.log('API validation not available, using local validation')
      }
      
      // Validación local
      const errors = []
      
      // Validar configuraciones de tienda
      if (settings.store) {
        if (!settings.store.name || settings.store.name.length < 2) {
          errors.push('El nombre de la tienda debe tener al menos 2 caracteres')
        }
        
        if (settings.store.email && !/\S+@\S+\.\S+/.test(settings.store.email)) {
          errors.push('El email de la tienda no es válido')
        }
        
        if (settings.store.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(settings.store.phone)) {
          errors.push('El teléfono debe tener al menos 10 dígitos')
        }
      }
      
      // Validar configuraciones de estilo
      if (settings.style) {
        if (settings.style.primaryColor && !/^#[0-9A-F]{6}$/i.test(settings.style.primaryColor)) {
          errors.push('El color primario debe ser un código hexadecimal válido')
        }
        
        if (settings.style.secondaryColor && !/^#[0-9A-F]{6}$/i.test(settings.style.secondaryColor)) {
          errors.push('El color secundario debe ser un código hexadecimal válido')
        }
      }
      
      // Validar configuraciones de envío
      if (settings.shipping) {
        if (settings.shipping.freeShippingThreshold < 0) {
          errors.push('El umbral de envío gratis no puede ser negativo')
        }
        
        if (settings.shipping.defaultShippingCost < 0) {
          errors.push('El costo de envío por defecto no puede ser negativo')
        }
      }
      
      // Validar configuraciones de seguridad
      if (settings.security) {
        if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 1440) {
          errors.push('El tiempo de sesión debe estar entre 5 y 1440 minutos')
        }
        
        if (settings.security.passwordExpiry < 30 || settings.security.passwordExpiry > 365) {
          errors.push('La expiración de contraseña debe estar entre 30 y 365 días')
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Error validating settings:', error)
      return {
        valid: false,
        errors: ['Error al validar configuraciones']
      }
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
      
      // En desarrollo, crear URL temporal
      if (process.env.NODE_ENV === 'development') {
        const tempUrl = URL.createObjectURL(file)
        console.log('Development mode: created temporary URL')
        return { 
          success: true, 
          logo_url: tempUrl,
          message: 'Logo temporal para desarrollo'
        }
      }
      
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
      
      // Fallback: exportar configuraciones locales
      const settings = await this.getSettings()
      const exportData = {
        ...settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        source: 'local_fallback'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      return blob
    }
  },

  /**
   * Importar configuraciones desde archivo
   */
  importSettings: async (file) => {
    try {
      console.log('Importing settings from file:', file.name)
      
      // Leer y validar archivo
      const text = await file.text()
      const settings = JSON.parse(text)
      
      // Validar estructura básica
      if (typeof settings !== 'object') {
        throw new Error('Archivo de configuraciones inválido')
      }
      
      // Intentar importar via API
      try {
        const formData = new FormData()
        formData.append('settings_file', file)
        
        const response = await api.post('/admin/settings/import', formData)
        console.log('Settings imported via API:', response.data)
        return response.data
      } catch (apiError) {
        console.log('API import failed, applying locally')
      }
      
      // Fallback: aplicar configuraciones localmente
      const validation = await this.validateSettings(settings)
      if (!validation.valid) {
        throw new Error(`Configuraciones inválidas: ${validation.errors.join(', ')}`)
      }
      
      // Guardar configuraciones
      await this.saveSettings(settings)
      
      return {
        success: true,
        message: 'Configuraciones importadas localmente'
      }
    } catch (error) {
      console.error('Error importing settings:', error)
      throw error
    }
  },

  // ==================== GESTIÓN DE USUARIOS ====================
  
  /**
   * Cambiar contraseña del usuario autenticado
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      console.log('Changing user password...')
      
      const response = await api.put('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Password changed successfully')
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  },

  /**
   * Actualizar perfil del usuario autenticado
   */
  updateProfile: async (profileData) => {
    try {
      console.log('Updating user profile...')
      
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Profile updated successfully')
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
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
      
      // Estadísticas simuladas para desarrollo
      const settings = await this.getSettings()
      
      return {
        last_backup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        total_settings: this.countSettings(settings),
        active_integrations: this.countActiveIntegrations(settings),
        security_score: this.calculateSecurityScore(settings),
        last_modified: localStorage.getItem('settingsLastModified') || new Date().toISOString()
      }
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
      
      // En desarrollo, simular test exitoso
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: simulating successful connection test')
        return {
          success: true,
          provider,
          message: `Conexión con ${provider} simulada exitosamente`,
          test_mode: true
        }
      }
      
      throw error
    }
  },

  /**
   * Obtener configuraciones de pago disponibles
   */
  getPaymentProviders: () => {
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
  },

  // ==================== UTILIDADES PRIVADAS ====================
  
  /**
   * Guardar configuraciones localmente
   */
  saveSettingsLocally: (settings) => {
    try {
      const settingsWithTimestamp = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        savedToAPI: false
      }
      
      localStorage.setItem('appSettings', JSON.stringify(settingsWithTimestamp))
      localStorage.setItem('settingsLastModified', new Date().toISOString())
      
      console.log('Settings saved locally')
    } catch (error) {
      console.error('Error saving settings locally:', error)
    }
  },

  /**
   * Obtener configuraciones por defecto
   */
  getDefaultSettings: () => {
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
        mercadoPago: { enabled: false, accessToken: '', publicKey: '', sandboxMode: true },
        stripe: { enabled: false, secretKey: '', publishableKey: '' },
        paypal: { enabled: false, clientId: '', clientSecret: '', sandboxMode: true }
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
  },

  /**
   * Contar configuraciones totales
   */
  countSettings: (settings) => {
    let count = 0
    
    const countObject = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          countObject(obj[key])
        } else {
          count++
        }
      }
    }
    
    countObject(settings)
    return count
  },

  /**
   * Contar integraciones activas
   */
  countActiveIntegrations: (settings) => {
    let count = 0
    
    if (settings.payment) {
      Object.values(settings.payment).forEach(provider => {
        if (provider.enabled) count++
      })
    }
    
    return count
  },

  /**
   * Calcular puntuación de seguridad
   */
  calculateSecurityScore: (settings) => {
    let score = 50 // Base score
    
    if (settings.security) {
      if (settings.security.twoFactorAuth) score += 20
      if (settings.security.loginAlerts) score += 10
      if (settings.security.sessionTimeout <= 60) score += 10
      if (settings.security.passwordExpiry <= 90) score += 10
    }
    
    return Math.min(100, score)
  }
}