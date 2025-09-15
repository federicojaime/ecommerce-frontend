// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener notificaciones de la API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getNotifications()
      
      const notificationsList = response.data || []
      setNotifications(notificationsList)
      
      // Calcular no leídas
      const unread = notificationsList.filter(notification => !notification.read).length
      setUnreadCount(unread)
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError(error.message)
      
      // No cargar datos simulados, mantener estado vacío
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Error al marcar la notificación como leída')
    }
  }, [])

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      setUnreadCount(0)
      
      toast.success('Todas las notificaciones marcadas como leídas')
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Error al marcar todas las notificaciones como leídas')
    }
  }, [])

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await apiService.deleteNotification(notificationId)
      
      setNotifications(prev => {
        const remaining = prev.filter(notification => notification.id !== notificationId)
        setUnreadCount(remaining.filter(n => !n.read).length)
        return remaining
      })
      
      toast.success('Notificación eliminada')
      
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar la notificación')
    }
  }, [])

  // Formatear tiempo relativo
  const getRelativeTime = useCallback((timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Hace unos segundos'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `Hace ${days} día${days > 1 ? 's' : ''}`
    }
  }, [])

  // Efecto para cargar notificaciones al montar
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling automático cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getRelativeTime
  }
}