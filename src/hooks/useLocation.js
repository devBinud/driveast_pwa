import { useState, useEffect } from 'react'
import { useTripStore } from '../store/tripStore'

// Initial coordinate near Times Square
const START_LAT = 40.7580
const START_LNG = -73.9855

export const useLocation = () => {
  const currentTrip = useTripStore((state) => state.currentTrip)
  const [location, setLocation] = useState([START_LAT, START_LNG])
  const [isTracking, setIsTracking] = useState(false)
  const [heading, setHeading] = useState(0)

  useEffect(() => {
    let intervalId = null
    setIsTracking(true)

    // Simulate location updates
    if (currentTrip) {
      const status = currentTrip.status
      let startPoint = [START_LAT, START_LNG]
      let endPoint = [START_LAT, START_LNG]
      
      if (status === 'assigned') {
        // Moving from start to pickup
        startPoint = [START_LAT, START_LNG]
        endPoint = currentTrip.pickupLatLng || [40.7527, -73.9772]
      } else if (status === 'active') {
        // Moving from pickup to drop
        startPoint = currentTrip.pickupLatLng || [40.7527, -73.9772]
        endPoint = currentTrip.dropLatLng || [40.7580, -73.9855]
      } else if (status === 'arrived' || status === 'otp_verified') {
        // Stationary at pickup
        setLocation(currentTrip.pickupLatLng || [40.7527, -73.9772])
        return
      } else {
        // Stationary
        return
      }

      let step = 0
      const totalSteps = 60 // 1 minute simulation
      
      intervalId = setInterval(() => {
        if (step <= totalSteps) {
          const ratio = step / totalSteps
          const currentLat = startPoint[0] + (endPoint[0] - startPoint[0]) * ratio
          const currentLng = startPoint[1] + (endPoint[1] - startPoint[1]) * ratio
          
          // Calculate heading
          const dLat = endPoint[0] - startPoint[0]
          const dLng = endPoint[1] - startPoint[1]
          const angle = Math.atan2(dLng, dLat) * (180 / Math.PI)
          
          setLocation([currentLat, currentLng])
          setHeading(angle)
          step += 1
        } else {
          clearInterval(intervalId)
        }
      }, 1000)
    } else {
      // Just simulate small random drift while idle
      intervalId = setInterval(() => {
        setLocation((prev) => [
          prev[0] + (Math.random() - 0.5) * 0.0001,
          prev[1] + (Math.random() - 0.5) * 0.0001
        ])
      }, 5000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [currentTrip?.status, currentTrip?.id])

  return {
    location,
    heading,
    isTracking,
    accuracy: 10, // 10 meters mock accuracy
    startTracking: () => setIsTracking(true),
    stopTracking: () => setIsTracking(false)
  }
}
