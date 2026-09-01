import React from 'react'
import { Card } from '../../common/Card/Card'
import { Skeleton } from '../../common/Skeleton/Skeleton'
import './TripCard.css'

export const TripCardSkeleton = () => (
  <Card className="trip-card-item" padding="none">
    <div className="trip-card-header">
      <div className="trip-header-meta">
        <Skeleton className="skel-id" />
        <Skeleton className="skel-time" />
      </div>
      <Skeleton className="skel-badge" />
    </div>

    <div className="trip-card-route">
      <div className="trip-route-nodes">
        <span className="trip-node pickup"></span>
        <span className="trip-node-line"></span>
        <span className="trip-node drop"></span>
      </div>
      <div className="trip-route-addresses">
        <Skeleton className="skel-addr skel-addr-1" />
        <Skeleton className="skel-addr skel-addr-2" />
      </div>
    </div>

    <div className="trip-card-footer">
      <Skeleton className="skel-stat" />
      <div className="trip-card-fare">
        <Skeleton className="skel-fare-sub" />
        <Skeleton className="skel-fare-amt" />
      </div>
    </div>
  </Card>
)

export default TripCardSkeleton
