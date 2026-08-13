import api from './api'

export const AvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  OFFLINE: 'OFFLINE',
  ON_LEAVE: 'ON_LEAVE',
  TEMP_UNAVAILABLE: 'TEMP_UNAVAILABLE',
  ON_TRIP: 'ON_TRIP'
}

export const driverService = {
  /**
   * Toggle Duty Status
   * PATCH /api/v1/driver/me/status
   * @param {string} availability_status
   */
  async updateStatus(availability_status) {
    return await api.patch('/driver/me/status', { availability_status })
  },

  /**
   * Background GPS Location Ping
   * PATCH /api/v1/driver/me/location
   * @param {number} lat 
   * @param {number} lng 
   */
  async updateLocation(lat, lng) {
    return await api.patch('/driver/me/location', { lat, lng })
  },

  /**
   * Fetch Pending Dispatch Requests
   * GET /api/v1/driver/me/requests
   */
  async getPendingRequests() {
    return await api.get('/driver/me/requests')
  },

  /**
   * Accept or Reject Dispatch Request
   * POST /api/v1/driver/me/requests/{request_id}/respond?accept=true|false
   * @param {string} requestId
   * @param {boolean} accept
   */
  async respondToRequest(requestId, accept) {
    return await api.post(`/driver/me/requests/${requestId}/respond?accept=${Boolean(accept)}`)
  },

  /**
   * Fetch Wallet Summary (outstanding amount owed to admin)
   * GET /api/v1/driver/me/wallet/summary
   */
  async getWalletSummary() {
    return await api.get('/driver/me/wallet/summary')
  },

  /**
   * Fetch Outstanding / Payment-Submitted Bookings
   * GET /api/v1/driver/me/wallet/bookings
   */
  async getWalletBookings() {
    return await api.get('/driver/me/wallet/bookings')
  },

  /**
   * Fetch Full Wallet Settlement History
   * GET /api/v1/driver/me/wallet/history
   */
  async getWalletHistory() {
    return await api.get('/driver/me/wallet/history')
  },

  /**
   * Submit Payment for a Booking (sent for admin verification)
   * POST /api/v1/driver/me/wallet/bookings/{booking_id}/pay
   * @param {string} bookingId
   * @param {string} paymentMethod - "CASH" | "ONLINE"
   * @param {string} [remarks]
   */
  async payWalletBooking(bookingId, paymentMethod, remarks) {
    return await api.post(`/driver/me/wallet/bookings/${bookingId}/pay`, {
      payment_method: paymentMethod,
      remarks: remarks || undefined
    })
  }
}

export default driverService
