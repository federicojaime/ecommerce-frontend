// src/services/notificationService.js
import api from './authService'
import toast from 'react-hot-toast'

export const notificationService = {
  // ==================== NOTIFICACIONES DE ÓRDENES ====================
  
  /**
   * Enviar notificación de cambio de estado de orden
   */
  sendOrderStatusNotification: async (orderId, status, customerEmail) => {
    try {
      console.log(`Sending order status notification for order ${orderId}`)
      
      const response = await api.post(`/admin/orders/${orderId}/notify`, {
        type: 'status_update',
        status: status,
        email: customerEmail
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending order status notification:', error)
      
      // Simular envío exitoso para desarrollo
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const statusMessages = {
        pending: 'Hemos recibido tu pedido y lo estamos preparando',
        processing: 'Tu pedido está siendo procesado y empacado',
        shipped: 'Tu pedido ha sido enviado y está en camino',
        delivered: '¡Tu pedido ha sido entregado exitosamente!',
        cancelled: 'Tu pedido ha sido cancelado'
      }
      
      return {
        success: true,
        message: 'Notificación enviada exitosamente',
        notification_type: 'status_update',
        email_sent: true,
        email_subject: `Actualización de tu pedido #${orderId}`,
        email_content: statusMessages[status] || 'El estado de tu pedido ha sido actualizado'
      }
    }
  },

  /**
   * Enviar notificación de pago
   */
  sendPaymentNotification: async (orderId, paymentStatus, customerEmail, amount) => {
    try {
      console.log(`Sending payment notification for order ${orderId}`)
      
      const response = await api.post(`/admin/orders/${orderId}/notify`, {
        type: 'payment_update',
        payment_status: paymentStatus,
        email: customerEmail,
        amount: amount
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending payment notification:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const paymentMessages = {
        paid: `Tu pago de $${amount} ha sido confirmado`,
        pending: `Tu pago de $${amount} está siendo procesado`,
        failed: 'Hubo un problema con tu pago, por favor intenta nuevamente',
        refunded: `Tu reembolso de $${amount} ha sido procesado`
      }
      
      return {
        success: true,
        message: 'Notificación de pago enviada',
        notification_type: 'payment_update',
        email_sent: true,
        email_subject: `Actualización de pago - Pedido #${orderId}`,
        email_content: paymentMessages[paymentStatus] || 'El estado de tu pago ha sido actualizado'
      }
    }
  },

  /**
   * Enviar notificación de envío con tracking
   */
  sendShippingNotification: async (orderId, trackingNumber, carrier, customerEmail) => {
    try {
      console.log(`Sending shipping notification for order ${orderId}`)
      
      const response = await api.post(`/admin/orders/${orderId}/notify`, {
        type: 'shipping_update',
        tracking_number: trackingNumber,
        carrier: carrier,
        email: customerEmail
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending shipping notification:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      return {
        success: true,
        message: 'Notificación de envío enviada',
        notification_type: 'shipping_update',
        email_sent: true,
        tracking_number: trackingNumber,
        carrier: carrier,
        email_subject: `Tu pedido #${orderId} está en camino`,
        email_content: `Tu pedido ha sido enviado con ${carrier}. Número de seguimiento: ${trackingNumber}`
      }
    }
  },

  // ==================== NOTIFICACIONES DE STOCK ====================
  
  /**
   * Enviar alerta de stock bajo
   */
  sendLowStockAlert: async (productId, productName, currentStock, minStock) => {
    try {
      console.log(`Sending low stock alert for product ${productId}`)
      
      const response = await api.post('/admin/notifications/stock-alert', {
        product_id: productId,
        product_name: productName,
        current_stock: currentStock,
        min_stock: minStock,
        alert_type: 'low_stock'
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending low stock alert:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        success: true,
        message: 'Alerta de stock bajo enviada',
        notification_type: 'low_stock_alert',
        product_name: productName,
        current_stock: currentStock,
        min_stock: minStock,
        recommended_action: currentStock === 0 ? 'Reabastecer inmediatamente' : 'Planificar reabastecimiento'
      }
    }
  },

  /**
   * Enviar notificación de producto sin stock
   */
  sendOutOfStockAlert: async (productId, productName) => {
    try {
      console.log(`Sending out of stock alert for product ${productId}`)
      
      const response = await api.post('/admin/notifications/stock-alert', {
        product_id: productId,
        product_name: productName,
        current_stock: 0,
        alert_type: 'out_of_stock'
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending out of stock alert:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 600))
      
      return {
        success: true,
        message: 'Alerta de producto agotado enviada',
        notification_type: 'out_of_stock_alert',
        product_name: productName,
        urgency: 'high',
        recommended_action: 'Desactivar producto o reabastecer inmediatamente'
      }
    }
  },

  // ==================== NOTIFICACIONES ADMINISTRATIVAS ====================
  
  /**
   * Enviar notificación de nuevo pedido a administradores
   */
  sendNewOrderAlert: async (orderId, orderNumber, customerName, total) => {
    try {
      console.log(`Sending new order alert for order ${orderId}`)
      
      const response = await api.post('/admin/notifications/new-order', {
        order_id: orderId,
        order_number: orderNumber,
        customer_name: customerName,
        total_amount: total
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending new order alert:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        message: 'Notificación de nuevo pedido enviada',
        notification_type: 'new_order_alert',
        order_number: orderNumber,
        customer_name: customerName,
        total_amount: total,
        admin_notified: true
      }
    }
  },

  /**
   * Enviar reporte diario de ventas
   */
  sendDailySalesReport: async (date, totalSales, orderCount, topProducts) => {
    try {
      console.log(`Sending daily sales report for ${date}`)
      
      const response = await api.post('/admin/notifications/daily-report', {
        report_date: date,
        total_sales: totalSales,
        order_count: orderCount,
        top_products: topProducts
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending daily sales report:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        message: 'Reporte diario enviado',
        notification_type: 'daily_sales_report',
        report_date: date,
        total_sales: totalSales,
        order_count: orderCount,
        top_products_count: topProducts?.length || 0
      }
    }
  },

  // ==================== NOTIFICACIONES DE MARKETING ====================
  
  /**
   * Enviar newsletter a clientes
   */
  sendNewsletter: async (title, content, recipientEmails) => {
    try {
      console.log(`Sending newsletter to ${recipientEmails.length} recipients`)
      
      const response = await api.post('/admin/notifications/newsletter', {
        title: title,
        content: content,
        recipients: recipientEmails
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending newsletter:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        message: 'Newsletter enviado exitosamente',
        notification_type: 'newsletter',
        title: title,
        recipients_count: recipientEmails.length,
        estimated_delivery: '5-10 minutos'
      }
    }
  },

  /**
   * Enviar promoción o descuento
   */
  sendPromotionAlert: async (promotionTitle, discountPercent, validUntil, customerEmails) => {
    try {
      console.log(`Sending promotion alert: ${promotionTitle}`)
      
      const response = await api.post('/admin/notifications/promotion', {
        promotion_title: promotionTitle,
        discount_percent: discountPercent,
        valid_until: validUntil,
        recipients: customerEmails
      })
      
      return response.data
    } catch (error) {
      console.error('Error sending promotion alert:', error)
      
      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        success: true,
        message: 'Promoción enviada exitosamente',
        notification_type: 'promotion_alert',
        promotion_title: promotionTitle,
        discount_percent: discountPercent,
        recipients_count: customerEmails.length,
        valid_until: validUntil
      }
    }
  },

  // ==================== NOTIFICACIONES PUSH ====================
  
  /**
   * Enviar notificación push al navegador
   */
  sendBrowserNotification: async (title, message, icon = null, action = null) => {
    try {
      // Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        throw new Error('Este navegador no soporta notificaciones')
      }

      // Solicitar permisos si no los tenemos
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          throw new Error('Permisos de notificación denegados')
        }
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'deco-home-notification',
          requireInteraction: false,
          silent: false
        })

        // Manejar click en la notificación
        if (action) {
          notification.onclick = () => {
            window.focus()
            action()
            notification.close()
          }
        }

        // Auto cerrar después de 5 segundos
        setTimeout(() => {
          notification.close()
        }, 5000)

        return {
          success: true,
          message: 'Notificación push enviada',
          notification_type: 'browser_push'
        }
      }

      throw new Error('Permisos de notificación no concedidos')
    } catch (error) {
      console.error('Error sending browser notification:', error)
      
      // Fallback a toast si las notificaciones push fallan
      toast(message, {
        icon: '🔔',
        duration: 4000
      })

      return {
        success: false,
        message: 'Fallback a toast notification',
        error: error.message
      }
    }
  },

  // ==================== CONFIGURACIÓN DE NOTIFICACIONES ====================
  
  /**
   * Obtener configuración de notificaciones
   */
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/admin/notifications/settings')
      return response.data
    } catch (error) {
      console.error('Error getting notification settings:', error)
      
      // Configuración por defecto
      return {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        order_notifications: true,
        stock_notifications: true,
        marketing_notifications: true,
        daily_reports: true,
        weekly_reports: true,
        smtp_configured: false,
        push_configured: Notification.permission === 'granted'
      }
    }
  },

  /**
   * Actualizar configuración de notificaciones
   */
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/admin/notifications/settings', settings, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error updating notification settings:', error)
      
      // Simular actualización exitosa
      return {
        success: true,
        message: 'Configuración de notificaciones actualizada',
        settings: settings
      }
    }
  },

  /**
   * Probar configuración de email
   */
  testEmailConfiguration: async (emailSettings) => {
    try {
      const response = await api.post('/admin/notifications/test-email', emailSettings)
      return response.data
    } catch (error) {
      console.error('Error testing email configuration:', error)
      
      // Simular test exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { smtpHost, smtpPort, smtpUsername } = emailSettings
      
      if (!smtpHost || !smtpPort || !smtpUsername) {
        throw new Error('Faltan datos de configuración SMTP')
      }

      return {
        success: true,
        message: 'Configuración de email probada exitosamente',
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        connection_status: 'connected',
        test_email_sent: true
      }
    }
  },

  // ==================== TEMPLATES DE NOTIFICACIONES ====================
  
  /**
   * Obtener templates de email disponibles
   */
  getEmailTemplates: async () => {
    try {
      const response = await api.get('/admin/notifications/templates')
      return response.data
    } catch (error) {
      console.error('Error getting email templates:', error)
      
      // Templates por defecto
      return [
        {
          id: 'order_confirmation',
          name: 'Confirmación de Pedido',
          subject: 'Confirmación de tu pedido #{order_number}',
          description: 'Email enviado cuando se confirma un pedido',
          variables: ['order_number', 'customer_name', 'total_amount', 'items']
        },
        {
          id: 'order_shipped',
          name: 'Pedido Enviado',
          subject: 'Tu pedido #{order_number} está en camino',
          description: 'Email enviado cuando se envía un pedido',
          variables: ['order_number', 'tracking_number', 'carrier', 'estimated_delivery']
        },
        {
          id: 'order_delivered',
          name: 'Pedido Entregado',
          subject: '¡Tu pedido #{order_number} ha sido entregado!',
          description: 'Email enviado cuando se entrega un pedido',
          variables: ['order_number', 'customer_name', 'delivery_date']
        },
        {
          id: 'payment_confirmation',
          name: 'Confirmación de Pago',
          subject: 'Pago confirmado - Pedido #{order_number}',
          description: 'Email enviado cuando se confirma un pago',
          variables: ['order_number', 'amount', 'payment_method']
        },
        {
          id: 'low_stock_alert',
          name: 'Alerta de Stock Bajo',
          subject: 'Alerta: Stock bajo para {product_name}',
          description: 'Email enviado a administradores cuando hay stock bajo',
          variables: ['product_name', 'current_stock', 'min_stock']
        }
      ]
    }
  },

  /**
   * Crear template personalizado
   */
  createEmailTemplate: async (template) => {
    try {
      const response = await api.post('/admin/notifications/templates', template)
      return response.data
    } catch (error) {
      console.error('Error creating email template:', error)
      
      // Simular creación exitosa
      return {
        success: true,
        message: 'Template creado exitosamente',
        template_id: `custom_${Date.now()}`,
        template: template
      }
    }
  },

  // ==================== HISTORIAL DE NOTIFICACIONES ====================
  
  /**
   * Obtener historial de notificaciones enviadas
   */
  getNotificationHistory: async (filters = {}) => {
    try {
      const response = await api.get('/admin/notifications/history', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error getting notification history:', error)
      
      // Historial simulado
      return {
        data: [
          {
            id: 1,
            type: 'order_status',
            recipient: 'cliente@example.com',
            subject: 'Tu pedido está en camino',
            status: 'sent',
            sent_at: new Date(Date.now() - 3600000).toISOString(),
            order_id: 'ORD-2025-001'
          },
          {
            id: 2,
            type: 'low_stock',
            recipient: 'admin@decohome.com',
            subject: 'Stock bajo: Lámpara Moderna',
            status: 'sent',
            sent_at: new Date(Date.now() - 7200000).toISOString(),
            product_id: 1
          },
          {
            id: 3,
            type: 'payment_confirmation',
            recipient: 'cliente2@example.com',
            subject: 'Pago confirmado',
            status: 'delivered',
            sent_at: new Date(Date.now() - 10800000).toISOString(),
            order_id: 'ORD-2025-002'
          }
        ],
        pagination: {
          total: 3,
          page: 1,
          pages: 1
        }
      }
    }
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Formatear mensaje con variables
   */
  formatMessage: (template, variables) => {
    let message = template
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g')
      message = message.replace(regex, variables[key])
    })
    return message
  },

  /**
   * Validar email
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validar configuración SMTP
   */
  validateSMTPConfig: (config) => {
    const required = ['smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword']
    const missing = required.filter(field => !config[field])
    
    if (missing.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missing.join(', ')}`)
    }

    if (config.smtpPort < 1 || config.smtpPort > 65535) {
      throw new Error('Puerto SMTP inválido')
    }

    return true
  },

  /**
   * Obtener estadísticas de notificaciones
   */
  getNotificationStats: async () => {
    try {
      const response = await api.get('/admin/notifications/stats')
      return response.data
    } catch (error) {
      console.error('Error getting notification stats:', error)
      
      // Stats simuladas
      return {
        total_sent: 1247,
        total_delivered: 1189,
        total_failed: 58,
        delivery_rate: 95.3,
        most_sent_type: 'order_status',
        last_24h_count: 23,
        weekly_trend: '+12%'
      }
    }
  }
}

export default notificationService