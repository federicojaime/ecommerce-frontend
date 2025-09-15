// src/hooks/useTutorial.js
import { useState, useEffect } from 'react'

const useTutorial = (tutorialId, steps = []) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)

  // Cargar estado desde localStorage
  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]')
    setHasCompleted(completedTutorials.includes(tutorialId))
  }, [tutorialId])

  const startTutorial = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
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

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }

  const closeTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
  }

  const completeTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
    setHasCompleted(true)
    
    // Guardar en localStorage
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]')
    if (!completedTutorials.includes(tutorialId)) {
      completedTutorials.push(tutorialId)
      localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials))
    }
  }

  const resetTutorial = () => {
    setHasCompleted(false)
    setCurrentStep(0)
    
    // Remover de localStorage
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '[]')
    const filtered = completedTutorials.filter(id => id !== tutorialId)
    localStorage.setItem('completedTutorials', JSON.stringify(filtered))
  }

  return {
    isActive,
    currentStep,
    hasCompleted,
    startTutorial,
    nextStep,
    prevStep,
    goToStep,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    progress: steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0
  }
}

export default useTutorial

// Ejemplo de uso en un componente:
/*
import useTutorial from '../hooks/useTutorial'
import TutorialOverlay from '../components/TutorialOverlay'

const MyComponent = () => {
  const tutorialSteps = [
    {
      target: '[data-tutorial="step1"]',
      title: 'Paso 1',
      content: 'Este es el primer paso del tutorial',
      position: 'right'
    },
    {
      target: '[data-tutorial="step2"]',
      title: 'Paso 2', 
      content: 'Este es el segundo paso',
      position: 'bottom',
      tips: 'Consejo útil para este paso'
    }
  ]

  const tutorial = useTutorial('my-tutorial', tutorialSteps)

  return (
    <div>
      <button onClick={tutorial.startTutorial}>
        Iniciar Tutorial
      </button>
      
      <div data-tutorial="step1">Elemento 1</div>
      <div data-tutorial="step2">Elemento 2</div>
      
      <TutorialOverlay
        isActive={tutorial.isActive}
        steps={tutorialSteps}
        currentStep={tutorial.currentStep}
        onNext={tutorial.nextStep}
        onPrev={tutorial.prevStep}
        onClose={tutorial.closeTutorial}
        onComplete={tutorial.completeTutorial}
      />
    </div>
  )
}
*/