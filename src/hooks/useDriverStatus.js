import { useDriverStore } from '../store/driverStore'

export const useDriverStatus = () => {
  const { 
    isOnline, 
    todayEarnings, 
    acceptanceRate, 
    hoursOnline, 
    completedTripsCount,
    isDutyModalOpen,
    toggleOnline,
    setDutyModalOpen,
    addEarnings,
    incrementTrips,
    updateHours,
    updateAcceptanceRate
  } = useDriverStore()
  
  return {
    isOnline,
    todayEarnings,
    acceptanceRate,
    hoursOnline,
    completedTripsCount,
    isDutyModalOpen,
    toggleOnline,
    setDutyModalOpen,
    addEarnings,
    incrementTrips,
    updateHours,
    updateAcceptanceRate
  }
}
