import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRequestStore } from '../store/requestStore'
import { useTripStore } from '../store/tripStore'

/**
 * Runs the Accept/Decline flow triggered from a push notification's action
 * buttons (sw.js), which can arrive two ways:
 *  - the app tab is already open: the service worker postMessage()s it directly
 *  - no tab is open: the service worker opens one at /requests?autoAction=...,
 *    and this hook picks the action up from the URL on mount
 * Both paths converge on the same handler so a notification tap behaves
 * identically whether it found the app running or had to launch it.
 */
export const useBackgroundRequestActions = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const acceptRequest = useRequestStore((state) => state.acceptRequest)
  const declineRequest = useRequestStore((state) => state.declineRequest)
  const fetchPendingRequests = useRequestStore((state) => state.fetchPendingRequests)
  const setAssignedTrip = useTripStore((state) => state.setAssignedTrip)
  const handledRef = useRef(new Set())

  const runAction = async (action, requestId) => {
    if (!requestId || handledRef.current.has(requestId)) return
    handledRef.current.add(requestId)

    if (action === 'decline') {
      await declineRequest(requestId)
      toast('Ride request declined', { icon: '👋' })
      return
    }

    if (action === 'accept') {
      try {
        // A notification tap can launch a brand-new tab before the store has ever
        // fetched pending requests -- hydrate it first so the trip screen gets real
        // pickup/drop/fare details instead of just the bare request id.
        let pending = useRequestStore.getState().requests.find((r) => r.id === requestId)
        if (!pending) {
          const fetched = await fetchPendingRequests()
          pending = fetched.find((r) => r.id === requestId)
        }
        const result = await acceptRequest(requestId)
        setAssignedTrip({ ...(pending || { id: requestId }), assignmentId: result?.assignment_id })
        toast.success('Ride accepted')
        navigate('/trips/assigned')
      } catch (err) {
        toast.error(err?.message || 'Could not accept this ride -- it may have expired or already been taken.')
      }
    }
  }

  // Path 1: app tab already open when the notification action was tapped
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event) => {
      const data = event.data
      if (data?.type === 'SW_REQUEST_ACTION') {
        runAction(data.action, data.requestId)
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [])

  // Path 2: service worker had to open a fresh tab for the action
  useEffect(() => {
    const action = searchParams.get('autoAction')
    const requestId = searchParams.get('requestId')
    if (action && requestId) {
      runAction(action, requestId)
      const next = new URLSearchParams(searchParams)
      next.delete('autoAction')
      next.delete('requestId')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useBackgroundRequestActions
