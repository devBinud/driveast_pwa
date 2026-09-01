import React, { useState, useEffect } from 'react'
import { useTripStore } from '../../store/tripStore'
import { TripCard } from '../../components/trips/TripCard/TripCard'
import { TripCardSkeleton } from '../../components/trips/TripCard/TripCardSkeleton'
import { EmptyState } from '../../components/common/EmptyState/EmptyState'
import { Card } from '../../components/common/Card/Card'
import { Skeleton } from '../../components/common/Skeleton/Skeleton'
import './Trips.css'

export const Trips = () => {
  const { trips, fetchTripsHistory, isLoadingTrip } = useTripStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTripsHistory()
  }, [])

  // Only skeleton the very first load -- once trips are in the store, a
  // background refetch shouldn't yank already-rendered cards away.
  const isInitialLoading = isLoadingTrip && trips.length === 0

  const filteredTrips = trips.filter((t) => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const completedTrips = trips.filter((t) => String(t.status).toLowerCase() === 'completed')

  const totalEarnings = completedTrips.reduce((sum, t) => sum + (Number(t.fare) || 0), 0)
  const completedCount = completedTrips.length

  const cashEarnings = completedTrips
    .filter((t) => String(t.paymentMethod).toUpperCase() === 'CASH')
    .reduce((sum, t) => sum + (Number(t.fare) || 0), 0)

  const onlineEarnings = completedTrips
    .filter((t) => String(t.paymentMethod).toUpperCase() !== 'CASH')
    .reduce((sum, t) => sum + (Number(t.fare) || 0), 0)

  const formatCurrency = (val) => {
    const num = Number(val) || 0
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="page-container animate-fade-in trips-page-container">
      <div>
        <h2>Driver Wallet & Trip History</h2>
        <p className="trips-sub-label">Review your historical ride performance and past collections</p>
      </div>

      {/* Summary card (2x2 Grid) */}
      <Card className="trips-summary-card" padding="none" style={{ marginTop: 'var(--spacing-md)' }}>
        <div className="summary-col">
          <span className="summary-col-lbl">Total Revenue</span>
          {isInitialLoading ? <Skeleton className="skel-summary-val" /> : <h3 className="summary-col-val">{formatCurrency(totalEarnings)}</h3>}
        </div>
        <div className="summary-col">
          <span className="summary-col-lbl">Cash Collected</span>
          {isInitialLoading ? <Skeleton className="skel-summary-val" /> : <h3 className="summary-col-val text-success">{formatCurrency(cashEarnings)}</h3>}
        </div>
        <div className="summary-col">
          <span className="summary-col-lbl">Online Settled</span>
          {isInitialLoading ? <Skeleton className="skel-summary-val" /> : <h3 className="summary-col-val">{formatCurrency(onlineEarnings)}</h3>}
        </div>
        <div className="summary-col">
          <span className="summary-col-lbl">Total Trips</span>
          {isInitialLoading ? <Skeleton className="skel-summary-val" /> : <h3 className="summary-col-val">{completedCount} {completedCount === 1 ? 'ride' : 'rides'}</h3>}
        </div>
      </Card>

      {/* History Feed */}
      {isInitialLoading ? (
        <div className="trips-history-list" style={{ marginTop: 'var(--spacing-md)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
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
