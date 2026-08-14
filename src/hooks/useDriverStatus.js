import { useMemo } from 'react'
import { useDriverStore } from '../store/driverStore'
import { useTripStore } from '../store/tripStore'

const isSameLocalDay = (isoString) => {
  if (!isoString) return false
  const d = new Date(isoString)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
}

/**
 * todayEarnings/completedTripsCount used to be a local counter incremented by hand
 * on every trip completion (driverStore.addEarnings/incrementTrips) -- it started
 * from 0 on every page load with nothing to resync it from the backend, so it
 * silently drifted from (and could show a completely different number than) what
 * History computed from the driver's actual trip records. Derived here from the
 * same real trip data History uses, just filtered to today, so both screens are
 * guaranteed to agree.
 */
export const useDriverStatus = () => {
  const {
    isOnline,
    availabilityStatus,
    acceptanceRate,
    hoursOnline,
    isDutyModalOpen,
    isLoadingStatus,
    toggleOnline,
    setStatus,
    setDutyModalOpen,
    updateHours,
    updateAcceptanceRate
  } = useDriverStore()

  const trips = useTripStore((state) => state.trips)

  const { todayEarnings, completedTripsCount } = useMemo(() => {
    const todaysCompletedTrips = trips.filter(
      (t) => String(t.status).toLowerCase() === 'completed' && isSameLocalDay(t.completedAtRaw)
    )
    return {
      todayEarnings: todaysCompletedTrips.reduce((sum, t) => sum + (Number(t.fare) || 0), 0),
      completedTripsCount: todaysCompletedTrips.length
    }
  }, [trips])

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
    updateHours,
    updateAcceptanceRate
  }
}
