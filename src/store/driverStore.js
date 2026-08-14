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

  /**
   * Syncs local state to match the backend's actual availability_status, without
   * making a network call of its own. isOnline/availabilityStatus otherwise only
   * ever start from the hardcoded OFFLINE default and are never touched again until
   * the driver manually taps the duty toggle -- so any full page reload (including
   * the Profile tab's "Check Updates & Force Refresh App") reset this local state to
   * OFFLINE regardless of the driver's real backend status, and since
   * RideRequestModal only opens when isOnline is true, an actually-AVAILABLE driver
   * would silently stop seeing new ride request popups after every refresh.
   */
  syncStatus: (status) => {
    if (!status) return
    set({
      availabilityStatus: status,
      isOnline: status === AvailabilityStatus.AVAILABLE || status === AvailabilityStatus.ON_TRIP
    })
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
