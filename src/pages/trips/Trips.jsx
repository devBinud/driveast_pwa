import React, { useState } from 'react'
import { FiTrendingUp, FiMapPin, FiInbox } from 'react-icons/fi'
import { useTripStore } from '../../store/tripStore'
import { TripCard } from '../../components/trips/TripCard/TripCard'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import { Card } from '../../components/common/Card/Card'
import './Trips.css'

export const Trips = () => {
  const trips = useTripStore((state) => state.trips)
  const [filter, setFilter] = useState('all')

  const filteredTrips = trips.filter((t) => {
    if (filter === 'all') return true
    return t.status === filter
  })

  // Calculate stats summary
  const totalEarnings = trips.reduce((sum, t) => sum + t.fare, 0)
  const completedCount = trips.length

  const cashEarnings = trips
    .filter((t) => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.fare, 0)

  const onlineEarnings = trips
    .filter((t) => t.paymentMethod !== 'Cash')
    .reduce((sum, t) => sum + t.fare, 0)

  return (
    <div className="page-container animate-fade-in trips-page-container">
      <div>
        <h2>Trip History</h2>
        <p className="trips-sub-label">Review your historical ride performance</p>
      </div>

      {/* Summary card */}
      <Card className="trips-summary-card" padding="none" style={{ marginTop: 'var(--spacing-md)' }}>
        <div className="summary-col">
          <span className="summary-col-lbl">Total Revenue</span>
          <h3>₹{totalEarnings.toFixed(2)}</h3>
        </div>
        <div className="summary-col-divider"></div>
        <div className="summary-col">
          <span className="summary-col-lbl">Cash Collected</span>
          <h3 className="text-success">₹{cashEarnings.toFixed(2)}</h3>
        </div>
        <div className="summary-col-divider"></div>
        <div className="summary-col">
          <span className="summary-col-lbl">Online Settled</span>
          <h3>₹{onlineEarnings.toFixed(2)}</h3>
        </div>
        <div className="summary-col-divider"></div>
        <div className="summary-col">
          <span className="summary-col-lbl">Total Trips</span>
          <h3>{completedCount} rides</h3>
        </div>
      </Card>

      {/* History Feed */}
      {filteredTrips.length === 0 ? (
        <EmptyState
          title="No Historical Trips"
          description="You haven't completed any driver runs yet. Once you complete your first accepted request, it will appear here."
          type="trips"
        />
      ) : (
        <div className="trips-history-list" style={{ marginTop: 'var(--spacing-md)' }}>
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Trips
