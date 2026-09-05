import { create } from 'zustand'
import { authService } from '../services/authService'
import { websocketService } from '../services/websocketService'
import { pushNotificationService } from '../services/pushNotificationService'
import { useTripStore } from './tripStore'
import { useRequestStore } from './requestStore'
import { useDriverStore } from './driverStore'
import { useWalletStore } from './walletStore'

const initialToken = localStorage.getItem('driveast_token') || null

// Shared by both logout() (driver taps "Sign Out") and forceLogout() (the
// backend rejected the current session, e.g. an expired token) so the two
// paths can't drift apart and leave one of them not actually clearing
// everything. These stores are module-level singletons for the life of the
// browser tab -- without this, a second driver logging in on the same
// device/session would inherit whatever trip, requests, duty status and
// wallet data the previous session left in memory.
const resetAllDriverStores = () => {
  useTripStore.getState().resetTripState()
  useRequestStore.getState().resetRequests()
  useDriverStore.getState().resetDriverStatus()
  useWalletStore.getState().resetWallet()
}

export const useAuthStore = create((set, get) => ({
  isAuthenticated: Boolean(initialToken),
  token: initialToken,
  user: null,
  isLoading: false,
  error: null,

  login: async (phone, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login(phone, password)
      if (res?.success && res?.data?.access_token) {
        const token = res.data.access_token
        set({ token, isAuthenticated: true, error: null })
        websocketService.connectDriverWs(token)
        await get().fetchProfile()
        // Also called from MainLayout's mount effect (covers page reload with an
        // existing session); safe to call again here since it's idempotent --
        // subscribeSilently() reuses the existing PushSubscription if one is already
        // active and never prompts (see pushNotificationService for why).
        pushNotificationService.subscribeSilently()
        set({ isLoading: false })
        return true
      }
      const errMsg = res?.message || 'Login failed. Please check your credentials.'
      set({ isLoading: false, error: errMsg })
      return false
    } catch (err) {
      const errMsg = err?.message || 'Unable to connect to authentication server.'
      set({ isLoading: false, error: errMsg })
      return false
    }
  },

  logout: async () => {
    // Must run before authService.logout() clears the token -- unsubscribing
    // the backend record is an authenticated call.
    try {
      await pushNotificationService.unsubscribe()
    } catch (e) {
      // best-effort; a stale subscription row is harmless (send_web_push_to_driver
      // drops it on the next 404/410 from the push service)
    }
    try {
      await authService.logout()
    } catch (e) {
      localStorage.removeItem('driveast_token')
    }
    websocketService.disconnectAll()
    resetAllDriverStores()
    set({ isAuthenticated: false, token: null, user: null, error: null })
  },

  /**
   * Session was killed by the backend rather than the driver (e.g. an expired
   * or revoked token surfacing as a 401 on some unrelated request -- see
   * api.js's response interceptor). No backend call here: the token is
   * already invalid, so hitting /auth/logout with it would just 401 again.
   */
  forceLogout: () => {
    websocketService.disconnectAll()
    resetAllDriverStores()
    set({ isAuthenticated: false, token: null, user: null, error: null })
  },

  fetchProfile: async () => {
    try {
      const res = await authService.getProfile()
      console.log('🔔 [PROFILE API RESPONSE] /api/v1/driver/me:', res)
      if (res?.success && res?.data) {
        const d = res.data
        const isAddressEmail = Boolean(d.address && d.address.includes('@'))
        const userObj = {
          id: d.id || 'Not Provided',
          name: d.name || 'Not Provided',
          phone: d.phone || 'Not Provided',
          email: d.email || (isAddressEmail ? d.address : null) || d.driver_email || d.user_email || 'Not Provided',
          address: !isAddressEmail && d.address ? d.address : null,
          licenseNumber: d.license_number || d.license_no || d.dl_number || d.driver_license || 'Not Provided',
          vehicleModel: d.assigned_vehicle?.vehicle_name || d.vehicle_name || d.vehicle_model || 'Not Provided',
          vehicleNumber: d.assigned_vehicle?.registration_number || d.registration_number || d.vehicle_number || 'Not Provided',
          vehicleType: d.assigned_vehicle?.vehicle_type || d.vehicle_type || 'Not Provided',
          seatCapacity: d.assigned_vehicle?.seat_capacity || d.seat_capacity || null,
          fuelType: d.assigned_vehicle?.fuel_type || d.fuel_type || 'Not Provided',
          perKmPrice: d.assigned_vehicle?.per_km_price ?? null,
          driverAllowance: d.assigned_vehicle?.driver_allowance ?? null,
          availabilityStatus: d.availability_status || 'AVAILABLE',
          currentLat: d.current_lat,
          currentLng: d.current_lng,
          isActive: d.is_active !== undefined ? d.is_active : true,
          rating: Number(d.rating ?? d.driver_rating ?? 5.0),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || 'Driver')}&background=fbbf24&color=000000&bold=true`
        }
        set({ user: userObj })
        return d
      }
    } catch (err) {
      console.warn('Failed to fetch profile from API endpoint:', err)
    }
    return null
  },

  updateProfile: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null
    }))
}))

// api.js can't import useAuthStore directly (authService.js, which it also
// imports, imports api.js -- that'd be a circular import). A plain window
// event decouples the two: api.js dispatches this the moment it sees a 401 on
// an already-authenticated request, and this listener (registered only after
// useAuthStore fully exists, avoiding any circular-import timing issue) is
// what actually flips the app back to the login screen and clears state.
window.addEventListener('driveast:force-logout', () => {
  useAuthStore.getState().forceLogout()
})
