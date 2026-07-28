import { useDriverStore } from '../store/driverStore'

export const useDriverStatus = () => {
  const { 
    isOnline,
    availabilityStatus,
    todayEarnings, 
    acceptanceRate, 
    hoursOnline, 
    completedTripsCount,
    isDutyModalOpen,
    isLoadingStatus,
    toggleOnline,
    setStatus,
    setDutyModalOpen,
    addEarnings,
    incrementTrips,
    updateHours,
    updateAcceptanceRate
  } = useDriverStore()
  
  return {
    isOnline,
    availabilityStatus,
    todayEarnings,
    acceptanceRate,
    hoursOnline,
    completedTripsCount,
    isDutyModalOpen,
    isLoadingStatus,
    toggleOnline,
    setStatus,
    setDutyModalOpen,
    addEarnings,
    incrementTrips,
    updateHours,
    updateAcceptanceRate
  }
}
