import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiNavigation } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { useLocation } from '../../hooks/useLocation'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import './ActiveTrip.css'

export const ActiveTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, arriveAtDropoff } = useTripStore()
  const { location, heading } = useLocation()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const [loading, setLoading] = useState(false)

  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const pickupLoc = currentTrip.pickupLatLng || [40.7527, -73.9772]
    const dropLoc = currentTrip.dropLatLng || [40.7580, -73.9855]

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(location, 14)

    mapInstanceRef.current = map

    // Dark Map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map)

    // Markers divs
    const driverIcon = L.divIcon({
      className: 'driver-car-marker active-phase',
      html: `<div style="transform: rotate(${heading}deg)">🚗</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    })

    const dropIcon = L.divIcon({
      className: 'custom-map-marker marker-drop',
      html: '<div></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    // Mount markers
    const driverMarker = L.marker(location, { icon: driverIcon }).addTo(map)
    driverMarkerRef.current = driverMarker

    const dropMarker = L.marker(dropLoc, { icon: dropIcon }).addTo(map)

    // Route path (pickup to drop)
    const polyline = L.polyline([pickupLoc, dropLoc], {
      color: '#6366f1',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map)

    // Fit bounds
    const group = new L.featureGroup([driverMarker, dropMarker])
    map.fitBounds(group.getBounds().pad(0.3))

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [currentTrip?.id])

  // Update driver marker position in real time
  useEffect(() => {
    if (driverMarkerRef.current && mapInstanceRef.current) {
      driverMarkerRef.current.setLatLng(location)
      
      // Update HTML rotate styling based on heading
      const markerEl = driverMarkerRef.current.getElement()
      if (markerEl) {
        const iconDiv = markerEl.querySelector('.driver-car-marker div')
        if (iconDiv) {
          iconDiv.style.transform = `rotate(${heading}deg)`
        }
      }
    }
  }, [location, heading])

  const handleComplete = () => {
    setLoading(true)
    setTimeout(() => {
      arriveAtDropoff() // Change status to payment_pending
      setLoading(false)
      navigate('/trips/payment')
    }, 800)
  }

  return (
    <div className="active-trip-page">
      {/* Map screen */}
      <div className="active-map-container">
        <div ref={mapContainerRef} className="active-leaflet-map"></div>
        
        {/* Floating guidance overlay */}
        <div className="navigation-overlay active-run glass-panel">
          <FiNavigation className="nav-compass-icon animate-pulse" />
          <div className="nav-text">
            <span>En Route to Destination</span>
            <strong>Progress: Driving towards dropoff point</strong>
          </div>
        </div>
      </div>

      {/* Active Trip panel */}
      <div className="active-action-panel">
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel="Tap to End Trip (Arrive)"
          onPrimaryAction={handleComplete}
          loading={loading}
        />
      </div>
    </div>
  )
}
export default ActiveTrip
