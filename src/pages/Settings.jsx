import React, { useState, useEffect } from 'react'
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
    ClockIcon
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

    // Estados para cada sección
    const [storeData, setStoreData] = useState({
        name: 'Deco Home',
        phone: '+54 11 4567-8900',
        email: 'contacto@decohome.com',
        address: 'Av. Corrientes 1234, CABA, Argentina',
        description: 'Tu tienda de decoración y hogar',
        logo: null,
        currency: 'ARS',
        timezone: 'America/Argentina/Buenos_Aires'
    })

    const [userData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || ''
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
        logoPosition: 'center',
        sidebarStyle: 'dark',
        headerStyle: 'light'
    })

    const [notificationData, setNotificationData] = useState({
        emailNotifications: true,
        orderNotifications: true,
        stockAlerts: true,
        marketingEmails: false,
        weeklyReports: true,
        monthlyReports: true
    })

    const [securityData, setSecurityData] = useState({
        twoFactorAuth: false,
        sessionTimeout: 30,
        loginAlerts: true,
        passwordExpiry: 90
    })

    const [paymentData, setPaymentData] = useState({
        mercadoPago: { enabled: false, accessToken: '', publicKey: '', sandboxMode: true },
        stripe: { enabled: false, secretKey: '', publishableKey: '' },
        paypal: { enabled: false, clientId: '', clientSecret: '', sandboxMode: true }
    })

    const [shippingData, setShippingData] = useState({
        freeShippingThreshold: 15000,
        defaultShippingCost: 500,
        processingTime: '1-2 días hábiles',
        shippingZones: [
            { name: 'CABA', cost: 500, time: '24-48hs' },
            { name: 'GBA', cost: 800, time: '48-72hs' },
            { name: 'Interior', cost: 1200, time: '3-5 días' }
        ]
    })

    const [stats, setStats] = useState(null)
    const [paymentTestResults, setPaymentTestResults] = useState({})

    // Cargar configuraciones desde la API
    useEffect(() => {
        loadSettings()
        loadConfigurationStats()
    }, [])

    // Actualizar datos del usuario cuando cambie el contexto
    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || ''
            })
        }
    }, [user])

    const loadSettings = async () => {
        setInitialLoading(true)
        try {
            const settings = await settingsService.getSettings()

            if (settings.store) setStoreData(prev => ({ ...prev, ...settings.store }))
            if (settings.style) setStyleData(prev => ({ ...prev, ...settings.style }))
            if (settings.notifications) setNotificationData(prev => ({ ...prev, ...settings.notifications }))
            if (settings.security) setSecurityData(prev => ({ ...prev, ...settings.security }))
            if (settings.payment) setPaymentData(prev => ({ ...prev, ...settings.payment }))
            if (settings.shipping) setShippingData(prev => ({ ...prev, ...settings.shipping }))

            toast.success('Configuraciones cargadas')
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Error al cargar configuraciones. Usando valores por defecto.')
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

    const saveSettings = async () => {
        setLoading(true)
        try {
            const settings = {
                store: storeData,
                style: styleData,
                notifications: notificationData,
                security: securityData,
                payment: paymentData,
                shipping: shippingData
            }

            await settingsService.saveSettings(settings)
            toast.success('Configuración guardada correctamente')
            
            // Recargar estadísticas
            await loadConfigurationStats()
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error(error.message || 'Error al guardar configuración')
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

        if (file.size > 5 * 1024 * 1024) { // 5MB
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
            toast.success('Logo subido correctamente')
        } catch (error) {
            console.error('Error uploading logo:', error)
            toast.error('Error al subir logo')
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
            toast.error(`Error al conectar con ${provider}`)
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
            await loadSettings() // Recargar configuraciones
            toast.success('Configuraciones importadas correctamente')
        } catch (error) {
            console.error('Error importing settings:', error)
            toast.error('Error al importar configuraciones')
        }
        
        // Limpiar input
        event.target.value = ''
    }

    const addShippingZone = () => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: [...prev.shippingZones, { name: '', cost: 0, time: '' }]
        }))
    }

    const removeShippingZone = (index) => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: prev.shippingZones.filter((_, i) => i !== index)
        }))
    }

    const updateShippingZone = (index, field, value) => {
        setShippingData(prev => ({
            ...prev,
            shippingZones: prev.shippingZones.map((zone, i) => 
                i === index ? { ...zone, [field]: value } : zone
            )
        }))
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la tienda</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.name}
                            onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.phone}
                            onChange={(e) => setStoreData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.email}
                            onChange={(e) => setStoreData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={storeData.currency}
                            onChange={(e) => setStoreData(prev => ({ ...prev, currency: e.target.value }))}
                        >
                            <option value="ARS">Peso Argentino (ARS)</option>
                            <option value="USD">Dólar Estadounidense (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={storeData.address}
                        onChange={(e) => setStoreData(prev => ({ ...prev, address: e.target.value }))}
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de la tienda</label>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={storeData.description}
                        onChange={(e) => setStoreData(prev => ({ ...prev, description: e.target.value }))}
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

    const renderStyleSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalización Visual</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color primario</label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                value={styleData.primaryColor}
                                onChange={(e) => setStyleData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            />
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                value={styleData.primaryColor}
                                onChange={(e) => setStyleData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color secundario</label>
                        <div className="flex items-center space-x-3">
                            <input
                                type="color"
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                value={styleData.secondaryColor}
                                onChange={(e) => setStyleData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            />
                            <input
                                type="text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                value={styleData.secondaryColor}
                                onChange={(e) => setStyleData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estilo del sidebar</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={styleData.sidebarStyle}
                            onChange={(e) => setStyleData(prev => ({ ...prev, sidebarStyle: e.target.value }))}
                        >
                            <option value="dark">Oscuro</option>
                            <option value="light">Claro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Posición del logo</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={styleData.logoPosition}
                            onChange={(e) => setStyleData(prev => ({ ...prev, logoPosition: e.target.value }))}
                        >
                            <option value="center">Centro</option>
                            <option value="left">Izquierda</option>
                            <option value="right">Derecha</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Vista previa</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div
                            className="w-full h-20 rounded-lg flex items-center justify-center text-white font-semibold mb-2"
                            style={{ backgroundColor: styleData.primaryColor }}
                        >
                            Color Primario
                        </div>
                        <div
                            className="w-full h-12 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: styleData.secondaryColor }}
                        >
                            Color Secundario
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h3>

                <div className="space-y-4">
                    {[
                        { key: 'emailNotifications', label: 'Notificaciones por email', description: 'Recibir notificaciones generales por correo' },
                        { key: 'orderNotifications', label: 'Notificaciones de pedidos', description: 'Alertas cuando hay nuevos pedidos' },
                        { key: 'stockAlerts', label: 'Alertas de stock bajo', description: 'Notificar cuando productos tengan stock bajo' },
                        { key: 'marketingEmails', label: 'Emails de marketing', description: 'Recibir promociones y novedades' },
                        { key: 'weeklyReports', label: 'Reportes semanales', description: 'Resumen semanal de ventas y estadísticas' },
                        { key: 'monthlyReports', label: 'Reportes mensuales', description: 'Análisis mensual del negocio' }
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                                <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                            <button
                                onClick={() => setNotificationData(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationData[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationData[item.key] ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">Autenticación de dos factores</h4>
                            <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
                        </div>
                        <button
                            onClick={() => setSecurityData(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityData.twoFactorAuth ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo de sesión (minutos)
                        </label>
                        <select
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={securityData.sessionTimeout}
                            onChange={(e) => setSecurityData(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={120}>2 horas</option>
                            <option value={480}>8 horas</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">Alertas de inicio de sesión</h4>
                            <p className="text-sm text-gray-500">Notificar sobre nuevos inicios de sesión</p>
                        </div>
                        <button
                            onClick={() => setSecurityData(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityData.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityData.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiración de contraseña (días)
                        </label>
                        <select
                            className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={securityData.passwordExpiry}
                            onChange={(e) => setSecurityData(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                        >
                            <option value={30}>30 días</option>
                            <option value={60}>60 días</option>
                            <option value={90}>90 días</option>
                            <option value={180}>180 días</option>
                            <option value={365}>1 año</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderPaymentSettings = () => {
        const providers = settingsService.getPaymentProviders()
        
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>

                    <div className="space-y-6">
                        {providers.map((provider) => (
                            <div key={provider.id} className="border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 bg-${provider.color}-500 rounded-lg flex items-center justify-center mr-3`}>
                                            <span className="text-white font-bold text-sm">{provider.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{provider.name}</h4>
                                            <p className="text-sm text-gray-500">{provider.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => testPaymentConnection(provider.id)}
                                            disabled={!paymentData[provider.id]?.enabled || loading}
                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-1"
                                        >
                                            {getPaymentTestIcon(provider.id)}
                                            <span>Probar</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentData(prev => ({
                                                ...prev,
                                                [provider.id]: { ...prev[provider.id], enabled: !prev[provider.id]?.enabled }
                                            }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${paymentData[provider.id]?.enabled ? `bg-${provider.color}-600` : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${paymentData[provider.id]?.enabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {paymentData[provider.id]?.enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {provider.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {field.label} {field.required && '*'}
                                                </label>
                                                {field.type === 'boolean' ? (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={paymentData[provider.id]?.[field.key] || false}
                                                            onChange={(e) => setPaymentData(prev => ({
                                                                ...prev,
                                                                [provider.id]: { ...prev[provider.id], [field.key]: e.target.checked }
                                                            }))}
                                                        />
                                                        <span className="ml-2 text-sm text-gray-600">{field.label}</span>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder={field.type === 'password' ? '••••••••' : `Ingresa tu ${field.label.toLowerCase()}`}
                                                        value={paymentData[provider.id]?.[field.key] || ''}
                                                        onChange={(e) => setPaymentData(prev => ({
                                                            ...prev,
                                                            [provider.id]: { ...prev[provider.id], [field.key]: e.target.value }
                                                        }))}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderShippingSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Envíos</h3>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Envío gratis desde
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={shippingData.freeShippingThreshold}
                                    onChange={(e) => setShippingData(prev => ({
                                        ...prev,
                                        freeShippingThreshold: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Costo de envío por defecto
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={shippingData.defaultShippingCost}
                                    onChange={(e) => setShippingData(prev => ({
                                        ...prev,
                                        defaultShippingCost: parseInt(e.target.value) || 0
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo de procesamiento
                        </label>
                        <input
                            type="text"
                            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={shippingData.processingTime}
                            onChange={(e) => setShippingData(prev => ({
                                ...prev,
                                processingTime: e.target.value
                            }))}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-md font-medium text-gray-900">Zonas de Envío</h4>
                            <button
                                type="button"
                                onClick={addShippingZone}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Agregar Zona
                            </button>
                        </div>
                        <div className="space-y-3">
                            {shippingData.shippingZones.map((zone, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={zone.name}
                                            onChange={(e) => updateShippingZone(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={zone.cost}
                                                onChange={(e) => updateShippingZone(index, 'cost', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={zone.time}
                                            onChange={(e) => updateShippingZone(index, 'time', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => removeShippingZone(index)}
                                            className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderContent = () => {
        switch (activeTab) {
            case 'store': return renderStoreSettings()
            case 'profile': return renderProfileSettings()
            case 'password': return renderPasswordSettings()
            case 'style': return renderStyleSettings()
            case 'notifications': return renderNotificationSettings()
            case 'security': return renderSecuritySettings()
            case 'payment': return renderPaymentSettings()
            case 'shipping': return renderShippingSettings()
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
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

                    {/* Botones de acción */}
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

                {/* Estadísticas */}
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
            </div>

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
        </div>
    )
}

export default Settings