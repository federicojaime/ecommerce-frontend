// src/utils/settingsUtils.js

/**
 * Utilidades para manejo de configuraciones
 */

// Validadores comunes
export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  url: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  hexColor: (value) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return hexRegex.test(value)
  },

  phone: (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(value.replace(/\s|-|\(|\)/g, ''))
  },

  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim().length > 0
  },

  minLength: (min) => (value) => {
    return value && value.toString().length >= min
  },

  maxLength: (max) => (value) => {
    return !value || value.toString().length <= max
  },

  numeric: (value) => {
    return !isNaN(value) && !isNaN(parseFloat(value))
  },

  positiveNumber: (value) => {
    return validators.numeric(value) && parseFloat(value) >= 0
  },

  range: (min, max) => (value) => {
    const num = parseFloat(value)
    return !isNaN(num) && num >= min && num <= max
  }
}

// Funciones de validación para diferentes categorías
export const settingsValidators = {
  store: {
    name: [validators.required, validators.minLength(2), validators.maxLength(100)],
    email: [validators.email],
    phone: [validators.phone],
    website: [validators.url],
    taxId: [validators.minLength(5)]
  },

  style: {
    primaryColor: [validators.required, validators.hexColor],
    secondaryColor: [validators.required, validators.hexColor],
    accentColor: [validators.hexColor],
    productGridColumns: [validators.range(1, 8)]
  },

  notifications: {
    smtpHost: [validators.required],
    smtpPort: [validators.range(1, 65535)],
    smtpUsername: [validators.required],
    fromEmail: [validators.email]
  },

  security: {
    passwordMinLength: [validators.range(6, 32)],
    sessionTimeout: [validators.range(5, 480)],
    maxLoginAttempts: [validators.range(1, 10)],
    lockoutDuration: [validators.range(60, 3600)]
  },

  payment: {
    taxRate: [validators.range(0, 100)],
    'mercadoPago.accessToken': [validators.minLength(10)],
    'mercadoPago.publicKey': [validators.minLength(10)],
    'stripe.secretKey': [validators.minLength(10)],
    'stripe.publishableKey': [validators.minLength(10)]
  },

  shipping: {
    freeShippingThreshold: [validators.positiveNumber],
    defaultShippingCost: [validators.positiveNumber],
    defaultWeight: [validators.positiveNumber]
  }
}

// Función para validar un valor usando múltiples validadores
export const validateValue = (value, validatorArray) => {
  if (!validatorArray || validatorArray.length === 0) return { valid: true }

  for (const validator of validatorArray) {
    if (!validator(value)) {
      return { valid: false, error: getValidationError(validator, value) }
    }
  }

  return { valid: true }
}

// Obtener mensaje de error para un validador
const getValidationError = (validator, value) => {
  if (validator === validators.required) return 'Este campo es obligatorio'
  if (validator === validators.email) return 'Ingresa un email válido'
  if (validator === validators.url) return 'Ingresa una URL válida'
  if (validator === validators.hexColor) return 'Ingresa un color hexadecimal válido'
  if (validator === validators.phone) return 'Ingresa un teléfono válido'
  if (validator === validators.numeric) return 'Debe ser un número'
  if (validator === validators.positiveNumber) return 'Debe ser un número positivo'
  return 'Valor inválido'
}

// Función para validar una sección completa
export const validateSection = (sectionData, sectionName) => {
  const validators = settingsValidators[sectionName]
  if (!validators) return { valid: true, errors: {} }

  const errors = {}
  let hasErrors = false

  for (const [field, validatorArray] of Object.entries(validators)) {
    const value = getNestedValue(sectionData, field)
    const validation = validateValue(value, validatorArray)
    
    if (!validation.valid) {
      errors[field] = validation.error
      hasErrors = true
    }
  }

  return { valid: !hasErrors, errors }
}

// Obtener valor anidado usando notación de punto
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// Establecer valor anidado usando notación de punto
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    return current[key]
  }, obj)
  
  target[lastKey] = value
  return obj
}

