import api from './api'

export const adminService = {
  /**
   * List All Bookings (Filtered)
   * GET /api/v1/bookings
   */
  async listBookings(params = {}) {
    return await api.get('/bookings', { params })
  },

  /**
   * Manually Assign Driver to Booking
   * POST /api/v1/bookings/{booking_id}/assign-driver
   */
  async assignDriver(bookingId, { driver_id, vehicle_id }) {
    return await api.post(`/bookings/${bookingId}/assign-driver`, { driver_id, vehicle_id })
  },

  /**
   * Deassign Driver from Booking
   * POST /api/v1/bookings/{booking_id}/deassign-driver
   */
  async deassignDriver(bookingId) {
    return await api.post(`/bookings/${bookingId}/deassign-driver`)
  },

  /**
   * Fetch All Drivers with Coordinates
   * GET /api/v1/drivers
   */
  async listFleetDrivers() {
    return await api.get('/drivers')
  },

  /**
   * List Active WhatsApp Chat Threads
   * GET /api/v1/whatsapp/chats
   */
  async listWhatsAppChats(limit = 50) {
    return await api.get(`/whatsapp/chats?limit=${limit}`)
  },

  /**
   * Get Customer Chat History
   * GET /api/v1/whatsapp/chats/{phone}/messages
   */
  async getWhatsAppMessages(phone, limit = 50) {
    return await api.get(`/whatsapp/chats/${phone}/messages?limit=${limit}`)
  },

  /**
   * Send Manual WhatsApp Message
   * POST /api/v1/whatsapp/send
   */
  async sendWhatsAppMessage({ to, message }) {
    return await api.post('/whatsapp/send', { to, message })
  },

  /**
   * Fetch System Settings
   * GET /api/v1/settings
   */
  async getSettings() {
    return await api.get('/settings')
  },

  /**
   * Upsert Admin WhatsApp Number
   * PUT /api/v1/settings/admin_whatsapp_number
   */
  async updateAdminWhatsAppNumber(value) {
    return await api.put('/settings/admin_whatsapp_number', { value })
  }
}

export default adminService
