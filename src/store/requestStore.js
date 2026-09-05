import { create } from 'zustand'
import { driverService } from '../services/driverService'
import { websocketService } from '../services/websocketService'

// Real driving duration in minutes -> a readable string. Backend already excludes
// this (and estimated_distance_km) entirely when a booking was never actually
// geocoded, so callers only ever see this for real routes.
const formatDurationMin = (mins) => {
  if (mins == null) return null
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export const useRequestStore = create((set, get) => ({
  requests: [],
  isMinimized: false,
  isLoadingRequests: false,
  error: null,

  setMinimized: (val) => set({ isMinimized: val }),

  // See tripStore's resetTripState -- this store is a shared singleton for the
  // browser tab too, so a stale incoming-request list (with a previous
  // driver's pickup/drop/customer details) would otherwise carry over into the
  // next driver's session on logout/login.
  resetRequests: () => set({ requests: [], isMinimized: false, isLoadingRequests: false, error: null }),

  fetchPendingRequests: async () => {
    set({ isLoadingRequests: true, error: null })
    try {
      const res = await driverService.getPendingRequests()
      if (res?.success && Array.isArray(res.data)) {
        const mappedRequests = res.data.map(req => ({
          id: req.id,
          bookingId: req.booking_id || req.booking?.id,
          bookingNumber: req.booking?.booking_number || 'BK-LIVE',
          pickup: req.booking?.pickup_location || 'Pickup Location',
          pickupLat: req.booking?.pickup_lat,
          pickupLng: req.booking?.pickup_lng,
          drop: req.booking?.drop_location || 'Dropoff Location',
          dropLat: req.booking?.drop_lat,
          dropLng: req.booking?.drop_lng,
          distance: req.booking?.estimated_distance_km != null ? `${req.booking.estimated_distance_km} km` : null,
          duration: formatDurationMin(req.booking?.estimated_duration_min),
          fare: req.booking?.total_amount || 0,
          customerName: req.booking?.lead_traveler_name || 'Guest',
          customerPhone: req.booking?.lead_traveler_phone || '',
          passengers: req.booking?.total_passengers || 1,
          timeLeft: Math.max(0, Math.floor((new Date(req.expires_at).getTime() - Date.now()) / 1000)) || 900,
          status: req.status
        }))
        set({ requests: mappedRequests, isLoadingRequests: false })
        return mappedRequests
      }
    } catch (err) {
      set({ isLoadingRequests: false, error: err?.message || 'Failed to fetch pending requests' })
    }
    set({ isLoadingRequests: false })
    return []
  },

  acceptRequest: async (id) => {
    try {
      const res = await driverService.respondToRequest(id, true)
      if (res?.success) {
        set((state) => ({
          requests: state.requests.filter(req => req.id !== id)
        }))
        return res.data
      }
    } catch (err) {
      console.error('Failed to accept request:', err)
      throw err
    }
  },

  declineRequest: async (id) => {
    try {
      await driverService.respondToRequest(id, false)
    } catch (err) {
      console.error('Failed to decline request:', err)
    }
    set((state) => ({
      requests: state.requests.filter(req => req.id !== id)
    }))
  },

  initWebSocketListeners: () => {
    const unbindNew = websocketService.on('new_request', (data) => {
      const newReq = {
        id: data.request_id,
        bookingId: data.booking_id,
        bookingNumber: data.booking_number,
        pickup: data.pickup_location,
        pickupLat: data.pickup_lat,
        pickupLng: data.pickup_lng,
        drop: data.drop_location,
        dropLat: data.drop_lat,
        dropLng: data.drop_lng,
        timeLeft: data.expires_in_seconds || 900,
        fare: data.total_amount || 0,
        customerName: data.lead_traveler_name || 'Guest',
        customerPhone: data.lead_traveler_phone || ''
      }
      set((state) => ({ 
        requests: [newReq, ...state.requests.filter(r => r.id !== data.request_id)]
      }))
    })

    const unbindCancel = websocketService.on('trip_cancelled', (data) => {
      set((state) => ({
        requests: state.requests.filter(req => req.bookingId !== data.booking_id && req.id !== data.booking_id)
      }))
    })

    return () => {
      unbindNew()
      unbindCancel()
    }
  },

  tickTimers: () => set((state) => ({
    requests: state.requests
      .map(req => ({ ...req, timeLeft: Math.max(0, req.timeLeft - 1) }))
      .filter(req => req.timeLeft > 0)
  }))
}))
