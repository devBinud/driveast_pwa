import { useDriverStore } from '../store/driverStore'

export const useDriverStatus = () => {
  const { 
    isOnline, 
    todayEarnings, 
    acceptanceRate, 
    hoursOnline, 
    completedTripsCount,
    toggleOnline,
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
    toggleOnline,
    addEarnings,
    incrementTrips,
    updateHours,
    updateAcceptanceRate
  }
}
