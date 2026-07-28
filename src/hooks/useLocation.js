import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useDriverStore } from '../store/driverStore'
import { driverService } from '../services/driverService'

export const useLocation = () => {
  const isOnline = useDriverStore((state) => state.isOnline)
  const [location, setLocation] = useState([26.1445, 91.7362])
  const [heading, setHeading] = useState(0)
  const [accuracy, setAccuracy] = useState(10)
  const [isTracking, setIsTracking] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const lastPingTime = useRef(0)

  const pingBackendLocation = async (lat, lng) => {
    const now = Date.now()
    if (now - lastPingTime.current >= 10000) { // 10s throttle
      lastPingTime.current = now
      try {
        await driverService.updateLocation(lat, lng)
      } catch (err) {
        // Silent catch for background GPS location ping
      }
    }
  }

  // Monitor Geolocation permission state
  useEffect(() => {
    if ('permissions' in navigator && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setPermissionDenied(true)
        }
        result.onchange = () => {
          setPermissionDenied(result.state === 'denied')
        }
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    let watchId = null

    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your device or browser.')
      return
    }

    if (isOnline) {
      setIsTracking(true)
      setPermissionDenied(false)

      // Immediate position fetch on going online
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation([latitude, longitude])
          pingBackendLocation(latitude, longitude)
        },
        (error) => {
          if (error.code === 1) { // PERMISSION_DENIED
            setPermissionDenied(true)
            toast.error('GPS permission denied. Please allow location access in your browser to receive dispatches.', {
              duration: 6000,
              icon: '📍'
            })
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )

      // Continuous high-accuracy location tracking
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading: deviceHeading, accuracy: posAccuracy } = position.coords
          setLocation([latitude, longitude])
          if (deviceHeading !== null && !isNaN(deviceHeading)) {
            setHeading(deviceHeading)
          }
          if (posAccuracy) {
            setAccuracy(posAccuracy)
          }
          pingBackendLocation(latitude, longitude)
        },
        (error) => {
          console.warn('Geolocation tracking error:', error.message)
          if (error.code === 1) {
            setPermissionDenied(true)
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      )
    } else {
      setIsTracking(false)
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isOnline])

  return {
    location,
    heading,
    accuracy,
    isTracking,
    permissionDenied
  }
}