// Formatear valores para mostrar
export const formatters = {
  currency: (value, currency = 'ARS') => {
    const currencySymbols = {
      ARS: '$',
      USD: 'US$',
      EUR: '€'
    }
    
    return `${currencySymbols[currency] || '$'} ${parseFloat(value || 0).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  },

  percentage: (value) => {
    return `${parseFloat(value || 0).toFixed(1)}%`
  },

  fileSize: (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  },

  phone: (value) => {
    // Formatear teléfono argentino
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('54')) {
      const number = cleaned.substring(2)
      if (number.length === 10) {
        return `+54 ${number.substring(0, 2)} ${number.substring(2, 6)}-${number.substring(6)}`
      }
    }
    return value
  },

  truncate: (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }
}

// Configuraciones por defecto para diferentes tipos de negocio
export const businessTemplates = {
  retail: {
    store: {
      business_type: 'retail',
      industry: 'general',
      currency: 'ARS'
    },
    style: {
      primaryColor: '#eddacb',
      secondaryColor: '#2d3c5d',
      productGridColumns: 4
    },
    shipping: {
      freeShippingThreshold: 15000,
      defaultShippingCost: 500
    }
  },

  fashion: {
    store: {
      business_type: 'fashion',
      industry: 'clothing',
      currency: 'ARS'
    },
    style: {
      primaryColor: '#ec4899',
      secondaryColor: '#1f2937',
      productGridColumns: 3
    },
    shipping: {
      freeShippingThreshold: 20000,
      defaultShippingCost: 800
    }
  },

  electronics: {
    store: {
      business_type: 'electronics',
      industry: 'technology',
      currency: 'ARS'
    },
    style: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e293b',
      productGridColumns: 4
    },
    shipping: {
      freeShippingThreshold: 50000,
      defaultShippingCost: 1200
    }
  }
}

// Función para aplicar template de negocio
export const applyBusinessTemplate = (currentSettings, templateName) => {
  const template = businessTemplates[templateName]
  if (!template) return currentSettings

  const newSettings = { ...currentSettings }
  
  for (const [section, sectionData] of Object.entries(template)) {
    if (!newSettings[section]) {
      newSettings[section] = {}
    }
    
    newSettings[section] = {
      ...newSettings[section],
      ...sectionData
    }
  }

  return newSettings
}

// Función para limpiar configuraciones sensibles antes de exportar
export const sanitizeForExport = (settings) => {
  const cleaned = JSON.parse(JSON.stringify(settings))
  
  // Limpiar contraseñas y tokens
  if (cleaned.notifications) {
    delete cleaned.notifications.smtpPassword
  }
  
  if (cleaned.payment) {
    if (cleaned.payment.mercadoPago) {
      delete cleaned.payment.mercadoPago.accessToken
    }
    if (cleaned.payment.stripe) {
      delete cleaned.payment.stripe.secretKey
    }
    if (cleaned.payment.paypal) {
      delete cleaned.payment.paypal.clientSecret
    }
  }
  
  return cleaned
}

// Función para verificar completitud de configuraciones
export const getConfigurationCompleteness = (settings) => {
  const sections = [
    {
      name: 'store',
      required: ['name', 'email', 'currency'],
      optional: ['phone', 'address', 'description']
    },
    {
      name: 'style',
      required: ['primaryColor', 'secondaryColor'],
      optional: ['logoPosition', 'sidebarStyle']
    },
    {
      name: 'notifications',
      required: ['fromEmail'],
      optional: ['smtpHost', 'smtpUsername']
    },
    {
      name: 'security',
      required: ['passwordMinLength', 'sessionTimeout'],
      optional: ['twoFactorAuth', 'loginAlerts']
    },
    {
      name: 'payment',
      required: ['currency'],
      optional: ['mercadoPago', 'stripe', 'paypal']
    },
    {
      name: 'shipping',
      required: ['defaultShippingCost'],
      optional: ['freeShippingThreshold', 'shippingZones']
    }
  ]

  const results = sections.map(section => {
    const sectionData = settings[section.name] || {}
    const requiredCompleted = section.required.filter(field => 
      getNestedValue(sectionData, field)
    ).length
    const optionalCompleted = section.optional.filter(field => 
      getNestedValue(sectionData, field)
    ).length

    const totalFields = section.required.length + section.optional.length
    const completedFields = requiredCompleted + optionalCompleted
    const completion = (completedFields / totalFields) * 100

    return {
      name: section.name,
      completion: Math.round(completion),
      requiredCompleted: requiredCompleted === section.required.length,
      totalFields,
      completedFields
    }
  })

  const overallCompletion = results.reduce((sum, section) => sum + section.completion, 0) / results.length

  return {
    overall: Math.round(overallCompletion),
    sections: results
  }
}

// Función para migrar configuraciones a nueva versión
export const migrateSettings = (settings, fromVersion = '1.0', toVersion = '1.1') => {
  let migrated = { ...settings }

  // Ejemplo de migración
  if (fromVersion === '1.0' && toVersion === '1.1') {
    // Agregar nuevos campos con valores por defecto
    if (!migrated.style?.accentColor) {
      migrated.style = { ...migrated.style, accentColor: '#3b82f6' }
    }
    
    if (!migrated.security?.rateLimitEnabled) {
      migrated.security = { ...migrated.security, rateLimitEnabled: true }
    }
  }

  return migrated
}

// Exportar utilidades principales
export default {
  validators,
  settingsValidators,
  validateValue,
  validateSection,
  setNestedValue,
  formatters,
  businessTemplates,
  applyBusinessTemplate,
  sanitizeForExport,
  getConfigurationCompleteness,
  migrateSettings
}