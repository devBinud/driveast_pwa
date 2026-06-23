import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: true, // Logged in by default for demonstration
  user: {
    id: 'DRV-8821',
    name: 'Surya Reddy',
    email: 'surya.reddy@driveast.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
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
          name: 'Surya Reddy',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256',
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

