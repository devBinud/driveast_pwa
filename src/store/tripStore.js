import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { tripService } from '../services/tripService'
import { websocketService } from '../services/websocketService'

// Real driving duration in minutes -> a readable string. Backend already excludes
// estimated_distance_km/estimated_duration_min entirely when a booking was never
// actually geocoded, so callers only ever see this for real routes.
const formatDurationMin = (mins) => {
  if (mins == null) return null
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const useTripStore = create(
  persist(
    (set, get) => ({
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
      hasHydrated: false,

  setHasHydrated: (val) => set({ hasHydrated: val }),

  setAssignedTrip: (req) => {
    set({
      currentTrip: {
        ...req,
        assignmentId: req.assignmentId || req.id,
        bookingId: req.bookingId,
        bookingNumber: req.bookingNumber,
        // req.status here is the DriverBookingRequest's own offer status (e.g.
        // "PENDING"), not a trip-stage status -- using it directly used to leak
        // "pending" into currentTrip.status, which ACTIVE_TRIP_STATUSES on the
        // Home screen doesn't recognize, wrongly treating a freshly accepted
        // trip as inactive.
        status: 'assigned',
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
   * Driver taps "Navigate to Pickup" -- purely a local UI state transition (no
   * backend call exists for this), swapping the AssignedTrip screen's button from
   * "Navigate to Pickup" to "Confirm Arrival at Pickup". Was previously destructured
   * from this store by AssignedTrip.jsx without ever being defined here -- calling
   * undefined() threw inside handleAction's setTimeout, which happened before the
   * setLoading(false) right after it, leaving the button stuck in its loading state
   * forever.
   */
  startNavigationToPickup: () => {
    set((state) => ({
      currentTrip: state.currentTrip ? { ...state.currentTrip, status: 'navigating' } : null
    }))
  },

  /**
   * Step 2: Verify Guest OTP & Record Start Odometer
   */
  verifyOtp: async (startOdometerValue, startOdometerImageUrl) => {
    const { currentTrip, otpInput } = get()
    if (!currentTrip) return false

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    // Backend requires a whole integer (odometer readings are billed in whole km) --
    // many vehicle odometers display one decimal place, and without rounding here a
    // driver typing what they actually see (e.g. 45230.5) gets a 422 with no
    // explanation, since Pydantic rejects a fractional value for an int field outright.
    // Rounded once and reused for both the API call and local state, so what's shown
    // in the app always matches what the backend actually recorded.
    const startOdo = Math.round(Number(startOdometerValue || get().startOdometer))

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.verifyOtp(assignmentId, {
        otp: otpInput,
        start_odometer: startOdo,
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
    // Same rounding as verifyOtp's start_odometer, and for the same reason: rounded
    // once and reused for both the API call and local state so the displayed value
    // always matches what the backend actually recorded.
    const endOdo = Math.round(Number(endOdometerValue || get().endOdometer))

    set({ isLoadingTrip: true, tripError: null })

    try {
      const res = await tripService.endTrip(assignmentId, {
        end_odometer: endOdo,
        end_odometer_image_url: endOdometerImageUrl
      })

      if (res?.success) {
        // end-trip recalculates the real fare server-side from actual distance
        // travelled (booking.total_amount in the response) -- currentTrip.fare was
        // never updated with it, so the Payment screen kept showing (and sending to
        // collect-payment) the original pre-trip estimate instead of what the guest
        // actually owes. res.data.total_distance_km also isn't a real field on this
        // response (DriverAssignmentResponseSchema has no such key, so it was always
        // undefined) -- compute it from the odometer readings instead.
        const recalculatedFare = res.data?.booking?.total_amount
        const distanceKm = endOdo - (Number(currentTrip.startOdometer) || 0)
        set({
          currentTrip: {
            ...currentTrip,
            status: 'payment_pending',
            endOdometer: endOdo,
            totalDistanceKm: distanceKm,
            // TripCompleted.jsx (and AssignedTrip.jsx's route line) read `distance` as
            // a display string, not `totalDistanceKm` -- that mismatch left both
            // screens blank even though the raw km figure was being tracked correctly.
            distance: `${distanceKm} km`,
            fare: recalculatedFare != null ? Number(recalculatedFare) : currentTrip.fare
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
   * @param {boolean} verifiedOnline - true when a real Payment row already exists
   * at SUCCESS status (QR flow, confirmed server-side by Razorpay's webhook) --
   * skips collect-payment entirely so a second, unverified payment record never
   * gets fabricated for the same trip. False (default) keeps the original
   * cash/self-reported path.
   */
  completeTrip: async (verifiedOnline = false) => {
    const { currentTrip, paymentMethod, startOdometer, endOdometer } = get()
    if (!currentTrip) return

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    set({ isLoadingTrip: true, tripError: null })

    try {
      if (!verifiedOnline) {
        await tripService.collectPayment(assignmentId, {
          amount: Number(currentTrip.fare || 0),
          payment_method: paymentMethod || 'CASH'
        })
      }
      const res = await tripService.completeTrip(assignmentId)
      const completedAtRaw = res.data?.completed_at || new Date().toISOString()

      // Same formula fetchTripsHistory() uses for past trips (completed_at - started_at
      // in whole minutes), computed here too so TripCompleted.jsx has a real value to
      // show immediately instead of waiting on a later history refetch.
      const durationMins = currentTrip.startedAt
        ? Math.round((new Date(completedAtRaw) - new Date(currentTrip.startedAt)) / 60000)
        : null
      const duration = durationMins != null ? `${durationMins} mins` : null

      const completedTrip = {
        id: assignmentId,
        assignmentId,
        bookingId: currentTrip.bookingId,
        bookingNumber: currentTrip.bookingNumber,
        pickup: currentTrip.pickup,
        drop: currentTrip.drop,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        // Real backend completion timestamp, not a client-generated one -- consistent
        // with what a later fetchTripsHistory() refetch will show, and needed so
        // "today's earnings" (derived from this list, see useDriverStatus) can
        // actually identify this trip as having happened today.
        completedAtRaw,
        distance: currentTrip.distance,
        duration,
        fare: currentTrip.fare,
        status: 'completed',
        paymentMethod: paymentMethod || 'CASH',
        customerName: currentTrip.customerName,
        startOdometer: startOdometer,
        endOdometer: endOdometer
      }

      set((state) => ({
        trips: [completedTrip, ...state.trips],
        currentTrip: { ...currentTrip, status: 'completed', distance: currentTrip.distance, duration },
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
            // Raw ISO timestamp, kept alongside the formatted display strings above so
            // "today's" trips/earnings can be derived reliably elsewhere (formattedDate
            // is locale text, not filterable).
            completedAtRaw: item.completed_at || null,
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
          // Carried through so starting the trip yields a usable trip object.
          // Without bookingId, trip-end QR creation posts booking_id: undefined
          // and the API rejects it with a 422.
          assignmentId: item.id,
          bookingId: item.booking?.id,
          bookingNumber: item.booking?.booking_number,
          pickup: item.booking?.pickup_location,
          drop: item.booking?.drop_location,
          date: item.booking?.pickup_date,
          time: item.booking?.pickup_time,
          distance: item.booking?.estimated_distance_km != null ? `${item.booking.estimated_distance_km} km` : null,
          duration: formatDurationMin(item.booking?.estimated_duration_min),
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
   * Fetch full details for a single past/completed trip (tapped from History).
   * Stored separately from currentTrip -- that field tracks the driver's own
   * in-progress trip through the accept/arrive/otp/active flow, and overwriting it
   * here to show a read-only historical record would corrupt that flow if a driver
   * ever viewed trip history while genuinely mid-trip.
   */
  selectedTripDetails: null,

  fetchTripDetails: async (assignmentId) => {
    set({ isLoadingTrip: true, tripError: null, selectedTripDetails: null })
    try {
      const res = await tripService.getTripDetails(assignmentId)
      if (res?.success && res.data) {
        const item = res.data
        const mappedTrip = {
          assignmentId: item.id,
          bookingId: item.booking_id,
          status: item.status,
          startOdometer: item.start_odometer,
          startOdometerImageUrl: item.start_odometer_image_url,
          endOdometer: item.end_odometer,
          endOdometerImageUrl: item.end_odometer_image_url,
          distanceKm: (item.end_odometer != null && item.start_odometer != null)
            ? item.end_odometer - item.start_odometer
            : null,
          assignedAt: item.assigned_at,
          arrivedAt: item.arrived_at,
          startedAt: item.started_at,
          completedAt: item.completed_at,
          pickup: item.booking?.pickup_location,
          drop: item.booking?.drop_location,
          fare: item.booking?.total_amount,
          totalPaid: item.booking?.total_paid,
          paymentMethod: item.booking?.payment_method,
          customerName: item.booking?.lead_traveler_name,
          customerPhone: item.booking?.lead_traveler_phone,
          bookingNumber: item.booking?.booking_number,
          pickupDate: item.booking?.pickup_date,
          pickupTime: item.booking?.pickup_time
        }
        set({ selectedTripDetails: mappedTrip, isLoadingTrip: false })
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
   * Reconciles currentTrip against the backend database.
   * If the trip was cancelled by admin or guest, or completed, or unassigned,
   * it clears currentTrip from memory and localStorage immediately.
   */
  syncCurrentTrip: async () => {
    const { currentTrip } = get()
    if (!currentTrip) return

    // Immediately clear if status locally is marked cancelled/completed/rejected
    const localStatus = (currentTrip.status || '').toLowerCase()
    if (['cancelled', 'canceled', 'completed', 'rejected'].includes(localStatus)) {
      set({ currentTrip: null })
      return
    }

    const assignmentId = currentTrip.assignmentId || currentTrip.id
    if (!assignmentId) {
      set({ currentTrip: null })
      return
    }

    try {
      const res = await tripService.getTripDetails(assignmentId)
      if (res?.success && res.data) {
        const item = res.data
        const assignmentStatus = (item.status || '').toUpperCase()
        const bookingStatus = (item.booking?.status || '').toUpperCase()

        const isCancelled =
          ['CANCELLED', 'CANCELED', 'REJECTED'].includes(assignmentStatus) ||
          ['CANCELLED', 'CANCELED', 'REJECTED'].includes(bookingStatus)

        const isCompleted = assignmentStatus === 'COMPLETED' || bookingStatus === 'COMPLETED'

        if (isCancelled || isCompleted) {
          set({ currentTrip: null })
          if (isCancelled) {
            toast('The previous ride was cancelled.', { icon: 'ℹ️' })
          }
          return
        }

        // If backend has an updated status (e.g., driver_arrived or in_progress)
        const backendStatus = (item.status || '').toLowerCase()
        if (backendStatus && backendStatus !== localStatus) {
          set((state) => ({
            currentTrip: state.currentTrip ? { ...state.currentTrip, status: backendStatus } : null
          }))
        }
      } else {
        set({ currentTrip: null })
      }
    } catch (err) {
      // 404/400/410 means the trip assignment is no longer active / unassigned
      if ([400, 403, 404, 410].includes(err?.response?.status)) {
        set({ currentTrip: null })
      }
    }
  },

  /**
   * Listens for cancellations from admin or guests mid-assignment.
   * Clears currentTrip and notifies the driver so they aren't stuck on a phantom ride.
   */
  initWebSocketListeners: () => {
    const cancelEvents = [
      'trip_cancelled',
      'booking_cancelled',
      'assignment_cancelled',
      'ride_cancelled',
      'trip_unassigned',
      'admin_cancelled'
    ]

    const handleCancellation = (data) => {
      const { currentTrip } = get()
      if (!currentTrip) return

      const targetId = String(
        data?.booking_id ||
        data?.bookingId ||
        data?.assignment_id ||
        data?.assignmentId ||
        data?.trip_id ||
        data?.id ||
        ''
      )

      const currentBookingId = String(currentTrip.bookingId || '')
      const currentAssignmentId = String(currentTrip.assignmentId || currentTrip.id || '')
      const currentBookingNumber = String(currentTrip.bookingNumber || '')

      if (
        !targetId ||
        targetId === currentBookingId ||
        targetId === currentAssignmentId ||
        targetId === currentBookingNumber
      ) {
        set({ currentTrip: null })
        const msg = data?.message || data?.reason || 'This ride was cancelled by the admin / guest.'
        toast.error(msg)
      }
    }

    const unbinders = cancelEvents.map((evt) =>
      websocketService.on(evt, handleCancellation)
    )

    return () => {
      unbinders.forEach((unbind) => unbind && unbind())
    }
  }
    }),
    {
      name: 'driveast_trip_state',
      partialize: (state) => ({
        currentTrip: state.currentTrip,
        otpCode: state.otpCode,
        otpInput: state.otpInput,
        startOdometer: state.startOdometer,
        endOdometer: state.endOdometer,
        paymentMethod: state.paymentMethod
      }),
      // NOTE: must read setHasHydrated off the `state` argument zustand passes
      // in here, not the `useTripStore` module binding -- this callback runs
      // synchronously during the create(persist(...)) call itself, before the
      // `export const useTripStore = ...` assignment below has completed, so
      // referencing the outer binding would hit the temporal dead zone.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
