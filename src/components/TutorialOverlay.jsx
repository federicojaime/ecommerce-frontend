// src/components/TutorialOverlay.jsx
import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, LightBulbIcon } from '@heroicons/react/24/outline'

const TutorialOverlay = ({ 
  isActive, 
  steps = [], 
  currentStep = 0, 
  onNext, 
  onPrev, 
  onClose,
  onComplete 
}) => {
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 })
  const overlayRef = useRef(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  useEffect(() => {
    if (!isActive || !step?.target) return

    const updatePosition = () => {
      const targetElement = document.querySelector(step.target)
      if (!targetElement || !overlayRef.current) return

      const targetRect = targetElement.getBoundingClientRect()
      const overlayRect = overlayRef.current.getBoundingClientRect()
      
      let top, left

      switch (step.position) {
        case 'top':
          top = targetRect.top - overlayRect.height - 20
          left = targetRect.left + (targetRect.width - overlayRect.width) / 2
          break
        case 'bottom':
          top = targetRect.bottom + 20
          left = targetRect.left + (targetRect.width - overlayRect.width) / 2
          break
        case 'left':
          top = targetRect.top + (targetRect.height - overlayRect.height) / 2
          left = targetRect.left - overlayRect.width - 20
          break
        case 'right':
        default:
          top = targetRect.top + (targetRect.height - overlayRect.height) / 2
          left = targetRect.right + 20
          break
      }

      // Ajustar si se sale de la pantalla
      const maxLeft = window.innerWidth - overlayRect.width - 20
      const maxTop = window.innerHeight - overlayRect.height - 20
      
      left = Math.max(20, Math.min(left, maxLeft))
      top = Math.max(20, Math.min(top, maxTop))

      setOverlayPosition({ top, left })
    }

    // Esperar un frame para que el DOM se actualice
    requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isActive, step, currentStep])

  useEffect(() => {
    if (!isActive || !step?.target) return

    const targetElement = document.querySelector(step.target)
    if (!targetElement) return

    // Highlight del elemento
    targetElement.style.position = 'relative'
    targetElement.style.zIndex = '9999'
    targetElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)'
    targetElement.style.borderRadius = '8px'
    targetElement.style.transition = 'all 0.3s ease'

    // Scroll al elemento si es necesario
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    })

    return () => {
      targetElement.style.position = ''
      targetElement.style.zIndex = ''
      targetElement.style.boxShadow = ''
      targetElement.style.borderRadius = ''
      targetElement.style.transition = ''
    }
  }, [isActive, step?.target])

  if (!isActive || !step) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
      
      {/* Tutorial Card */}
      <div
        ref={overlayRef}
        className="fixed z-[9999] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 animate-fade-in"
        style={{
          top: `${overlayPosition.top}px`,
          left: `${overlayPosition.left}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-lg">
              <LightBulbIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-500">
              Paso {currentStep + 1} de {steps.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
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
          
          {step.tips && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-medium text-blue-900 mb-1">💡 Consejo</div>
              <div className="text-xs text-blue-800">{step.tips}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Anterior
          </button>

          <button
            onClick={isLastStep ? onComplete : onNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastStep ? 'Finalizar' : 'Siguiente'}
            {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-1" />}
          </button>
        </div>

        {/* Arrow pointing to target */}
        <div 
          className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
            step.position === 'top' ? '-bottom-1.5 border-b-0 border-r-0' :
            step.position === 'bottom' ? '-top-1.5 border-t-0 border-l-0' :
            step.position === 'left' ? '-right-1.5 border-r-0 border-b-0' :
            '-left-1.5 border-l-0 border-t-0'
          }`}
          style={{
            [step.position === 'top' || step.position === 'bottom' ? 'left' : 'top']: '50%',
            [step.position === 'top' || step.position === 'bottom' ? 'marginLeft' : 'marginTop']: '-6px'
          }}
        />
      </div>
    </>
  )
}

export default TutorialOverlay