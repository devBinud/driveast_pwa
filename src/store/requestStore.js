import { create } from 'zustand'
import { driverService } from '../services/driverService'
import { websocketService } from '../services/websocketService'

export const useRequestStore = create((set, get) => ({
  requests: [],
  isMinimized: false,
  isLoadingRequests: false,
  error: null,

  setMinimized: (val) => set({ isMinimized: val }),

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
