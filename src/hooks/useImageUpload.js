import { useState } from 'react'
import toast from 'react-hot-toast'

export const useImageUpload = (initialImages = []) => {
  const [images, setImages] = useState(initialImages)

  const addImages = (newImages) => {
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const reorderImages = (dragIndex, dropIndex) => {
    setImages(prev => {
      const updatedImages = [...prev]
      const draggedImage = updatedImages[dragIndex]
      updatedImages.splice(dragIndex, 1)
      updatedImages.splice(dropIndex, 0, draggedImage)
      return updatedImages
    })
  }

  const clearImages = () => {
    setImages([])
  }

  const getFiles = () => {
    return images.map(img => img.file).filter(Boolean)
  }

  const getPreviews = () => {
    return images.map(img => img.preview)
  }

  const validateImages = (files, maxSize = 10 * 1024 * 1024, acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) => {
    const validFiles = []
    const invalidFiles = []

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push({
          file,
          error: `${file.name} es muy grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB.`
        })
        return
      }

      if (!acceptedFormats.includes(file.type)) {
        invalidFiles.push({
          file,
          error: `${file.name} no es un formato válido.`
        })
        return
      }

      validFiles.push(file)
    })

    // Mostrar errores
    invalidFiles.forEach(({ error }) => {
      toast.error(error)
    })

    return validFiles
  }

  const processFiles = async (files, maxImages = 5) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Solo puedes subir un máximo de ${maxImages} imágenes.`)
      return
    }

    const validFiles = validateImages(files)
    if (validFiles.length === 0) return

    const newImages = []
    
    for (const file of validFiles) {
      try {
        const preview = await createPreview(file)
        newImages.push({
          file,
          preview,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size
        })
      } catch (error) {
        console.error('Error creating preview:', error)
        toast.error(`Error procesando ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      addImages(newImages)
      toast.success(`${newImages.length} imagen${newImages.length > 1 ? 'es' : ''} agregada${newImages.length > 1 ? 's' : ''}`)
    }
  }

  const createPreview = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const processWithCompression = async (files, options = {}) => {
    const {
      maxImages = 5,
      maxSize = 10 * 1024 * 1024,
      compressLarge = true,
      compressionThreshold = 2 * 1024 * 1024, // 2MB
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8
    } = options

    if (images.length + files.length > maxImages) {
      toast.error(`Solo puedes subir un máximo de ${maxImages} imágenes.`)
      return
    }

    const validFiles = validateImages(files, maxSize)
    if (validFiles.length === 0) return

    const newImages = []
    
    for (const file of validFiles) {
      try {
        let processedFile = file

        // Comprimir si es necesario
        if (compressLarge && file.size > compressionThreshold) {
          toast.info(`Comprimiendo ${file.name}...`)
          processedFile = await compressImage(file, maxWidth, maxHeight, quality)
        }

        const preview = await createPreview(processedFile)
        newImages.push({
          file: processedFile,
          preview,
          id: Date.now() + Math.random(),
          name: processedFile.name,
          size: processedFile.size,
          originalSize: file.size
        })
      } catch (error) {
        console.error('Error processing file:', error)
        toast.error(`Error procesando ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      addImages(newImages)
      const compressedCount = newImages.filter(img => img.originalSize !== img.size).length
      toast.success(
        `${newImages.length} imagen${newImages.length > 1 ? 'es' : ''} agregada${newImages.length > 1 ? 's' : ''}` +
        (compressedCount > 0 ? ` (${compressedCount} comprimida${compressedCount > 1 ? 's' : ''})` : '')
      )
    }
  }

  return {
    images,
    setImages,
    addImages,
    removeImage,
    reorderImages,
    clearImages,
    getFiles,
    getPreviews,
    processFiles,
    processWithCompression,
    validateImages,
    compressImage
  }
}

export default useImageUpload