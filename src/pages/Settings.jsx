import React, { useState, useEffect, useCallback } from 'react'
import {
    CogIcon,
    BuildingStorefrontIcon,
    UserIcon,
    KeyIcon,
    PaintBrushIcon,
    BellIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    TruckIcon,
    EyeIcon,
    EyeSlashIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    CloudArrowUpIcon,
    PlayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    PhotoIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { settingsService } from '../services/settingsService'
import toast from 'react-hot-toast'

const Settings = () => {
    const { user, changePassword, updateProfile } = useAuth()
    const [activeTab, setActiveTab] = useState('store')
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    })

    // Estados para cada sección - VALORES INICIALES SEGUROS
    const [storeData, setStoreData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        logo: null,
        currency: 'ARS',
        timezone: 'America/Argentina/Buenos_Aires',
        country: 'Argentina',
        city: 'Buenos Aires',
        postal_code: '1000',
        website: '',
        language: 'es',
        tax_id: '',
        business_type: 'retail',
        industry: 'home_decor',
        founded_year: new Date().getFullYear()
    })

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        role: ''
    })

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    })

    const [styleData, setStyleData] = useState({
        primaryColor: '#eddacb',
        secondaryColor: '#2d3c5d',
        accentColor: '#3b82f6',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        dangerColor: '#ef4444',
        fontFamily: 'Inter, sans-serif',
        logoPosition: 'center',
        sidebarStyle: 'dark',
        headerStyle: 'light',
        showBreadcrumbs: true,
        showProductCount: true,
        productGridColumns: 4
    })

    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        orderNotifications: true,
        stockAlerts: true,
        marketingEmails: false,
        weeklyReports: true,
        monthlyReports: true,
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpEncryption: 'tls',
        fromEmail: '',
        fromName: ''
    })

    const [securityData, setSecurityData] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        loginAlerts: true,
        passwordExpiry: 90,
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        maxLoginAttempts: 5,
        lockoutDuration: 900,
        rateLimitEnabled: true,
        requestsPerMinute: 60
    })

    const [paymentData, setPaymentData] = useState({
        currency: 'ARS',
        taxRate: 21.0,
        acceptPartialPayments: false,
        mercadoPago: { enabled: false, accessToken: '', publicKey: '', sandboxMode: true },
        stripe: { enabled: false, secretKey: '', publishableKey: '', webhookSecret: '' },
        paypal: { enabled: false, clientId: '', clientSecret: '', sandboxMode: true },
        bankTransfer: { enabled: true, accountDetails: '' }
    })

    const [shippingData, setShippingData] = useState({
        freeShippingThreshold: 15000,
        defaultShippingCost: 500,
        processingTime: '1-2 días hábiles',
        defaultWeight: 0.5,
        originAddress: 'Buenos Aires, Argentina',
        shippingZones: [
            { name: 'CABA', cost: 500, time: '24-48hs', description: 'Capital Federal' },
            { name: 'GBA', cost: 800, time: '48-72hs', description: 'Gran Buenos Aires' },
            { name: 'Interior', cost: 1200, time: '3-5 días', description: 'Resto del país' }
        ],
        methods: {
            standard: { enabled: true, name: 'Envío Estándar', price: 500.00, estimatedDays: '3-5', description: 'Envío estándar en días hábiles' },
            express: { enabled: true, name: 'Envío Express', price: 1000.00, estimatedDays: '1-2', description: 'Envío rápido en 24-48hs' },
            pickup: { enabled: true, name: 'Retiro en Tienda', price: 0.00, description: 'Retiro gratuito en nuestro local' }
        }
    })

    const [stats, setStats] = useState(null)
    const [paymentTestResults, setPaymentTestResults] = useState({})
    const [validationErrors, setValidationErrors] = useState({})
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Función helper para extraer valores de la estructura de la API
    const extractValue = (settingObject) => {
        if (!settingObject) return undefined
        if (typeof settingObject === 'object' && settingObject.value !== undefined) {
            return settingObject.value
        }
        return settingObject
    }

    // Función helper para convertir valores a string de forma segura
    const safeString = (value) => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return ''
        return String(value)
    }

    // Función helper para convertir valores a número de forma segura
    const safeNumber = (value, defaultValue = 0) => {
        if (value === null || value === undefined) return defaultValue
        const num = Number(value)
        return isNaN(num) ? defaultValue : num
    }

    // Cargar configuraciones desde la API
    useEffect(() => {
        loadSettings()
        loadConfigurationStats()
    }, [])

    // Actualizar datos del usuario cuando cambie el contexto
    useEffect(() => {
        if (user) {
            setUserData({
                name: safeString(user.name),
                email: safeString(user.email),
                phone: safeString(user.phone),
                role: safeString(user.role)
            })
        }
    }, [user])

    // Detectar cambios no guardados
    useEffect(() => {
        const checkForChanges = () => {
            setHasUnsavedChanges(true)
        }

        const timeout = setTimeout(checkForChanges, 1000)
        return () => clearTimeout(timeout)
    }, [storeData, styleData, notificationData, securityData, paymentData, shippingData])

    const loadSettings = async () => {
        setInitialLoading(true)
        try {
            const settings = await settingsService.getSettings()
            console.log('Settings loaded:', settings)

            // Actualizar storeData con conversión segura
            if (settings.store) {
                setStoreData(prev => ({
                    ...prev,
                    name: safeString(extractValue(settings.store.name)),
                    phone: safeString(extractValue(settings.store.phone)),
                    email: safeString(extractValue(settings.store.email)),
                    address: safeString(extractValue(settings.store.address)),
                    description: safeString(extractValue(settings.store.description)),
                    logo: extractValue(settings.store.logo) || null,
                    currency: safeString(extractValue(settings.store.currency)) || 'ARS',
                    timezone: safeString(extractValue(settings.store.timezone)) || 'America/Argentina/Buenos_Aires',
                    country: safeString(extractValue(settings.store.country)) || 'Argentina',
                    city: safeString(extractValue(settings.store.city)) || 'Buenos Aires',
                    postal_code: safeString(extractValue(settings.store.postal_code)) || '1000',
                    website: safeString(extractValue(settings.store.website)),
                    language: safeString(extractValue(settings.store.language)) || 'es',
                    tax_id: safeString(extractValue(settings.store.tax_id)),
                    business_type: safeString(extractValue(settings.store.business_type)) || 'retail',
                    industry: safeString(extractValue(settings.store.industry)) || 'home_decor',
                    founded_year: safeNumber(extractValue(settings.store.founded_year), new Date().getFullYear())
                }))
            }

            // Actualizar styleData con conversión segura
            if (settings.style) {
                setStyleData(prev => ({
                    ...prev,
                    primaryColor: safeString(extractValue(settings.style.primaryColor)) || '#eddacb',
                    secondaryColor: safeString(extractValue(settings.style.secondaryColor)) || '#2d3c5d',
                    accentColor: safeString(extractValue(settings.style.accentColor)) || '#3b82f6',
                    successColor: safeString(extractValue(settings.style.successColor)) || '#10b981',
                    warningColor: safeString(extractValue(settings.style.warningColor)) || '#f59e0b',
                    dangerColor: safeString(extractValue(settings.style.dangerColor)) || '#ef4444',
                    fontFamily: safeString(extractValue(settings.style.fontFamily)) || 'Inter, sans-serif',
                    logoPosition: safeString(extractValue(settings.style.logoPosition)) || 'center',
                    sidebarStyle: safeString(extractValue(settings.style.sidebarStyle)) || 'dark',
                    headerStyle: safeString(extractValue(settings.style.headerStyle)) || 'light',
                    showBreadcrumbs: Boolean(extractValue(settings.style.showBreadcrumbs)),
                    showProductCount: Boolean(extractValue(settings.style.showProductCount)),
                    productGridColumns: safeNumber(extractValue(settings.style.productGridColumns), 4)
                }))
            }

            // Actualizar notificationData con conversión segura
            if (settings.notifications) {
                setNotificationData(prev => ({
                    ...prev,
                    emailNotifications: Boolean(extractValue(settings.notifications.emailNotifications)),
                    orderNotifications: Boolean(extractValue(settings.notifications.orderNotifications)),
                    stockAlerts: Boolean(extractValue(settings.notifications.stockAlerts)),
                    marketingEmails: Boolean(extractValue(settings.notifications.marketingEmails)),
                    weeklyReports: Boolean(extractValue(settings.notifications.weeklyReports)),
                    monthlyReports: Boolean(extractValue(settings.notifications.monthlyReports)),
                    smtpHost: safeString(extractValue(settings.notifications.smtpHost)),
                    smtpPort: safeNumber(extractValue(settings.notifications.smtpPort), 587),
                    smtpUsername: safeString(extractValue(settings.notifications.smtpUsername)),
                    smtpPassword: safeString(extractValue(settings.notifications.smtpPassword)),
                    smtpEncryption: safeString(extractValue(settings.notifications.smtpEncryption)) || 'tls',
                    fromEmail: safeString(extractValue(settings.notifications.fromEmail)),
                    fromName: safeString(extractValue(settings.notifications.fromName))
                }))
            }

            // Actualizar securityData con conversión segura
            if (settings.security) {
                setSecurityData(prev => ({
                    ...prev,
                    twoFactorAuth: Boolean(extractValue(settings.security.twoFactorAuth)),
                    sessionTimeout: safeNumber(extractValue(settings.security.sessionTimeout), 30),
                    loginAlerts: Boolean(extractValue(settings.security.loginAlerts)),
                    passwordExpiry: safeNumber(extractValue(settings.security.passwordExpiry), 90),
                    passwordMinLength: safeNumber(extractValue(settings.security.passwordMinLength), 8),
                    requireSpecialChars: Boolean(extractValue(settings.security.requireSpecialChars)),
                    requireNumbers: Boolean(extractValue(settings.security.requireNumbers)),
                    requireUppercase: Boolean(extractValue(settings.security.requireUppercase)),
                    maxLoginAttempts: safeNumber(extractValue(settings.security.maxLoginAttempts), 5),
                    lockoutDuration: safeNumber(extractValue(settings.security.lockoutDuration), 900),
                    rateLimitEnabled: Boolean(extractValue(settings.security.rateLimitEnabled)),
                    requestsPerMinute: safeNumber(extractValue(settings.security.requestsPerMinute), 60)
                }))
            }

            // Actualizar paymentData con conversión segura
            if (settings.payment) {
                const mercadoPagoData = extractValue(settings.payment.mercadoPago) || {}
                const stripeData = extractValue(settings.payment.stripe) || {}
                const paypalData = extractValue(settings.payment.paypal) || {}
                const bankTransferData = extractValue(settings.payment.bankTransfer) || {}

                setPaymentData(prev => ({
                    ...prev,
                    currency: safeString(extractValue(settings.payment.currency)) || 'ARS',
                    taxRate: safeNumber(extractValue(settings.payment.taxRate), 21.0),
                    acceptPartialPayments: Boolean(extractValue(settings.payment.acceptPartialPayments)),
                    mercadoPago: {
                        enabled: Boolean(mercadoPagoData.enabled),
                        accessToken: safeString(mercadoPagoData.accessToken),
                        publicKey: safeString(mercadoPagoData.publicKey),
                        sandboxMode: Boolean(mercadoPagoData.sandboxMode)
                    },
                    stripe: {
                        enabled: Boolean(stripeData.enabled),
                        secretKey: safeString(stripeData.secretKey),
                        publishableKey: safeString(stripeData.publishableKey),
                        webhookSecret: safeString(stripeData.webhookSecret)
                    },
                    paypal: {
                        enabled: Boolean(paypalData.enabled),
                        clientId: safeString(paypalData.clientId),
                        clientSecret: safeString(paypalData.clientSecret),
                        sandboxMode: Boolean(paypalData.sandboxMode)
                    },
                    bankTransfer: {
                        enabled: Boolean(bankTransferData.enabled),
                        accountDetails: safeString(bankTransferData.accountDetails)
                    }
                }))
            }

            // Actualizar shippingData con conversión segura
            if (settings.shipping) {
                const shippingZones = extractValue(settings.shipping.shippingZones)
                const shippingMethods = extractValue(settings.shipping.methods)

                setShippingData(prev => ({
                    ...prev,
                    freeShippingThreshold: safeNumber(extractValue(settings.shipping.freeShippingThreshold), 15000),
                    defaultShippingCost: safeNumber(extractValue(settings.shipping.defaultShippingCost), 500),
                    processingTime: safeString(extractValue(settings.shipping.processingTime)) || '1-2 días hábiles',
                    defaultWeight: safeNumber(extractValue(settings.shipping.defaultWeight), 0.5),
                    originAddress: safeString(extractValue(settings.shipping.originAddress)) || 'Buenos Aires, Argentina',
                    shippingZones: Array.isArray(shippingZones) ? shippingZones : [
                        { name: 'CABA', cost: 500, time: '24-48hs', description: 'Capital Federal' },
                        { name: 'GBA', cost: 800, time: '48-72hs', description: 'Gran Buenos Aires' },
                        { name: 'Interior', cost: 1200, time: '3-5 días', description: 'Resto del país' }
                    ],
                    methods: shippingMethods || {
                        standard: { enabled: true, name: 'Envío Estándar', price: 500.00, estimatedDays: '3-5', description: 'Envío estándar en días hábiles' },
                        express: { enabled: true, name: 'Envío Express', price: 1000.00, estimatedDays: '1-2', description: 'Envío rápido en 24-48hs' },
                        pickup: { enabled: true, name: 'Retiro en Tienda', price: 0.00, description: 'Retiro gratuito en nuestro local' }
                    }
                }))
            }

            setHasUnsavedChanges(false)
            toast.success('Configuraciones cargadas')
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Error al cargar configuraciones')
        } finally {
            setInitialLoading(false)
        }
    }

    const loadConfigurationStats = async () => {
        try {
            const configStats = await settingsService.getConfigurationStats()
            setStats(configStats)
        } catch (error) {
            console.error('Error loading configuration stats:', error)
        }
    }

    const validateAllSettings = useCallback(async () => {
        try {
            const allSettings = {
                store: storeData,
                style: styleData,
                notifications: notificationData,
                security: securityData,
                payment: paymentData,
                shipping: shippingData
            }

            const validation = await settingsService.validateSettings(allSettings)

            if (!validation.valid) {
                setValidationErrors(validation.errors)
                return false
            }

            if (validation.warnings && validation.warnings.length > 0) {
                validation.warnings.forEach(warning => toast(warning, { icon: '⚠️' }))
            }

            setValidationErrors({})
            return true
        } catch (error) {
            console.error('Error validating settings:', error)
            toast.error('Error al validar configuraciones')
            return false
        }
    }, [storeData, styleData, notificationData, securityData, paymentData, shippingData])

    const saveSettings = async () => {
        setLoading(true)
        try {
            const isValid = await validateAllSettings()
            if (!isValid) {
                toast.error('Por favor corrige los errores antes de guardar')
                return
            }

            const settings = {
                store: storeData,
                style: styleData,
                notifications: notificationData,
                security: securityData,
                payment: paymentData,
                shipping: shippingData
            }

            await settingsService.saveSettings(settings)
            setHasUnsavedChanges(false)
            toast.success('Configuraciones guardadas correctamente')

            await loadConfigurationStats()
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('Error al guardar configuraciones')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (passwordData.new.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }

        setLoading(true)
        try {
            await changePassword(passwordData.current, passwordData.new)
            setPasswordData({ current: '', new: '', confirm: '' })
            toast.success('Contraseña cambiada correctamente')
        } catch (error) {
            console.error('Error changing password:', error)
            toast.error('Error al cambiar contraseña')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async () => {
        setLoading(true)
        try {
            await updateProfile(userData)
            toast.success('Perfil actualizado correctamente')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Error al actualizar perfil')
        } finally {
            setLoading(false)
        }
    }

    const handleLogoUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El archivo es muy grande. Máximo 5MB')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Solo se permiten archivos de imagen')
            return
        }

        setLoading(true)
        try {
            const result = await settingsService.uploadLogo(file)
            setStoreData(prev => ({ ...prev, logo: result.logo_url }))
            setHasUnsavedChanges(true)
            toast.success('Logo subido correctamente')
        } catch (error) {
            console.error('Error uploading logo:', error)
            toast.error(error.message || 'Error al subir logo')
        } finally {
            setLoading(false)
        }
    }

    const testPaymentConnection = async (provider) => {
        const credentials = paymentData[provider]
        if (!credentials.enabled) {
            toast.error('Habilita el método de pago primero')
            return
        }

        setLoading(true)
        setPaymentTestResults(prev => ({ ...prev, [provider]: 'testing' }))

        try {
            await settingsService.testPaymentConnection(provider, credentials)
            setPaymentTestResults(prev => ({ ...prev, [provider]: 'success' }))
            toast.success(`Conexión con ${provider} exitosa`)
        } catch (error) {
            console.error('Error testing payment connection:', error)
            setPaymentTestResults(prev => ({ ...prev, [provider]: 'error' }))
            toast.error(error.message || `Error al conectar con ${provider}`)
        } finally {
            setLoading(false)
        }
    }

    const exportSettings = async () => {
        try {
            const blob = await settingsService.exportSettings()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `configuraciones-decohome-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success('Configuraciones exportadas')
        } catch (error) {
            console.error('Error exporting settings:', error)
            toast.error('Error al exportar configuraciones')
        }
    }

    const importSettings = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            await settingsService.importSettings(file)
            await loadSettings()
            toast.success('Configuraciones importadas correctamente')
        } catch (error) {
            console.error('Error importing settings:', error)
            toast.error(error.message || 'Error al importar configuraciones')
        }

        event.target.value = ''
    }

    const addShippingZone = () => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: [...prev.shippingZones, { name: '', cost: 0, time: '', description: '' }]
        }))
        setHasUnsavedChanges(true)
    }

    const removeShippingZone = (index) => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: prev.shippingZones.filter((_, i) => i !== index)
        }))
        setHasUnsavedChanges(true)
    }

    const updateShippingZone = (index, field, value) => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: prev.shippingZones.map((zone, i) =>
                i === index ? { ...zone, [field]: value } : zone
            )
        }))
        setHasUnsavedChanges(true)
    }

    const tabs = [
        { id: 'store', label: 'Tienda', icon: BuildingStorefrontIcon },
        { id: 'profile', label: 'Perfil', icon: UserIcon },
        { id: 'password', label: 'Contraseña', icon: KeyIcon },
        { id: 'style', label: 'Estilo', icon: PaintBrushIcon },
        { id: 'notifications', label: 'Notificaciones', icon: BellIcon },
        { id: 'security', label: 'Seguridad', icon: ShieldCheckIcon },
        { id: 'payment', label: 'Pagos', icon: CurrencyDollarIcon },
        { id: 'shipping', label: 'Envíos', icon: TruckIcon }
    ]

    const getPaymentTestIcon = (provider) => {
        const result = paymentTestResults[provider]
        switch (result) {
            case 'testing': return <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />
            case 'success': return <CheckCircleIcon className="w-4 h-4 text-green-500" />
            case 'error': return <XCircleIcon className="w-4 h-4 text-red-500" />
            default: return <PlayIcon className="w-4 h-4" />
        }
    }

    const renderStoreSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Tienda</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la tienda *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.name}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, name: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                            placeholder="Nombre de tu tienda"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.phone}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, phone: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                            placeholder="+54 11 1234-5678"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.email}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, email: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                            placeholder="contacto@tutienda.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.currency}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, currency: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                        >
                            <option value="ARS">Peso Argentino (ARS)</option>
                            <option value="USD">Dólar Estadounidense (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.country}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, country: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                            placeholder="Argentina"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.city}
                            onChange={(e) => {
                                setStoreData(prev => ({ ...prev, city: e.target.value }))
                                setHasUnsavedChanges(true)
                            }}
                            placeholder="Buenos Aires"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección completa</label>
                    <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={storeData.address}
                        onChange={(e) => {
                            setStoreData(prev => ({ ...prev, address: e.target.value }))
                            setHasUnsavedChanges(true)
                        }}
                        placeholder="Dirección completa de tu tienda"
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de la tienda</label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={storeData.description}
                        onChange={(e) => {
                            setStoreData(prev => ({ ...prev, description: e.target.value }))
                            setHasUnsavedChanges(true)
                        }}
                        placeholder="Describe tu tienda y lo que vendes"
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la tienda</label>
                    <div className="flex items-center space-x-4">
                        {storeData.logo && (
                            <img
                                src={storeData.logo}
                                alt="Logo"
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                        )}
                        <label className="cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg px-6 py-4 hover:bg-blue-100 transition-colors">
                            <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <span className="text-sm text-blue-600 block text-center">Subir logo</span>
                            <span className="text-xs text-blue-500 block text-center mt-1">PNG, JPG, SVG (máx 5MB)</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={loading}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderProfileSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={userData.name}
                            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={userData.email}
                            onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={userData.phone}
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                            value={userData.role}
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">El rol no se puede modificar</p>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Actualizando...
                            </>
                        ) : (
                            'Actualizar Perfil'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )

    const renderPasswordSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>

                <div className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                        <div className="relative">
                            <input
                                type={showPassword.current ? 'text' : 'password'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                value={passwordData.current}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                            >
                                {showPassword.current ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? 'text' : 'password'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                            >
                                {showPassword.new ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? 'text' : 'password'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                            >
                                {showPassword.confirm ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handlePasswordChange}
                            disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Cambiando...
                                </>
                            ) : (
                                'Cambiar Contraseña'
                            )}
                        </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium">Consejos de seguridad:</p>
                                <ul className="mt-1 list-disc list-inside space-y-1">
                                    <li>Usa al menos 8 caracteres</li>
                                    <li>Incluye mayúsculas, minúsculas y números</li>
                                    <li>Evita usar información personal</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    // Renderizar resto de secciones (simplificado por espacio)
    const renderContent = () => {
        switch (activeTab) {
            case 'store': return renderStoreSettings()
            case 'profile': return renderProfileSettings()
            case 'password': return renderPasswordSettings()
            case 'style': return <div>Configuración de estilo (implementar)</div>
            case 'notifications': return <div>Configuración de notificaciones (implementar)</div>
            case 'security': return <div>Configuración de seguridad (implementar)</div>
            case 'payment': return <div>Configuración de pagos (implementar)</div>
            case 'shipping': return <div>Configuración de envíos (implementar)</div>
            default: return renderStoreSettings()
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#eddacb] border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            {/*  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CogIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                            <p className="text-gray-600 mt-1">Personaliza tu tienda y preferencias</p>
                        </div>
                    </div>

                    {/* Botones de acción 
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={exportSettings}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                        <label className="cursor-pointer px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                            Importar
                            <input
                                type="file"
                                className="hidden"
                                accept=".json"
                                onChange={importSettings}
                            />
                        </label>
                    </div>
                </div>

                {/* Estadísticas
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.total_settings}</p>
                            <p className="text-sm text-gray-600">Configuraciones</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.active_integrations}</p>
                            <p className="text-sm text-gray-600">Integraciones</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.security_score}%</p>
                            <p className="text-sm text-gray-600">Seguridad</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Último backup</p>
                            <p className="text-xs text-gray-500">
                                {new Date(stats.last_backup).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Alerta de cambios no guardados
                {hasUnsavedChanges && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-2" />
                            <p className="text-sm text-amber-800">
                                Tienes cambios sin guardar. No olvides guardar tus configuraciones.
                            </p>
                        </div>
                    </div>
                )}
            </div>
*/}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Configuraciones</h3>
                        </div>
                        <nav className="space-y-1 p-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {renderContent()}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveSettings}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-4 h-4 mr-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validación de errores */}
            {Object.keys(validationErrors).length > 0 && (
                <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
                    <div className="flex items-start">
                        <XCircleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800">Errores de validación</h4>
                            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                {Object.values(validationErrors).flat().map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Settings