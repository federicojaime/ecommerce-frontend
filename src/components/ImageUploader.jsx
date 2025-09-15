import { useState, useRef } from 'react'
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ArrowsUpDownIcon,
  StarIcon,
  PencilIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { productImageService } from '../services/productImageService'

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 7,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  productId = null, // Para operaciones en productos existentes
  mode = 'create' // 'create' | 'edit'
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showImageEditor, setShowImageEditor] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      toast.error(`${file.name} es muy grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB por imagen.`)
      return false
    }

    if (!acceptedFormats.includes(file.type)) {
      toast.error(`${file.name} no es un formato válido. Use JPG, PNG, WEBP o GIF.`)
      return false
    }

    return true
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files)

    if (images.length + fileArray.length > maxImages) {
      toast.error(`Solo puedes subir un máximo de ${maxImages} imágenes.`)
      return
    }

    const validFiles = fileArray.filter(validateFile)
    if (validFiles.length === 0) return

    // Si estamos en modo edición y tenemos productId, subir directamente
    if (mode === 'edit' && productId) {
      await uploadNewImages(validFiles)
      return
    }

    // Modo creación: crear previews locales
    const newImages = []
    const promises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push({
            file,
            preview: e.target.result,
            id: `new_${Date.now()}_${Math.random()}`,
            name: file.name,
            size: file.size,
            isExisting: false,
            isNew: true
          })
          resolve()
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(() => {
      onImagesChange([...images, ...newImages])
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} imagen${validFiles.length > 1 ? 'es' : ''} agregada${validFiles.length > 1 ? 's' : ''}`)
      }
    })
  }

  /**
   * Subir nuevas imágenes a producto existente
   */
  const uploadNewImages = async (files) => {
    if (!productId) {
      toast.error('No se puede subir imágenes sin ID de producto')
      return
    }

    setLoading(true)
    try {
      const response = await productImageService.uploadImages(productId, files)

      // Refrescar la lista de imágenes
      if (response.images) {
        const processedImages = response.images.map((img, index) => ({
          id: `existing_${img.id}`,
          preview: getImageUrl(img.image_path),
          name: img.alt_text || `Imagen ${index + 1}`,
          size: 0,
          isExisting: true,
          imageId: img.id,
          imagePath: img.image_path,
          isPrimary: img.is_primary === 1,
          sortOrder: img.sort_order
        }))

        onImagesChange([...images, ...processedImages])
      }

      toast.success(`${files.length} imagen${files.length > 1 ? 'es' : ''} subida${files.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Error al subir imágenes')
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
    e.target.value = ''
  }

  /**
   * Eliminar imagen
   */
  const removeImage = async (imageId) => {
    const image = images.find(img => img.id === imageId)

    if (!image) return

    // Si es una imagen existente y tenemos productId, eliminar del servidor
    if (image.isExisting && productId && image.imageId) {
      setLoading(true)
      try {
        await productImageService.deleteImage(productId, image.imageId)
        toast.success('Imagen eliminada del servidor')
      } catch (error) {
        console.error('Error deleting image:', error)
        toast.error('Error al eliminar imagen del servidor')
        setLoading(false)
        return
      } finally {
        setLoading(false)
      }
    }

    // Eliminar de la lista local
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)

    if (image.isNew) {
      toast.success('Imagen removida de la lista')
    }
  }

  /**
   * Reordenar imágenes con drag & drop
   */
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDropReorder = async (e, dropIndex) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === dropIndex) return

    const updatedImages = [...images]
    const draggedImage = updatedImages[draggedIndex]

    // Remover imagen de posición original
    updatedImages.splice(draggedIndex, 1)

    // Insertar en nueva posición
    updatedImages.splice(dropIndex, 0, draggedImage)

    onImagesChange(updatedImages)
    setDraggedIndex(null)

    // Si estamos en modo edición, actualizar orden en el servidor
    if (mode === 'edit' && productId) {
      await updateServerOrder(updatedImages)
    }

    toast.success('Imágenes reordenadas')
  }

  /**
   * Actualizar orden en el servidor
   */
  const updateServerOrder = async (orderedImages) => {
    const existingImages = orderedImages.filter(img => img.isExisting && img.imageId)

    if (existingImages.length === 0) return

    try {
      const imageIds = existingImages.map(img => img.imageId)
      await productImageService.reorderImages(productId, imageIds)
    } catch (error) {
      console.error('Error updating server order:', error)
      toast.error('Error al actualizar orden en el servidor')
    }
  }

  /**
   * Mover imagen (botones de flecha)
   */
  const moveImage = async (fromIndex, direction) => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

    if (toIndex < 0 || toIndex >= images.length) return

    const updatedImages = [...images]
    const imageToMove = updatedImages[fromIndex]

    updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, imageToMove)

    onImagesChange(updatedImages)

    // Si estamos en modo edición, actualizar orden en el servidor
    if (mode === 'edit' && productId) {
      await updateServerOrder(updatedImages)
    }

    toast.success('Imagen movida')
  }

  /**
   * Establecer imagen como principal
   */
  const setPrimaryImage = async (index) => {
    if (index === 0) return // Ya es primaria

    const updatedImages = [...images]
    const imageToMakePrimary = updatedImages[index]

    // Mover a la primera posición
    updatedImages.splice(index, 1)
    updatedImages.unshift(imageToMakePrimary)

    onImagesChange(updatedImages)

    // Si es una imagen existente y tenemos productId, actualizar en servidor
    if (imageToMakePrimary.isExisting && productId && imageToMakePrimary.imageId) {
      try {
        await productImageService.setPrimaryImage(productId, imageToMakePrimary.imageId)
        toast.success('Imagen establecida como principal en el servidor')
      } catch (error) {
        console.error('Error setting primary image:', error)
        toast.error('Error al establecer imagen principal en el servidor')
      }
    } else {
      toast.success('Imagen establecida como principal')
    }
  }

  /**
   * Optimizar imagen
   */
  const optimizeImage = async (imageId) => {
    const image = images.find(img => img.id === imageId)

    if (!image?.isExisting || !productId || !image.imageId) {
      toast.error('Solo se pueden optimizar imágenes existentes')
      return
    }

    setLoading(true)
    try {
      await productImageService.optimizeImage(productId, image.imageId, {
        width: 800,
        height: 600,
        quality: 85,
        format: 'webp'
      })

      toast.success('Imagen optimizada correctamente')

      // Recargar la imagen actualizada
      // Aquí podrías recargar las imágenes del producto
    } catch (error) {
      console.error('Error optimizing image:', error)
      toast.error('Error al optimizar imagen')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Construir URL de imagen
   */
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null

    if (imagePath.startsWith('http')) return imagePath

    const baseUrl = 'https://decohomesinrival.com.ar/ecommerce-api/public'
    const cleanPath = imagePath.replace(/^\/+/, '')
    return `${baseUrl}/uploads/${cleanPath}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de carga */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${dragActive
            ? 'border-[#eddacb] bg-amber-50'
            : 'border-slate-300 hover:border-[#eddacb]'
          } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
          disabled={loading}
        />

        <div className="flex flex-col items-center">
          {loading ? (
            <div className="w-16 h-16 flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#eddacb] border-t-transparent"></div>
            </div>
          ) : dragActive ? (
            <CloudArrowUpIcon className="w-16 h-16 text-[#eddacb] mb-4" />
          ) : (
            <PhotoIcon className="w-16 h-16 text-slate-400 mb-4" />
          )}

          <div>
            <p className="text-lg font-medium text-slate-600 mb-1">
              {loading ? 'Subiendo imágenes...' :
                dragActive ? 'Suelta las imágenes aquí' :
                  images.length > 0 ? 'Agregar más imágenes' : 'Agregar imágenes'
              }
            </p>
            <p className="text-sm text-slate-500 mb-2">
              {loading ? 'Por favor espera...' : 'Haz clic para seleccionar o arrastra archivos aquí'}
            </p>
            <p className="text-xs text-slate-400">
              JPG, PNG, WEBP, GIF hasta {Math.round(maxSize / (1024 * 1024))}MB por imagen
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Máximo {maxImages} imágenes ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      </div>

      {/* Grid de previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative group rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 border-2 ${image.isExisting
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-slate-200'
                } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDropReorder(e, index)}
            >
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  console.error('Error loading image preview:', image.preview)
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'flex'
                }}
              />

              {/* Fallback si la imagen no carga */}
              <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400" style={{ display: 'none' }}>
                <PhotoIcon className="w-8 h-8" />
              </div>

              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                {/* Botones principales */}
                <div className="flex items-center gap-1">
                  {/* Ver imagen */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(image.preview, '_blank')
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition-colors duration-200"
                    title="Ver imagen completa"
                  >
                    <EyeIcon className="w-3 h-3" />
                  </button>

                  {/* Optimizar (solo imágenes existentes) */}
                  {image.isExisting && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        optimizeImage(image.id)
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-1 transition-colors duration-200"
                      title="Optimizar imagen"
                    >
                      <Cog6ToothIcon className="w-3 h-3" />
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(image.id)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                    title="Eliminar imagen"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>

                {/* Botones de reordenamiento */}
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveImage(index, 'up')
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition-colors duration-200"
                      title="Mover hacia arriba"
                    >
                      <ArrowsUpDownIcon className="w-3 h-3 rotate-180" />
                    </button>
                  )}

                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveImage(index, 'down')
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 transition-colors duration-200"
                      title="Mover hacia abajo"
                    >
                      <ArrowsUpDownIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Botón hacer primaria */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPrimaryImage(index)
                    }}
                    className="bg-[#eddacb] hover:bg-[#ddc8b0] text-slate-900 text-xs px-2 py-1 rounded-full font-semibold transition-colors duration-200 flex items-center gap-1"
                    title="Hacer imagen principal"
                  >
                    <StarIcon className="w-3 h-3" />
                    Principal
                  </button>
                )}
              </div>

              {/* Indicadores */}
              <div className="absolute top-2 left-2 z-10 space-y-1">
                {/* Indicador de imagen principal */}
                {index === 0 && (
                  <span className="bg-[#eddacb] text-slate-900 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <StarIconSolid className="w-3 h-3" />
                    Principal
                  </span>
                )}

                {/* Indicador de imagen existente */}
                {image.isExisting && (
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Guardada
                  </span>
                )}

                {/* Indicador de imagen nueva */}
                {image.isNew && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Nueva
                  </span>
                )}
              </div>

              {/* Indicador de orden */}
              <div className="absolute top-2 right-2">
                <span className="bg-slate-900/70 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {index + 1}
                </span>
              </div>

              {/* Información del archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">{image.name}</p>
                <p className="text-white/80 text-xs">
                  {image.size > 0 ? `${(image.size / 1024).toFixed(1)} KB` : 'Guardada'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensaje de ayuda */}
      {images.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>💡 Gestión avanzada:</strong> Arrastra para reordenar, click en ⭐ para hacer principal,
            usa 👁️ para ver completa y ⚙️ para optimizar.
            {mode === 'edit' ? ' Los cambios se guardan automáticamente.' : ' Guardar producto para aplicar cambios.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploader