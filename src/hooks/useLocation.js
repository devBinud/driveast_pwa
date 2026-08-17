import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useDriverStore } from '../store/driverStore'
import { driverService } from '../services/driverService'

export const useLocation = () => {
  const isOnline = useDriverStore((state) => state.isOnline)
  const [location, setLocation] = useState([26.1445, 91.7362])
  const [locationDetails, setLocationDetails] = useState({
    placeName: 'Detecting location...',
    cityName: 'Connecting to GPS...',
    formatted: 'Detecting location...'
  })
  const [heading, setHeading] = useState(0)
  const [accuracy, setAccuracy] = useState(10)
  const [isTracking, setIsTracking] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const lastPingTime = useRef(0)
  const lastGeocodeTime = useRef(0)
  const lastGeocodeCoords = useRef([0, 0])
  const watchIdRef = useRef(null)

  const reverseGeocode = async (lat, lng) => {
    const now = Date.now()
    const [prevLat, prevLng] = lastGeocodeCoords.current
    const distChange = Math.abs(lat - prevLat) + Math.abs(lng - prevLng)

    // Only geocode if at least 15 seconds passed or coords changed by > 0.001 (~100m)
    if (now - lastGeocodeTime.current < 15000 && distChange < 0.001) {
      return
    }

    lastGeocodeTime.current = now
    lastGeocodeCoords.current = [lat, lng]

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      )
      if (!res.ok) throw new Error('Geocoding network error')
      const data = await res.json()
      const addr = data.address || {}
      
      const primaryPlace = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.road || addr.locality || addr.city_district || 'Zoo Road'
      const district = addr.city_district || addr.county || ''
      const city = addr.city || addr.town || addr.village || 'Guwahati'
      const state = addr.state || 'Assam'

      let place = primaryPlace
      if (district && district !== primaryPlace && district !== city) {
        place = `${primaryPlace}, ${district}`
      }

      const cityState = city && state && city !== state ? `${city}, ${state}` : (city || state)

      setLocationDetails({
        placeName: place,
        cityName: cityState,
        formatted: `${place}, ${cityState}`
      })
    } catch {
      // Clean fallback using coordinates if geocoder fails
      setLocationDetails({
        placeName: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        cityName: 'Assam, India',
        formatted: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`
      })
    }
  }

  const pingBackendLocation = async (lat, lng) => {
    const now = Date.now()
    if (now - lastPingTime.current >= 10000) { // 10s throttle
      lastPingTime.current = now
      try {
        await driverService.updateLocation(lat, lng)
      } catch {
        // Silent catch for background GPS location ping
      }
    }
  }

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by this browser.', { id: 'gps-not-supported' })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, heading: deviceHeading, accuracy: posAccuracy } = position.coords
        setLocation([latitude, longitude])
        setPermissionDenied(false)
        setIsTracking(true)
        if (deviceHeading !== null && !isNaN(deviceHeading)) setHeading(deviceHeading)
        if (posAccuracy) setAccuracy(posAccuracy)
        pingBackendLocation(latitude, longitude)
        reverseGeocode(latitude, longitude)
        toast.dismiss('gps-permission-denied')
      },
      (error) => {
        if (error.code === 1) { // PERMISSION_DENIED
          setPermissionDenied(true)
          toast.error('Location access denied. Please enable location permissions in browser settings.', {
            id: 'gps-permission-denied',
            duration: 4000,
            icon: '📍'
          })
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // Monitor Geolocation permission state
  useEffect(() => {
    if ('permissions' in navigator && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionDenied(result.state === 'denied')
        result.onchange = () => {
          setPermissionDenied(result.state === 'denied')
          if (result.state === 'granted') {
            toast.dismiss('gps-permission-denied')
            requestLocation()
          }
        }
      }).catch(() => {})
    }
  }, [requestLocation])

  useEffect(() => {
    if (!('geolocation' in navigator)) return

    if (isOnline) {
      setIsTracking(true)
      requestLocation()

      // Continuous location tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading: deviceHeading, accuracy: posAccuracy } = position.coords
          setLocation([latitude, longitude])
          setPermissionDenied(false)
          if (deviceHeading !== null && !isNaN(deviceHeading)) setHeading(deviceHeading)
          if (posAccuracy) setAccuracy(posAccuracy)
          pingBackendLocation(latitude, longitude)
          reverseGeocode(latitude, longitude)
        },
        (error) => {
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
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [isOnline, requestLocation])

  return {
    location,
    locationDetails,
    address: locationDetails.formatted,
    heading,
    accuracy,
    isTracking,
    permissionDenied,
    requestLocation
  }
}

export default useLocation

