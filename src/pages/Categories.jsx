import { useState, useEffect } from 'react'
import { apiService } from '../services/apiService'
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await apiService.getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, formData)
        toast.success('Categoría actualizada correctamente')
      } else {
        await apiService.createCategory(formData)
        toast.success('Categoría creada correctamente')
      }
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error.response?.data?.error || 'Error al guardar categoría')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parent_id: category.parent_id || '',
      status: category.status || 'active'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await apiService.deleteCategory(id)
      toast.success('Categoría eliminada correctamente')
      setShowDeleteAlert(null)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error.response?.data?.error || 'Error al eliminar categoría')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent_id: '',
      status: 'active'
    })
  }

  const openCreateModal = () => {
    resetForm()
    setEditingCategory(null)
    setShowModal(true)
  }

  const parentCategories = categories.filter(cat => !cat.parent_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Organiza tus productos por categorías</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 w-full sm:w-auto"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Agregar categoría
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center min-w-0 flex-1">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{category.name}</h3>
                  {category.parent_name && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Subcategoría de: {category.parent_name}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1 sm:space-x-2 ml-2">
                <button 
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowDeleteAlert(category)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600 text-sm line-clamp-2">{category.description || 'Sin descripción'}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  category.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-sm text-gray-500">
                  {category.products_count || 0} productos
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera categoría.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    rows={3}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría padre</label>
                  <select
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={formData.parent_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                  >
                    <option value="">Sin categoría padre</option>
                    {parentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Alert */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="relative w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Eliminar categoría
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  ¿Está seguro de eliminar la categoría "<span className="font-medium">{showDeleteAlert.name}</span>"? Esta acción no se puede deshacer.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowDeleteAlert(null)}
                    className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteAlert.id)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories