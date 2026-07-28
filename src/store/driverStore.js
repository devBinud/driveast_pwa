import { create } from 'zustand'
import { driverService, AvailabilityStatus } from '../services/driverService'

export const useDriverStore = create((set, get) => ({
  isOnline: false,
  availabilityStatus: AvailabilityStatus.OFFLINE,
  todayEarnings: 0.00,
  hoursOnline: 0.0,
  completedTripsCount: 0,
  isDutyModalOpen: false,
  isLoadingStatus: false,
  statusError: null,
  
  toggleOnline: async () => {
    const nextIsOnline = !get().isOnline
    const nextStatus = nextIsOnline ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.OFFLINE
    await get().setStatus(nextStatus)
  },

  setStatus: async (status) => {
    set({ isLoadingStatus: true, statusError: null })
    try {
      const res = await driverService.updateStatus(status)
      if (res?.success) {
        const returnedStatus = res.data?.availability_status || status
        set({
          availabilityStatus: returnedStatus,
          isOnline: returnedStatus === AvailabilityStatus.AVAILABLE || returnedStatus === AvailabilityStatus.ON_TRIP,
          isLoadingStatus: false
        })
        return true
      }
      set({ isLoadingStatus: false, statusError: res?.message || 'Failed to update status' })
      return false
    } catch (err) {
      set({ isLoadingStatus: false, statusError: err?.message || 'Network error updating status' })
      return false
    }
  },

  setDutyModalOpen: (isOpen) => set({ isDutyModalOpen: isOpen }),
  
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
    }))
}))
