// src/pages/Help.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlayIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'

// Tutorial steps - apuntan a elementos reales de la interfaz
const tutorialSteps = [
  {
    target: '[data-tutorial="dashboard-link"]',
    title: 'Panel de Control',
    content: 'Aquí puedes ver el resumen de tu negocio: ventas, productos y estadísticas importantes.',
    placement: 'right'
  },
  {
    target: '[data-tutorial="products-link"]', 
    title: 'Gestionar Productos',
    content: 'En esta sección puedes agregar, editar y organizar todos tus productos. Es el corazón de tu tienda.',
    placement: 'right'
  },
  {
    target: '[data-tutorial="categories-link"]',
    title: 'Organizar Categorías',
    content: 'Organiza tus productos en categorías para que los clientes los encuentren fácilmente.',
    placement: 'right'
  },
  {
    target: '[data-tutorial="orders-link"]',
    title: 'Gestionar Pedidos',
    content: 'Gestiona todos los pedidos de tu tienda: pendientes, procesando y entregados.',
    placement: 'right'
  },
  {
    target: '[data-tutorial="user-profile"]',
    title: 'Tu Perfil',
    content: '¡Perfecto! Aquí puedes ver tu información de usuario. Ya conoces lo básico de tu panel de administración.',
    placement: 'bottom'
  }
]

// Hook para gestionar el tutorial
const useTutorial = () => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem('onboarding-completed')
    setHasCompleted(completed === 'true')
  }, [])

  const startTutorial = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    completeTutorial()
  }

  const completeTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
    setHasCompleted(true)
    localStorage.setItem('onboarding-completed', 'true')
  }

  const resetTutorial = () => {
    setHasCompleted(false)
    localStorage.removeItem('onboarding-completed')
    startTutorial()
  }

  return {
    isActive,
    currentStep,
    hasCompleted,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    resetTutorial
  }
}

