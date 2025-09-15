// src/hooks/useSettings.js
import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { settingsService } from '../services/settingsService'
import toast from 'react-hot-toast'

// Crear contexto para configuraciones globales
const SettingsContext = createContext()

// Hook para usar el contexto
export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Proveedor del contexto
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar configuraciones iniciales
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settingsService.getSettings()
      setSettings(data)
    } catch (err) {
      setError(err)
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      await settingsService.saveSettings(newSettings)
      setSettings(newSettings)
      toast.success('Configuraciones actualizadas')
    } catch (err) {
      setError(err)
      toast.error('Error al actualizar configuraciones')
      throw err
    }
  }

  const getSetting = (path, defaultValue = null) => {
    const keys = path.split('.')
    let current = settings
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return defaultValue
      }
    }
    
    return current
  }

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    getSetting
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook personalizado para manejar configuraciones específicas
export const useSettingsForm = (initialSettings = {}) => {
  const [formData, setFormData] = useState(initialSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Detectar cambios
  useEffect(() => {
    const hasChangesDetected = JSON.stringify(formData) !== JSON.stringify(initialSettings)
    setHasChanges(hasChangesDetected)
  }, [formData, initialSettings])

  // Actualizar campo específico
  const updateField = useCallback((path, value) => {
    setFormData(prev => {
      const keys = path.split('.')
      const newData = { ...prev }
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!(key in current) || typeof current[key] !== 'object') {
          current[key] = {}
        }
        current = current[key]
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }, [])

  // Validar formulario
  const validate = useCallback(async () => {
    try {
      const validation = await settingsService.validateSettings(formData)
      
      if (!validation.valid) {
        setValidationErrors(validation.errors || {})
        return false
      }

      setValidationErrors({})
      return true
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }, [formData])

  // Guardar configuraciones
  const save = useCallback(async () => {
    setSaving(true)
    try {
      const isValid = await validate()
      if (!isValid) {
        toast.error('Por favor corrige los errores antes de guardar')
        return false
      }

      await settingsService.saveSettings(formData)
      setHasChanges(false)
      toast.success('Configuraciones guardadas correctamente')
      return true
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Error al guardar configuraciones')
      return false
    } finally {
      setSaving(false)
    }
  }, [formData, validate])

  // Resetear formulario
  const reset = useCallback(() => {
    setFormData(initialSettings)
    setHasChanges(false)
    setValidationErrors({})
  }, [initialSettings])

  return {
    formData,
    setFormData,
    updateField,
    hasChanges,
    validationErrors,
    saving,
    validate,
    save,
    reset
  }
}

// Hook para configuraciones de tema/estilo
export const useThemeSettings = () => {
  const { getSetting, updateSettings } = useSettings()
  
  const themeSettings = getSetting('style', {
    primaryColor: '#eddacb',
    secondaryColor: '#2d3c5d',
    sidebarStyle: 'dark'
  })

  const updateTheme = async (themeData) => {
    try {
      const currentSettings = getSetting('', {})
      const newSettings = {
        ...currentSettings,
        style: {
          ...currentSettings.style,
          ...themeData
        }
      }
      await updateSettings(newSettings)
    } catch (error) {
      console.error('Error updating theme:', error)
      throw error
    }
  }

  const applyTheme = () => {
    // Aplicar tema al documento
    const root = document.documentElement
    root.style.setProperty('--color-primary', themeSettings.primaryColor)
    root.style.setProperty('--color-secondary', themeSettings.secondaryColor)
  }

  useEffect(() => {
    applyTheme()
  }, [themeSettings])

  return {
    themeSettings,
    updateTheme,
    applyTheme
  }
}

// Hook para configuraciones de notificaciones
export const useNotificationSettings = () => {
  const { getSetting, updateSettings } = useSettings()
  
  const notificationSettings = getSetting('notifications', {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true
  })

  const updateNotifications = async (notificationData) => {
    try {
      const currentSettings = getSetting('', {})
      const newSettings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...notificationData
        }
      }
      await updateSettings(newSettings)
    } catch (error) {
      console.error('Error updating notifications:', error)
      throw error
    }
  }

  const isNotificationEnabled = (type) => {
    return notificationSettings[type] || false
  }

  return {
    notificationSettings,
    updateNotifications,
    isNotificationEnabled
  }
}

// Hook para configuraciones de seguridad
export const useSecuritySettings = () => {
  const { getSetting } = useSettings()
  
  const securitySettings = getSetting('security', {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordMinLength: 8
  })

  const getSecurityScore = () => {
    let score = 0
    
    if (securitySettings.twoFactorAuth) score += 25
    if (securitySettings.passwordMinLength >= 8) score += 20
    if (securitySettings.sessionTimeout <= 60) score += 15
    if (securitySettings.loginAlerts) score += 10
    if (securitySettings.rateLimitEnabled) score += 15
    if (securitySettings.requireSpecialChars) score += 15
    
    return Math.min(score, 100)
  }

  return {
    securitySettings,
    securityScore: getSecurityScore()
  }
}

// Hook para configuraciones de pagos
export const usePaymentSettings = () => {
  const { getSetting, updateSettings } = useSettings()
  
  const paymentSettings = getSetting('payment', {
    currency: 'ARS',
    taxRate: 21.0,
    mercadoPago: { enabled: false },
    stripe: { enabled: false },
    paypal: { enabled: false }
  })

  const getEnabledPaymentMethods = () => {
    const methods = []
    if (paymentSettings.mercadoPago?.enabled) methods.push('mercadoPago')
    if (paymentSettings.stripe?.enabled) methods.push('stripe')
    if (paymentSettings.paypal?.enabled) methods.push('paypal')
    if (paymentSettings.bankTransfer?.enabled) methods.push('bankTransfer')
    return methods
  }

  const testPaymentMethod = async (method) => {
    try {
      const credentials = paymentSettings[method]
      if (!credentials?.enabled) {
        throw new Error('Método de pago no habilitado')
      }
      
      await settingsService.testPaymentConnection(method, credentials)
      return true
    } catch (error) {
      console.error(`Error testing ${method}:`, error)
      throw error
    }
  }

  return {
    paymentSettings,
    enabledMethods: getEnabledPaymentMethods(),
    testPaymentMethod
  }
}

// Hook para configuraciones de envío
export const useShippingSettings = () => {
  const { getSetting } = useSettings()
  
  const shippingSettings = getSetting('shipping', {
    freeShippingThreshold: 15000,
    defaultShippingCost: 500,
    shippingZones: []
  })

  const calculateShippingCost = (orderTotal, zone = null) => {
    if (orderTotal >= shippingSettings.freeShippingThreshold) {
      return 0
    }

    if (zone && shippingSettings.shippingZones) {
      const shippingZone = shippingSettings.shippingZones.find(z => z.name === zone)
      if (shippingZone) {
        return shippingZone.cost
      }
    }

    return shippingSettings.defaultShippingCost
  }

  const getShippingZones = () => {
    return shippingSettings.shippingZones || []
  }

  return {
    shippingSettings,
    calculateShippingCost,
    shippingZones: getShippingZones()
  }
}

export default useSettings