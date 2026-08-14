import { create } from 'zustand'
import toast from 'react-hot-toast'
import { tripService } from '../services/tripService'
import { websocketService } from '../services/websocketService'

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
  verifyOtp: async (startOdometerValue, startOdometerImageUrl) => {
    const { currentTrip, otpInput } = get()
    if (!currentTrip) return false

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    const startOdo = startOdometerValue || get().startOdometer

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.verifyOtp(assignmentId, {
        otp: otpInput,
        start_odometer: Number(startOdo),
        start_odometer_image_url: startOdometerImageUrl
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
  endTrip: async (endOdometerValue, endOdometerImageUrl) => {
    const { currentTrip } = get()
    if (!currentTrip) return

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    const endOdo = endOdometerValue || get().endOdometer

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.endTrip(assignmentId, {
        end_odometer: Number(endOdo),
        end_odometer_image_url: endOdometerImageUrl
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
        const mappedTrips = historyRes.data.map(item => {
          const timestamp = item.completed_at || item.assigned_at || item.arrived_at || item.created_at
          const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'
          const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          const dist = item.total_distance_km ? `${item.total_distance_km} km` : (item.start_odometer && item.end_odometer ? `${item.end_odometer - item.start_odometer} km` : null)
          const displayId = item.booking?.booking_number || (item.booking_id ? `BK-${item.booking_id.slice(0, 8).toUpperCase()}` : `BK-${item.id?.slice(0, 8).toUpperCase()}`)

          return {
            id: displayId,
            assignmentId: item.id,
            bookingId: item.booking_id,
            bookingNumber: item.booking?.booking_number,
            pickup: item.booking?.pickup_location || item.pickup || '',
            drop: item.booking?.drop_location || item.drop || '',
            date: formattedDate,
            time: formattedTime,
            distance: dist,
            duration: (item.completed_at && item.started_at) ? `${Math.round((new Date(item.completed_at) - new Date(item.started_at)) / 60000)} mins` : null,
            fare: item.booking?.total_amount || 0,
            status: item.status?.toLowerCase() || 'completed',
            paymentMethod: item.payment_method || item.booking?.payment_method || 'CASH',
            customerName: item.booking?.lead_traveler_name || 'Guest'
          }
        })
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

  cancelTrip: () => set({ currentTrip: null }),

  /**
   * Listens for a guest cancelling the booking mid-assignment (already accepted/en route).
   * The WhatsApp message tells the driver too, but without this the app itself would keep
   * showing an assigned/active trip for a ride that no longer exists.
   */
  initWebSocketListeners: () => {
    const unbindCancelled = websocketService.on('trip_cancelled', (data) => {
      const { currentTrip } = get()
      if (!currentTrip) return
      if (currentTrip.bookingId === data.booking_id || currentTrip.id === data.booking_id) {
        set({ currentTrip: null })
        toast.error('This booking was cancelled by the guest.')
      }
    })

    return () => {
      unbindCancelled()
    }
  }
}))
