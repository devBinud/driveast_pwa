import { create } from 'zustand'
import { authService } from '../services/authService'
import { websocketService } from '../services/websocketService'

const initialToken = localStorage.getItem('driveast_token') || null

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
    try {
      await authService.logout()
    } catch (e) {
      localStorage.removeItem('driveast_token')
    }
    websocketService.disconnectAll()
    set({ isAuthenticated: false, token: null, user: null, error: null })
  },

  fetchProfile: async () => {
    try {
      const res = await authService.getProfile()
      console.log('🔔 [PROFILE API RESPONSE] /api/v1/driver/me:', res)
      if (res?.success && res?.data) {
        const d = res.data
        const userObj = {
          id: d.id || 'Not Provided',
          name: d.name || 'Not Provided',
          phone: d.phone || 'Not Provided',
          email: d.email || d.driver_email || d.user_email || 'Not Provided',
          licenseNumber: d.license_number || d.license_no || d.dl_number || d.driver_license || 'Not Provided',
          vehicleModel: d.assigned_vehicle?.vehicle_name || d.vehicle_name || d.vehicle_model || 'Not Provided',
          vehicleNumber: d.assigned_vehicle?.registration_number || d.registration_number || d.vehicle_number || 'Not Provided',
          availabilityStatus: d.availability_status || 'AVAILABLE',
          currentLat: d.current_lat,
          currentLng: d.current_lng,
          isActive: d.is_active !== undefined ? d.is_active : true,
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
