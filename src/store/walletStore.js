import { create } from 'zustand'
import { driverService } from '../services/driverService'

const mapWalletItem = (item) => ({
  id: item.id,
  bookingNumber: item.booking_number,
  customerName: item.lead_traveler_name,
  pickup: item.pickup_location,
  drop: item.drop_location,
  completedAt: item.completed_at,
  cashCollected: Number(item.cash_collected_amount) || 0,
  status: item.settlement_status,
  paymentMethod: item.payment_method,
  transactionReference: item.transaction_reference,
  submittedAt: item.submitted_at,
  remarks: item.remarks
})

export const useWalletStore = create((set, get) => ({
  summary: {
    outstandingAmount: 0,
    outstandingBookingsCount: 0,
    lastSettlementDate: null
  },
  outstandingBookings: [],
  history: [],
  isLoading: false,
  isPaying: false,
  error: null,

  fetchSummary: async () => {
    try {
      const res = await driverService.getWalletSummary()
      if (res?.success && res.data) {
        set({
          summary: {
            outstandingAmount: Number(res.data.outstanding_amount) || 0,
            outstandingBookingsCount: res.data.outstanding_bookings_count || 0,
            lastSettlementDate: res.data.last_settlement_date || null
          }
        })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load wallet summary' })
    }
  },

  fetchOutstandingBookings: async () => {
    try {
      const res = await driverService.getWalletBookings()
      if (res?.success && Array.isArray(res.data)) {
        set({ outstandingBookings: res.data.map(mapWalletItem) })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load outstanding bookings' })
    }
  },

  fetchHistory: async () => {
    try {
      const res = await driverService.getWalletHistory()
      if (res?.success && Array.isArray(res.data)) {
        set({ history: res.data.map(mapWalletItem) })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load wallet history' })
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null })
    await Promise.all([
      get().fetchSummary(),
      get().fetchOutstandingBookings(),
      get().fetchHistory()
    ])
    set({ isLoading: false })
  },

  /**
   * Submits payment for a single outstanding booking, then refreshes wallet state
   * from the server so the summary/list/history all stay consistent.
   */
  payBooking: async (bookingId, paymentMethod, remarks = '') => {
    set({ isPaying: true, error: null })
    try {
      const res = await driverService.payWalletBooking(bookingId, paymentMethod, remarks)
      await Promise.all([
        get().fetchSummary(),
        get().fetchOutstandingBookings(),
        get().fetchHistory()
      ])
      set({ isPaying: false })
      return res
    } catch (err) {
      set({ isPaying: false, error: err?.message || 'Failed to submit payment' })
      throw err
    }
  }
}))

export default useWalletStore
