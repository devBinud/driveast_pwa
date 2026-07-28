import api from './api'

export const TripAssignmentStatus = {
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  ARRIVED: 'DRIVER_ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED'
}

export const tripService = {
  /**
   * Step 1: Confirm Arrival at Pickup Point
   * POST /api/v1/driver/me/trips/{assignment_id}/arrive
   */
  async arriveAtPickup(assignmentId) {
    return await api.post(`/driver/me/trips/${assignmentId}/arrive`)
  },

  /**
   * Step 2: Verify Guest OTP & Record Start Odometer
   * POST /api/v1/driver/me/trips/{assignment_id}/verify-otp
   * @param {string} assignmentId 
   * @param {Object} data { otp, start_odometer, start_odometer_image_url }
   */
  async verifyOtp(assignmentId, { otp, start_odometer, start_odometer_image_url }) {
    return await api.post(`/driver/me/trips/${assignmentId}/verify-otp`, {
      otp,
      start_odometer: Number(start_odometer),
      start_odometer_image_url: start_odometer_image_url || undefined
    })
  },

  /**
   * Step 3: End Trip (Record Final Odometer Reading)
   * POST /api/v1/driver/me/trips/{assignment_id}/end-trip
   * @param {string} assignmentId 
   * @param {Object} data { end_odometer, end_odometer_image_url }
   */
  async endTrip(assignmentId, { end_odometer, end_odometer_image_url }) {
    return await api.post(`/driver/me/trips/${assignmentId}/end-trip`, {
      end_odometer: Number(end_odometer),
      end_odometer_image_url: end_odometer_image_url || undefined
    })
  },

  /**
   * Step 4: Collect Payment (Cash or Online)
   * POST /api/v1/driver/me/trips/{assignment_id}/collect-payment
   * @param {string} assignmentId 
   * @param {Object} data { amount, payment_method } ("CASH" | "ONLINE")
   */
  async collectPayment(assignmentId, { amount, payment_method }) {
    return await api.post(`/driver/me/trips/${assignmentId}/collect-payment`, {
      amount: Number(amount),
      payment_method
    })
  },

  /**
   * Step 5: Complete Trip Assignment
   * POST /api/v1/driver/me/trips/{assignment_id}/complete
   */
  async completeTrip(assignmentId) {
    return await api.post(`/driver/me/trips/${assignmentId}/complete`)
  },

  /**
   * Fetch Detailed Assignment & Itinerary Data
   * GET /api/v1/driver/me/trips/{assignment_id}
   */
  async getTripDetails(assignmentId) {
    return await api.get(`/driver/me/trips/${assignmentId}`)
  },

  /**
   * Fetch Trip History & Scheduled Trips
   * GET /api/v1/driver/me/trips?history=true|false&upcoming=true
   */
  async getTrips({ history = true, upcoming = false } = {}) {
    const params = new URLSearchParams()
    if (history !== undefined) params.append('history', String(history))
    if (upcoming !== undefined) params.append('upcoming', String(upcoming))
    return await api.get(`/driver/me/trips?${params.toString()}`)
  }
}

export default tripService
