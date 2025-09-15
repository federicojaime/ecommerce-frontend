// src/components/settings/SettingsComponents.jsx
import React, { useState } from 'react'
import {
    EyeIcon,
    EyeSlashIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    PlayIcon,
    PlusIcon,
    TrashIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline'

// Componente para Toggle Switch
export const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
    disabled = false,
    color = 'blue'
}) => {
    const colorClasses = {
        blue: enabled ? 'bg-blue-600' : 'bg-gray-200',
        green: enabled ? 'bg-green-600' : 'bg-gray-200',
        red: enabled ? 'bg-red-600' : 'bg-gray-200',
        yellow: enabled ? 'bg-yellow-600' : 'bg-gray-200',
        purple: enabled ? 'bg-purple-600' : 'bg-gray-200'
    }

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <button
                onClick={() => !disabled && onChange(!enabled)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${colorClasses[color]}`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}

// Componente para campos de contraseña
export const PasswordField = ({
    label,
    value,
    onChange,
    placeholder = "••••••••",
    required = false,
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    {...props}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            </div>
        </div>
    )
}

// Componente para selector de color
export const ColorPicker = ({
    label,
    value,
    onChange,
    className = ""
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-3">
                <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
            </div>
        </div>
    )
}

// Componente para alertas/notificaciones
export const Alert = ({
    type = 'info',
    title,
    children,
    onClose,
    className = ""
}) => {
    const typeStyles = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-400',
            titleColor: 'text-blue-800',
            textColor: 'text-blue-700'
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: CheckCircleIcon,
            iconColor: 'text-green-400',
            titleColor: 'text-green-800',
            textColor: 'text-green-700'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-400',
            titleColor: 'text-yellow-800',
            textColor: 'text-yellow-700'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: XCircleIcon,
            iconColor: 'text-red-400',
            titleColor: 'text-red-800',
            textColor: 'text-red-700'
        }
    }

    const style = typeStyles[type]
    const Icon = style.icon

    return (
        <div className={`${style.bg} ${style.border} border rounded-lg p-4 ${className}`}>
            <div className="flex">
                <Icon className={`h-5 w-5 ${style.iconColor} mr-2 flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                    {title && (
                        <h3 className={`text-sm font-medium ${style.titleColor} mb-1`}>
                            {title}
                        </h3>
                    )}
                    <div className={`text-sm ${style.textColor}`}>
                        {children}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`ml-3 ${style.iconColor} hover:opacity-75`}
                    >
                        <XCircleIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    )
}

// Componente para botones de test
export const TestButton = ({
    onTest,
    loading,
    result,
    disabled = false,
    label = "Probar"
}) => {
    const getIcon = () => {
        if (loading) return <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />
        if (result === 'success') return <CheckCircleIcon className="w-4 h-4 text-green-500" />
        if (result === 'error') return <XCircleIcon className="w-4 h-4 text-red-500" />
        return <PlayIcon className="w-4 h-4" />
    }

    const getButtonClass = () => {
        let base = "px-3 py-1 text-xs rounded hover:bg-gray-200 disabled:opacity-50 flex items-center space-x-1 transition-colors"

        if (result === 'success') return `${base} bg-green-100 text-green-700 hover:bg-green-200`
        if (result === 'error') return `${base} bg-red-100 text-red-700 hover:bg-red-200`
        return `${base} bg-gray-100 text-gray-700`
    }

    return (
        <button
            onClick={onTest}
            disabled={disabled || loading}
            className={getButtonClass()}
        >
            {getIcon()}
            <span>{label}</span>
        </button>
    )
}

