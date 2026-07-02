import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: true, // Logged in by default for demonstration
  user: {
    id: 'DRV-8821',
    name: 'Abhijit Kalita',
    email: 'abhijit.kalita@driveast.com',
    avatar: 'https://ui-avatars.com/api/?name=Abhijit+Kalita&background=fbbf24&color=000000&size=256&font-size=0.4&bold=true&rounded=true',
    phone: '+91 94350 88211',
    rating: 4.92,
    totalTrips: 1420,
    vehicleModel: 'Maruti Swift Dzire (White)',
    vehicleNumber: 'AS-01-JA-7712',
    documentsVerified: true
  },

  login: (email, password) => {
    // Mock login validation
    if (email && password) {
      set({
        isAuthenticated: true,
        user: {
          id: 'DRV-8821',
          name: 'Abhijit Kalita',
          email: email,
          avatar: 'https://ui-avatars.com/api/?name=Abhijit+Kalita&background=fbbf24&color=000000&size=256&font-size=0.4&bold=true&rounded=true',
          phone: '+91 94350 88211',
          rating: 4.92,
          totalTrips: 1420,
          vehicleModel: 'Maruti Swift Dzire (White)',
          vehicleNumber: 'AS-01-JA-7712',
          documentsVerified: true
        }
      })
      return true
    }
    return false
  },

  logout: () => set({ isAuthenticated: false, user: null }),

  updateProfile: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null
    }))
}))

