import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const ImageUploader = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false)
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

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    
    if (images.length + fileArray.length > maxImages) {
      toast.error(`Solo puedes subir un máximo de ${maxImages} imágenes.`)
      return
    }

    const validFiles = fileArray.filter(validateFile)
    if (validFiles.length === 0) return

    // Crear previews para los archivos válidos
    const newImages = []
    const promises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push({
            file,
            preview: e.target.result,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size
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
    // Limpiar el input para permitir seleccionar el mismo archivo otra vez
    e.target.value = ''
  }

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    onImagesChange(updatedImages)
  }

  const reorderImages = (dragIndex, dropIndex) => {
    const updatedImages = [...images]
    const draggedImage = updatedImages[dragIndex]
    updatedImages.splice(dragIndex, 1)
    updatedImages.splice(dropIndex, 0, draggedImage)
    onImagesChange(updatedImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de carga */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-amber-400 bg-amber-50' 
            : 'border-slate-300 hover:border-amber-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center">
          {dragActive ? (
            <CloudArrowUpIcon className="w-16 h-16 text-amber-500 mb-4" />
          ) : (
            <PhotoIcon className="w-16 h-16 text-slate-400 mb-4" />
          )}
          
          <div>
            <p className="text-lg font-medium text-slate-600 mb-1">
              {dragActive 
                ? 'Suelta las imágenes aquí' 
                : images.length > 0 
                  ? 'Agregar más imágenes' 
                  : 'Agregar imágenes'
              }
            </p>
            <p className="text-sm text-slate-500 mb-2">
              Haz clic para seleccionar o arrastra archivos aquí
            </p>
            <p className="text-xs text-slate-400">
              {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} hasta {Math.round(maxSize / (1024 * 1024))}MB por imagen
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
              className="relative group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
                if (dragIndex !== index) {
                  reorderImages(dragIndex, index)
                }
              }}
            >
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              
              {/* Overlay con controles */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(image.id)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors duration-200"
                  title="Eliminar imagen"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Indicador de imagen principal */}
              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="bg-amber-400 text-slate-900 text-xs px-2 py-1 rounded-full font-semibold">
                    Principal
                  </span>
                </div>
              )}
              
              {/* Indicador de orden */}
              <div className="absolute top-2 right-2">
                <span className="bg-slate-900/70 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  {index + 1}
                </span>
              </div>
              
              {/* Información del archivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">{image.name}</p>
                <p className="text-white/80 text-xs">{(image.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Mensaje de ayuda */}
      {images.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            💡 Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploader