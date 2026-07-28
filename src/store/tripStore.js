import { create } from 'zustand'
import { tripService } from '../services/tripService'

export const useTripStore = create((set, get) => ({
  trips: [],
  upcomingTrips: [],
  currentTrip: null,
  otpCode: '',
  otpInput: '',
  otpError: '',
  startOdometer: '',
  endOdometer: '',
  paymentMethod: 'CASH',
  isLoadingTrip: false,
  tripError: null,

  setAssignedTrip: (req) => {
    set({
      currentTrip: {
        ...req,
        assignmentId: req.assignmentId || req.id,
        bookingId: req.bookingId,
        bookingNumber: req.bookingNumber,
        status: req.status || 'assigned',
        otpCode: req.otpCode || '',
        pickup: req.pickup,
        drop: req.drop,
        fare: req.fare || 0,
        customerName: req.customerName,
        customerPhone: req.customerPhone
      },
      otpInput: '',
      otpError: '',
      startOdometer: '',
      endOdometer: '',
      paymentMethod: 'CASH'
    })
  },

  /**
   * Step 1: Confirm Arrival at Pickup Point
   */
  arriveAtPickup: async () => {
    const { currentTrip } = get()
    if (!currentTrip) return

    set({ isLoadingTrip: true, tripError: null })
    const assignmentId = currentTrip.assignmentId || currentTrip.id

    try {
      const res = await tripService.arriveAtPickup(assignmentId)
      if (res?.success) {
        set({
          currentTrip: {
            ...currentTrip,
            status: 'arrived',
            otpCode: res.data?.otp || currentTrip.otpCode,
            arrivedAt: res.data?.arrived_at
          },
          isLoadingTrip: false
        })
        return res.data
      }
      set({ isLoadingTrip: false, tripError: res?.message || 'Failed to confirm arrival' })
    } catch (err) {
      set({ isLoadingTrip: false, tripError: err?.message || 'Error confirming arrival' })
      throw err
    }
  },

  setOtpInput: (val) => set({ otpInput: val, otpError: '' }),
  setStartOdometer: (val) => set({ startOdometer: val }),
  setEndOdometer: (val) => set({ endOdometer: val }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  /**
   * Step 2: Verify Guest OTP & Record Start Odometer
   */
  verifyOtp: async (startOdometerValue) => {
    const { currentTrip, otpInput } = get()
    if (!currentTrip) return false

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    const startOdo = startOdometerValue || get().startOdometer

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.verifyOtp(assignmentId, {
        otp: otpInput,
        start_odometer: Number(startOdo)
      })

      if (res?.success) {
        set({
          currentTrip: {
            ...currentTrip,
            status: 'otp_verified',
            startOdometer: startOdo,
            startedAt: res.data?.started_at
          },
          otpError: '',
          isLoadingTrip: false
        })
        return true
      }
      set({ otpError: res?.message || 'Invalid OTP code.', isLoadingTrip: false })
      return false
    } catch (err) {
      set({ otpError: err?.message || 'OTP verification failed.', isLoadingTrip: false })
      return false
    }
  },

  startTrip: () => {
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, status: 'active' } : null
    }))
  },

  /**
   * Step 3: End Trip (Record Final Odometer Reading)
   */
  endTrip: async (endOdometerValue) => {
    const { currentTrip } = get()
    if (!currentTrip) return

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    const endOdo = endOdometerValue || get().endOdometer

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.endTrip(assignmentId, {
        end_odometer: Number(endOdo)
      })

      if (res?.success) {
        set({
          currentTrip: {
            ...currentTrip,
            status: 'payment_pending',
            endOdometer: endOdo,
            totalDistanceKm: res.data?.total_distance_km
          },
          isLoadingTrip: false
        })
        return res.data
      }
      set({ isLoadingTrip: false, tripError: res?.message || 'Failed to end trip' })
    } catch (err) {
      set({ isLoadingTrip: false, tripError: err?.message || 'Error ending trip' })
      throw err
    }
  },

  arriveAtDropoff: () => {
    get().endTrip()
  },

  /**
   * Step 4: Collect Payment (Cash or Online Gateway)
   */
  collectPayment: async (amount, method) => {
    const { currentTrip, paymentMethod } = get()
    if (!currentTrip) return

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    const payMethod = method || paymentMethod || 'CASH'
    const payAmount = amount || currentTrip.fare

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.collectPayment(assignmentId, {
        amount: Number(payAmount),
        payment_method: payMethod
      })
      set({ isLoadingTrip: false })
      return res?.data
    } catch (err) {
      set({ isLoadingTrip: false, tripError: err?.message || 'Payment collection failed' })
      throw err
    }
  },

  /**
   * Step 5: Complete Trip Assignment
   */
  completeTrip: async () => {
    const { currentTrip, paymentMethod, startOdometer, endOdometer } = get()
    if (!currentTrip) return

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    set({ isLoadingTrip: true, tripError: null })

    try {
      await tripService.collectPayment(assignmentId, {
        amount: Number(currentTrip.fare || 0),
        payment_method: paymentMethod || 'CASH'
      })
      const res = await tripService.completeTrip(assignmentId)
      
      const completedTrip = {
        id: assignmentId,
        bookingId: currentTrip.bookingId,
        bookingNumber: currentTrip.bookingNumber,
        pickup: currentTrip.pickup,
        drop: currentTrip.drop,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        fare: currentTrip.fare,
        status: 'completed',
        paymentMethod: paymentMethod || 'CASH',
        customerName: currentTrip.customerName,
        startOdometer: startOdometer,
        endOdometer: endOdometer
      }

      set((state) => ({
        trips: [completedTrip, ...state.trips],
        currentTrip: { ...currentTrip, status: 'completed' },
        isLoadingTrip: false
      }))
      return res?.data
    } catch (err) {
      set({ isLoadingTrip: false, tripError: err?.message || 'Failed to complete trip' })
      throw err
    }
  },

  /**
   * Fetch Trip History & Scheduled Trips from Backend API
   */
  fetchTripsHistory: async () => {
    set({ isLoadingTrip: true, tripError: null })
    try {
      const historyRes = await tripService.getTrips({ history: true, upcoming: false })
      if (historyRes?.success && Array.isArray(historyRes.data)) {
        const mappedTrips = historyRes.data.map(item => ({
          id: item.id,
          bookingId: item.booking_id,
          bookingNumber: item.booking?.booking_number,
          pickup: item.booking?.pickup_location || item.pickup,
          drop: item.booking?.drop_location || item.drop,
          date: item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Today',
          fare: item.booking?.total_amount || 0,
          status: item.status?.toLowerCase() || 'completed',
          customerName: item.booking?.lead_traveler_name || 'Guest'
        }))
        set({ trips: mappedTrips })
      }
    } catch (err) {
      set({ tripError: err?.message })
    }

    try {
      const upcomingRes = await tripService.getTrips({ history: false, upcoming: true })
      if (upcomingRes?.success && Array.isArray(upcomingRes.data)) {
        const mappedUpcoming = upcomingRes.data.map(item => ({
          id: item.id,
          pickup: item.booking?.pickup_location,
          drop: item.booking?.drop_location,
          date: item.booking?.pickup_date,
          time: item.booking?.pickup_time,
          fare: item.booking?.total_amount,
          customerName: item.booking?.lead_traveler_name,
          customerPhone: item.booking?.lead_traveler_phone
        }))
        set({ upcomingTrips: mappedUpcoming })
      }
    } catch (err) {
      console.warn('Upcoming trips fetch error:', err)
    }

    set({ isLoadingTrip: false })
  },

  /**
   * Fetch Detailed Assignment Data
   */
  fetchTripDetails: async (assignmentId) => {
    set({ isLoadingTrip: true, tripError: null })
    try {
      const res = await tripService.getTripDetails(assignmentId)
      if (res?.success && res.data) {
        const item = res.data
        const mappedTrip = {
          assignmentId: item.id,
          bookingId: item.booking_id,
          status: item.status,
          startOdometer: item.start_odometer,
          endOdometer: item.end_odometer,
          pickup: item.booking?.pickup_location,
          drop: item.booking?.drop_location,
          fare: item.booking?.total_amount,
          customerName: item.booking?.lead_traveler_name,
          customerPhone: item.booking?.lead_traveler_phone,
          bookingNumber: item.booking?.booking_number
        }
        set({ currentTrip: mappedTrip, isLoadingTrip: false })
        return item
      }
    } catch (err) {
      set({ isLoadingTrip: false, tripError: err?.message })
    }
    set({ isLoadingTrip: false })
    return null
  },

  clearCurrentTrip: () => set({ currentTrip: null }),

  cancelTrip: () => set({ currentTrip: null })
}))
