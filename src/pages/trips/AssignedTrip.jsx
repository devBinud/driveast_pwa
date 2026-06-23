import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiCompass } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { useLocation } from '../../hooks/useLocation'
import { ActiveTripCard } from '../../components/trips/ActiveTripCard/ActiveTripCard'
import './AssignedTrip.css'

export const AssignedTrip = () => {
  const navigate = useNavigate()
  const { currentTrip, arriveAtPickup } = useTripStore()
  const { location, heading } = useLocation()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if no trip is active
  if (!currentTrip) {
    return <Navigate to="/" replace />
  }

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    const pickupLoc = currentTrip.pickupLatLng || [40.7527, -73.9772]

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
      className: 'driver-car-marker',
      html: `<div style="transform: rotate(${heading}deg)">🚗</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const pickupIcon = L.divIcon({
      className: 'custom-map-marker marker-pickup',
      html: '<div></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    // Mount markers
    const driverMarker = L.marker(location, { icon: driverIcon }).addTo(map)
    driverMarkerRef.current = driverMarker

    const pickupMarker = L.marker(pickupLoc, { icon: pickupIcon }).addTo(map)

    // Route path (driver to pickup)
    const polyline = L.polyline([location, pickupLoc], {
      color: '#10b981',
      weight: 4,
      opacity: 0.8,
      dashArray: '6, 6'
    }).addTo(map)

    // Fit bounds
    const group = new L.featureGroup([driverMarker, pickupMarker])
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

  const handleArrived = () => {
    setLoading(true)
    setTimeout(() => {
      arriveAtPickup()
      setLoading(false)
      navigate('/trips/otp')
    }, 800)
  }

  return (
    <div className="assigned-trip-page">
      {/* Map screen */}
      <div className="assigned-map-container">
        <div ref={mapContainerRef} className="assigned-leaflet-map"></div>
        
        {/* Floating guidance overlay */}
        <div className="navigation-overlay glass-panel">
          <FiCompass className="compass-icon animate-pulse" />
          <div className="nav-text">
            <span>Navigating to Pickup</span>
            <strong>Route: 1.4 miles • 5 mins away</strong>
          </div>
        </div>
      </div>

      {/* Active Trip panel */}
      <div className="assigned-action-panel">
        <ActiveTripCard
          trip={currentTrip}
          primaryActionLabel="Tap to Arrive at Pickup"
          onPrimaryAction={handleArrived}
          loading={loading}
        />
      </div>
    </div>
  )
}
export default AssignedTrip
