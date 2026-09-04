import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiMapPin, FiNavigation, FiClock, FiCreditCard } from 'react-icons/fi'
import { Button } from '../../common/Button/Button'
import { Card } from '../../common/Card/Card'
import './RequestDetails.css'

export const RequestDetails = ({
  request,
  onAccept,
  onDecline
}) => {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const {
    id,
    pickup,
    drop,
    distance,
    duration,
    fare,
    customerName,
    customerAvatar,
    pickupLatLng,
    dropLatLng
  } = request

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Fix marker icon issues in Leaflet default packaging
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })
    L.Marker.prototype.options.icon = DefaultIcon

    const startLoc = pickupLatLng || [40.7527, -73.9772]
    const endLoc = dropLatLng || [40.7580, -73.9855]

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(startLoc, 13)

    mapInstanceRef.current = map

    // CartoDB Positron tile layer for premium light aesthetics
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map)

    // Custom icons for Pickup (Green) and Drop (Indigo/Blue)
    const pickupIcon = L.divIcon({
      className: 'custom-map-marker marker-pickup',
      html: '<div></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    const dropIcon = L.divIcon({
      className: 'custom-map-marker marker-drop',
      html: '<div></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    })

    // Add markers
    const marker1 = L.marker(startLoc, { icon: pickupIcon }).addTo(map).bindPopup('Pickup Location')
    const marker2 = L.marker(endLoc, { icon: dropIcon }).addTo(map).bindPopup('Dropoff Location')

    // Add route line connecting start and end
    const pathCoords = [startLoc, endLoc]
    const polyline = L.polyline(pathCoords, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map)

    // Zoom map to fit both markers
    const group = new L.featureGroup([marker1, marker2])
    map.fitBounds(group.getBounds().pad(0.3))

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [pickupLatLng, dropLatLng])

  return (
    <div className="req-details-layout">
      {/* Map Header */}
      <div className="req-details-map-frame">
        <div ref={mapContainerRef} className="leaflet-map-element"></div>
        <div className="map-badge-overlay font-semibold">Route Preview</div>
      </div>

      {/* Main Details Panel */}
      <div className="req-details-panel">
        
        {/* Customer Header */}
        <div className="req-details-cust-card glass-panel">
          <div className="req-details-cust-info">
            <img src={customerAvatar} alt={customerName} className="req-cust-avatar-large" />
            <div>
              <h3 className="req-cust-name-title">{customerName}</h3>
            </div>
          </div>
          <div className="req-details-price">
            <span className="price-label">Trip Fare</span>
            <span className="price-val">₹{Number(fare || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Timeline */}
        <Card className="req-details-timeline-card">
          <div className="timeline-row">
            <div className="timeline-node green"></div>
            <div className="timeline-text">
              <span className="timeline-lbl">Pickup Address</span>
              <p className="timeline-address">{pickup}</p>
            </div>
          </div>
          <div className="timeline-row-line"></div>
          <div className="timeline-row">
            <div className="timeline-node indigo"></div>
            <div className="timeline-text">
              <span className="timeline-lbl">Dropoff Address</span>
              <p className="timeline-address">{drop}</p>
            </div>
          </div>
        </Card>

        {/* Ride Stats Grid */}
        <div className="req-stats-row">
          <Card className="req-stat-box">
            <FiNavigation className="stat-box-icon text-secondary" />
            <span className="stat-box-lbl">Distance</span>
            <span className="stat-box-val">{distance}</span>
          </Card>
          <Card className="req-stat-box">
            <FiClock className="stat-box-icon text-secondary" />
            <span className="stat-box-lbl">Duration</span>
            <span className="stat-box-val">{duration}</span>
          </Card>
        </div>

        {/* Fare summary. The dispatch payload carries only the trip total --
            there is no per-component breakdown to show, and the figures that
            used to sit here (base rate, distance rate, a 1.25x "surge") were
            fixed percentages of the total, not anything the backend sent. */}
        <Card className="req-details-breakdown-card">
          <div className="breakdown-rows">
            <div className="breakdown-row-total">
              <span>Trip Fare</span>
              <span className="text-primary">₹{Number(fare || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="payout-type-indicator">
            <FiCreditCard />
            <span>Collect from the customer at drop-off (cash or UPI)</span>
          </div>
        </Card>

        {/* Action controls */}
        <div className="req-details-actions">
          <Button variant="secondary" onClick={onDecline} size="lg" className="flex-1">
            Pass Request
          </Button>
          <Button variant="primary" onClick={onAccept} size="lg" className="flex-2">
            Accept & Connect
          </Button>
        </div>

      </div>
    </div>
  )
}
export default RequestDetails
