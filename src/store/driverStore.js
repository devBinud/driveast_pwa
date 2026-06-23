import { create } from 'zustand'

export const useDriverStore = create((set) => ({
  isOnline: true,
  todayEarnings: 184.50,
  acceptanceRate: 96,
  hoursOnline: 5.4,
  completedTripsCount: 8,
  
  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
  
  addEarnings: (amount) => 
    set((state) => ({ 
      todayEarnings: Math.round((state.todayEarnings + amount) * 100) / 100 
    })),
    
  incrementTrips: () => 
    set((state) => ({ 
      completedTripsCount: state.completedTripsCount + 1 
    })),
    
  updateHours: (hours) => 
    set((state) => ({ 
      hoursOnline: Math.round((state.hoursOnline + hours) * 10) / 10 
    })),
    
  updateAcceptanceRate: (rate) => 
    set({ acceptanceRate: rate })
}))
