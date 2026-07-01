import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component scrolls the window and any active scrollable container
 * (.scroll-container) to the top whenever navigation/route changes.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // Reset scroll position on scroll containers (which handle layout scrolls in PWAs)
    const scrollContainers = document.querySelectorAll('.scroll-container')
    scrollContainers.forEach((container) => {
      container.scrollTop = 0
      container.scrollLeft = 0
    })
  }, [pathname])

  return null
}

export default ScrollToTop
