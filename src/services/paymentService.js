import api from './api'

export const paymentService = {
  /**
   * Generate a real, single-use Razorpay UPI QR code for the remaining trip
   * balance. The amount is computed server-side from the booking's actual
   * total minus whatever the guest already paid online — never sent by the
   * client.
   * POST /api/v1/payments/razorpay/qr
   * @param {string} bookingId
   * @param {string} assignmentId
   */
  async createQR(bookingId, assignmentId) {
    return await api.post('/payments/razorpay/qr', {
      booking_id: bookingId,
      assignment_id: assignmentId
    })
  },

  /**
   * Poll target while the QR is on screen. Flips to SUCCESS only once
   * Razorpay's qr_code.credited webhook has confirmed the payment server-side
   * -- this never trusts the client into believing a scan succeeded.
   * GET /api/v1/payments/razorpay/qr/{qr_code_id}/status
   * @param {string} qrCodeId
   */
  async getQRStatus(qrCodeId) {
    return await api.get(`/payments/razorpay/qr/${qrCodeId}/status`)
  }
}

export default paymentService
