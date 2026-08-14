import { useEffect, useRef, useState } from 'react'

const PULL_THRESHOLD = 70 // px of pull needed to release-to-trigger
const MAX_PULL = 100 // damped pull cap, matches native feel

/**
 * Attaches touch-based pull-to-refresh to a scrollable element. Only activates when
 * that element is already scrolled to the top -- otherwise a downward drag is just a
 * normal scroll-up gesture, not a pull.
 */
export const usePullToRefresh = (scrollRef, onRefresh, enabled = true) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const dragging = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !enabled) return undefined

    const handleTouchStart = (e) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
        dragging.current = true
      }
    }

    const handleTouchMove = (e) => {
      if (!dragging.current) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0 && el.scrollTop <= 0) {
        e.preventDefault()
        setPullDistance(Math.min(MAX_PULL, delta * 0.5))
      } else {
        dragging.current = false
        setPullDistance(0)
      }
    }

    const handleTouchEnd = () => {
      if (!dragging.current) return
      dragging.current = false
      setPullDistance((current) => {
        if (current >= PULL_THRESHOLD) {
          setIsRefreshing(true)
          Promise.resolve(onRefresh())
            .catch(() => {})
            .finally(() => {
              setIsRefreshing(false)
              setPullDistance(0)
            })
          return PULL_THRESHOLD
        }
        return 0
      })
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollRef, onRefresh, enabled])

  return { pullDistance, isRefreshing, threshold: PULL_THRESHOLD }
}