// Componente para upload de archivos
export const FileUpload = ({
    onUpload,
    accept = "*/*",
    maxSize = 5 * 1024 * 1024, // 5MB
    label = "Subir archivo",
    description = "",
    loading = false,
    currentFile = null,
    className = ""
}) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (file.size > maxSize) {
            alert(`El archivo es muy grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB`)
            return
        }

        onUpload(file)
        event.target.value = '' // Limpiar input
    }

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-4">
                {currentFile && (
                    <div className="flex-shrink-0">
                        {currentFile.startsWith('data:image') || currentFile.includes('image') ? (
                            <img
                                src={currentFile}
                                alt="Preview"
                                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-500">Archivo</span>
                            </div>
                        )}
                    </div>
                )}
                <label className={`cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg px-6 py-4 hover:bg-blue-100 transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-sm text-blue-600 block text-center">{label}</span>
                    {description && (
                        <span className="text-xs text-blue-500 block text-center mt-1">{description}</span>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </label>
            </div>
        </div>
    )
}

// Componente para listas dinámicas
export const DynamicList = ({
    items,
    onAdd,
    onRemove,
    onUpdate,
    renderItem,
    addButtonLabel = "Agregar",
    className = ""
}) => {
    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900">Lista</h4>
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    {addButtonLabel}
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                {renderItem(item, index, onUpdate)}
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Componente para tabs
export const TabNavigation = ({
    tabs,
    activeTab,
    onTabChange,
    className = ""
}) => {
    return (
        <div className={className}>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {Icon && <Icon className="w-5 h-5 mr-2" />}
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}

// Componente para campo de número con formato
export const NumberField = ({
    label,
    value,
    onChange,
    prefix = "",
    suffix = "",
    min,
    max,
    step = 1,
    className = "",
    ...props
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {prefix}
                    </span>
                )}
                <input
                    type="number"
                    className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${prefix ? 'pl-8' : 'pl-4'
                        } ${suffix ? 'pr-8' : 'pr-4'}`}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    min={min}
                    max={max}
                    step={step}
                    {...props}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    )
}

// Componente para sección colapsible
export const CollapsibleSection = ({
    title,
    children,
    defaultOpen = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={`border border-gray-200 rounded-lg ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
            >
                <h3 className="font-medium text-gray-900">{title}</h3>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    )
}

// Componente para campo de texto con validación
export const ValidatedTextField = ({
    label,
    value,
    onChange,
    validation,
    error,
    required = false,
    placeholder = "",
    className = "",
    ...props
}) => {
    const [isValid, setIsValid] = useState(true)

    const handleChange = (e) => {
        const newValue = e.target.value
        onChange(newValue)

        if (validation) {
            setIsValid(validation(newValue))
        }
    }

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && '*'}
            </label>
            <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${error || !isValid
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                {...props}
            />
            {(error || !isValid) && (
                <p className="mt-1 text-sm text-red-600">
                    {error || 'Valor inválido'}
                </p>
            )}
        </div>
    )
}

// Componente para estadísticas
export const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'blue',
    className = ""
}) => {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
        purple: 'text-purple-600'
    }

    return (
        <div className={`text-center ${className}`}>
            {Icon && (
                <div className="flex justify-center mb-2">
                    <Icon className={`w-8 h-8 ${colorClasses[color]}`} />
                </div>
            )}
            <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
            <p className="text-sm text-gray-600">{title}</p>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    )
}

// Componente para preview de configuraciones
export const SettingsPreview = ({
    title,
    settings,
    className = ""
}) => {
    return (
        <div className={className}>
            <h4 className="text-md font-medium text-gray-900 mb-3">{title}</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {settings.primaryColor && (
                    <div
                        className="w-full h-20 rounded-lg flex items-center justify-center text-white font-semibold mb-2"
                        style={{ backgroundColor: settings.primaryColor }}
                    >
                        Color Primario
                    </div>
                )}
                {settings.secondaryColor && (
                    <div
                        className="w-full h-12 rounded-lg flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: settings.secondaryColor }}
                    >
                        Color Secundario
                    </div>
                )}
            </div>
        </div>
    )
}

// Componente para progreso de configuración
export const ConfigurationProgress = ({
    sections,
    className = ""
}) => {
    const completedSections = sections.filter(s => s.completed).length
    const totalSections = sections.length
    const progress = (completedSections / totalSections) * 100

    return (
        <div className={className}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Configuración completada
                </span>
                <span className="text-sm text-gray-500">
                    {completedSections}/{totalSections}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="mt-2 text-xs text-gray-500">
                {Math.round(progress)}% completado
            </div>
        </div>
    )
}

// Exportar todos los componentes
export {
    ToggleSwitch,
    PasswordField,
    ColorPicker,
    Alert,
    TestButton,
    FileUpload,
    DynamicList,
    TabNavigation,
    NumberField,
    CollapsibleSection,
    ValidatedTextField,
    StatsCard,
    SettingsPreview,
    ConfigurationProgress
}