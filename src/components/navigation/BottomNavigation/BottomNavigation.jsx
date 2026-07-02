import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiCompass, FiMapPin, FiUser } from 'react-icons/fi'
import { useRequestStore } from '../../../store/requestStore'
import { useTripStore } from '../../../store/tripStore'
import './BottomNavigation.css'

export const BottomNavigation = () => {
  const location = useLocation()
  const requests = useRequestStore((state) => state.requests)
  const currentTrip = useTripStore((state) => state.currentTrip)
  const activePath = location.pathname

  const navItems = [
    { label: 'Home', path: '/', icon: FiHome },
    { label: 'Rides', path: '/requests', icon: FiCompass, badge: requests.length > 0 ? requests.length : null },
    { label: 'History', path: '/trips', icon: FiMapPin },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ]

  return (
    <nav className="bottom-navigation">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePath === item.path || (item.path !== '/' && activePath.startsWith(item.path))
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="bottom-nav-icon-wrapper">
                <Icon className="bottom-nav-icon" />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="bottom-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
export default BottomNavigation