// Componente del overlay tutorial
const TutorialOverlay = ({ 
  isActive, 
  currentStep, 
  onNext, 
  onPrev, 
  onSkip 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [spotlight, setSpotlight] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const tooltipRef = useRef(null)

  const step = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  useEffect(() => {
    if (!isActive || !step?.target) return

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target)
      if (!targetElement || !tooltipRef.current) return

      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      
      // Configurar spotlight
      setSpotlight({
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16
      })

      // Calcular posición del tooltip
      let top, left

      switch (step.placement) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 20
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case 'bottom':
          top = targetRect.bottom + 20
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2
          break
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.left - tooltipRect.width - 20
          break
        case 'right':
        default:
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2
          left = targetRect.right + 20
          break
      }

      // Ajustar si se sale de pantalla
      const maxLeft = window.innerWidth - tooltipRect.width - 20
      const maxTop = window.innerHeight - tooltipRect.height - 20
      
      left = Math.max(20, Math.min(left, maxLeft))
      top = Math.max(20, Math.min(top, maxTop))

      setPosition({ top, left })

      // Scroll al elemento
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }

    const timer = setTimeout(updatePosition, 100)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isActive, step, currentStep])

  if (!isActive || !step) return null

  return (
    <>
      {/* Backdrop con spotlight */}
      <div className="fixed inset-0 z-[9998]">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="spotlight">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="rgba(0, 0, 0, 0.75)" 
            mask="url(#spotlight)"
          />
        </svg>
        
        {/* Highlight ring */}
        <div 
          className="absolute border-4 border-blue-400 rounded-xl animate-pulse"
          style={{
            top: spotlight.top - 2,
            left: spotlight.left - 2,
            width: spotlight.width + 4,
            height: spotlight.height + 4,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fade-in"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">
            {currentStep + 1} de {tutorialSteps.length}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Saltar
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Anterior
          </button>

          <button
            onClick={onNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastStep ? '¡Finalizar!' : 'Siguiente'}
            {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-1" />}
          </button>
        </div>

        {/* Arrow */}
        <div 
          className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
            step.placement === 'top' ? '-bottom-1.5 border-b-0 border-r-0' :
            step.placement === 'bottom' ? '-top-1.5 border-t-0 border-l-0' :
            step.placement === 'left' ? '-right-1.5 border-r-0 border-b-0' :
            '-left-1.5 border-l-0 border-t-0'
          }`}
          style={{
            [step.placement === 'top' || step.placement === 'bottom' ? 'left' : 'top']: '50%',
            [step.placement === 'top' || step.placement === 'bottom' ? 'marginLeft' : 'marginTop']: '-6px'
          }}
        />
      </div>
    </>
  )
}

// Página de Ayuda
const Help = () => {
  const tutorial = useTutorial()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqData = [
    {
      category: 'Primeros Pasos',
      questions: [
        {
          q: '¿Cómo agrego mi primer producto?',
          a: 'Ve a la sección "Productos" en el menú lateral, haz clic en "Agregar Producto" y completa la información requerida: nombre, precio, descripción e imágenes.'
        },
        {
          q: '¿Qué formato de imágenes puedo usar?',
          a: 'Aceptamos JPG, PNG, WEBP y GIF. El tamaño máximo es de 10MB por imagen y puedes subir hasta 7 imágenes por producto.'
        },
        {
          q: '¿Cómo creo categorías para mis productos?',
          a: 'En la sección "Categorías", haz clic en "Agregar categoría". Puedes crear categorías principales y subcategorías para mejor organización.'
        }
      ]
    },
    {
      category: 'Gestión de Productos',
      questions: [
        {
          q: '¿Cómo cambio el orden de las imágenes?',
          a: 'Arrastra las imágenes para reordenarlas o usa los botones de flecha. La primera imagen será la principal que se muestra en los listados.'
        },
        {
          q: '¿Qué es el SKU y por qué es importante?',
          a: 'El SKU es un código único para identificar cada producto. Te ayuda a rastrear inventario y es especialmente útil si tienes muchos productos similares.'
        },
        {
          q: '¿Cómo configuro alertas de stock bajo?',
          a: 'En cada producto, configura el "Stock mínimo". Cuando el stock llegue a ese nivel, aparecerá una alerta en el dashboard.'
        }
      ]
    },
    {
      category: 'Pedidos y Ventas',
      questions: [
        {
          q: '¿Cómo proceso un pedido?',
          a: 'Los pedidos aparecen en la sección "Pedidos". Cambia el estado de "Pendiente" a "Procesando", luego a "Enviado" cuando lo despachas.'
        },
        {
          q: '¿Puedo cancelar un pedido?',
          a: 'Sí, puedes cambiar el estado a "Cancelado" desde la lista de pedidos. Es recomendable comunicarse con el cliente antes de cancelar.'
        },
        {
          q: '¿Cómo veo los detalles completos de un pedido?',
          a: 'Haz clic en el ícono de ojo (👁️) en la lista de pedidos para ver información detallada: productos, cliente, dirección y totales.'
        }
      ]
    },
    {
      category: 'Reportes y Análisis',
      questions: [
        {
          q: '¿Cómo interpreto las gráficas del dashboard?',
          a: 'La gráfica principal muestra ventas mensuales. El gráfico circular muestra las categorías más vendidas. Úsalos para identificar tendencias.'
        },
        {
          q: '¿Puedo exportar reportes?',
          a: 'Actualmente el botón "Exportar" está en desarrollo. Pronto podrás descargar reportes en PDF y Excel.'
        }
      ]
    },
    {
      category: 'Problemas Técnicos',
      questions: [
        {
          q: 'Las imágenes no se cargan correctamente',
          a: 'Verifica que el archivo sea menor a 10MB y en formato JPG, PNG, WEBP o GIF. Si persiste el problema, intenta con una imagen más pequeña.'
        },
        {
          q: 'Error al guardar productos',
          a: 'Asegúrate de completar los campos obligatorios (marcados con *) y que las imágenes cumplan los requisitos de tamaño y formato.'
        },
        {
          q: 'No puedo eliminar una categoría',
          a: 'Solo puedes eliminar categorías que no tengan productos asignados. Primero mueve o elimina los productos de esa categoría.'
        }
      ]
    }
  ]

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Ayuda</h1>
              <p className="text-gray-600">Aprende a usar tu panel de administración</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!tutorial.hasCompleted ? (
                <button
                  onClick={tutorial.startTutorial}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Iniciar Tutorial
                </button>
              ) : (
                <button
                  onClick={tutorial.resetTutorial}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Repetir Tutorial
                </button>
              )}
            </div>
          </div>
          
          {tutorial.hasCompleted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ ¡Has completado el tutorial! Puedes repetirlo cuando quieras.
              </p>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h2>
          
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, index) => (
                  <div key={index} className="p-6">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === `${categoryIndex}-${index}` ? null : `${categoryIndex}-${index}`)}
                      className="w-full text-left flex justify-between items-start"
                    >
                      <h4 className="font-medium text-gray-900 pr-4">{item.q}</h4>
                      <ChevronRightIcon className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                        expandedFaq === `${categoryIndex}-${index}` ? 'rotate-90' : ''
                      }`} />
                    </button>
                    {expandedFaq === `${categoryIndex}-${index}` && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isActive={tutorial.isActive}
        currentStep={tutorial.currentStep}
        onNext={tutorial.nextStep}
        onPrev={tutorial.prevStep}
        onSkip={tutorial.skipTutorial}
      />
    </>
  )
}

export default Help