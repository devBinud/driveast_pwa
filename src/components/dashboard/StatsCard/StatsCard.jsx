import React from 'react'
import { FiTrendingUp, FiAward, FiNavigation } from 'react-icons/fi'
import { useDriverStatus } from '../../../hooks/useDriverStatus'
import { useAuth } from '../../../hooks/useAuth'
import { Card } from '../../common/Card/Card'
import './StatsCard.css'

export const StatsCard = () => {
  const { todayEarnings, completedTripsCount } = useDriverStatus()
  const { user } = useAuth()

  const stats = [
    {
      label: 'Trips Completed',
      value: completedTripsCount,
      icon: FiNavigation,
      color: 'blue'
    },
    {
      label: 'Rating',
      value: user?.rating ? user.rating.toFixed(2) : '0.00',
      icon: FiAward,
      color: 'gold'
    }
  ]

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="stat-card-item" padding="md">
            <div className={`stat-icon-container ${stat.color}`}>
              <Icon />
            </div>
            <div className="stat-details">
              <span className="stat-label">{stat.label}</span>
              <h4 className="stat-value">{stat.value}</h4>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
export default StatsCard
