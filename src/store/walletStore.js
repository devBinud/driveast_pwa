import { create } from 'zustand'
import { driverService } from '../services/driverService'

const PAGE_SIZE = 20

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
  outstandingHasMore: false,
  isLoadingMoreOutstanding: false,
  history: [],
  historyHasMore: false,
  isLoadingMoreHistory: false,
  isLoading: false,
  isPaying: false,
  error: null,

  // See tripStore's resetTripState -- without this, a second driver logging in
  // on the same device/session would briefly see the previous driver's
  // outstanding balance and settlement history until the next fetch overwrites it.
  resetWallet: () => set({
    summary: {
      outstandingAmount: 0,
      outstandingBookingsCount: 0,
      lastSettlementDate: null
    },
    outstandingBookings: [],
    outstandingHasMore: false,
    isLoadingMoreOutstanding: false,
    history: [],
    historyHasMore: false,
    isLoadingMoreHistory: false,
    isLoading: false,
    isPaying: false,
    error: null
  }),

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

  // Always fetches page 1 and replaces the list -- used on initial load and
  // after any action that changes the underlying data (paying a booking).
  fetchOutstandingBookings: async () => {
    try {
      const res = await driverService.getWalletBookings({ limit: PAGE_SIZE, offset: 0 })
      if (res?.success && Array.isArray(res.data)) {
        set({
          outstandingBookings: res.data.map(mapWalletItem),
          // A full page back means there's likely another one -- confirmed or
          // corrected the moment the driver actually asks for it via Load More.
          outstandingHasMore: res.data.length === PAGE_SIZE
        })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load outstanding bookings' })
    }
  },

  // Appends the next page. Offset is the current list length, not a tracked
  // page counter -- simpler, and self-correcting if fetchOutstandingBookings
  // ever resets the list out from under it.
  loadMoreOutstanding: async () => {
    const { outstandingBookings, outstandingHasMore, isLoadingMoreOutstanding } = get()
    if (!outstandingHasMore || isLoadingMoreOutstanding) return
    set({ isLoadingMoreOutstanding: true })
    try {
      const res = await driverService.getWalletBookings({ limit: PAGE_SIZE, offset: outstandingBookings.length })
      if (res?.success && Array.isArray(res.data)) {
        set({
          outstandingBookings: [...outstandingBookings, ...res.data.map(mapWalletItem)],
          outstandingHasMore: res.data.length === PAGE_SIZE
        })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load more outstanding bookings' })
    } finally {
      set({ isLoadingMoreOutstanding: false })
    }
  },

  fetchHistory: async () => {
    try {
      const res = await driverService.getWalletHistory({ limit: PAGE_SIZE, offset: 0 })
      if (res?.success && Array.isArray(res.data)) {
        set({
          history: res.data.map(mapWalletItem),
          historyHasMore: res.data.length === PAGE_SIZE
        })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load wallet history' })
    }
  },

  loadMoreHistory: async () => {
    const { history, historyHasMore, isLoadingMoreHistory } = get()
    if (!historyHasMore || isLoadingMoreHistory) return
    set({ isLoadingMoreHistory: true })
    try {
      const res = await driverService.getWalletHistory({ limit: PAGE_SIZE, offset: history.length })
      if (res?.success && Array.isArray(res.data)) {
        set({
          history: [...history, ...res.data.map(mapWalletItem)],
          historyHasMore: res.data.length === PAGE_SIZE
        })
      }
    } catch (err) {
      set({ error: err?.message || 'Failed to load more wallet history' })
    } finally {
      set({ isLoadingMoreHistory: false })
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
