import api from './api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// PushManager.subscribe() needs the VAPID public key as a raw Uint8Array,
// not the base64url string the backend/env var carries it as.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const registerSubscription = async () => {
  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
  }

  const json = subscription.toJSON()
  await api.post('/driver/me/push-subscriptions', {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }
  })
}

export const pushNotificationService = {
  /**
   * Requests notification permission and registers this device with the backend
   * so it can receive ride requests / cancellations even while backgrounded or closed.
   * Only call this from a direct user gesture (e.g. a button's onClick) -- browsers
   * (Chrome especially) detect permission prompts fired without one and start
   * silently auto-blocking future prompts for the whole site instead of showing them.
   * Silently no-ops if unsupported or misconfigured -- push is a background
   * enhancement, never a login blocker.
   */
  async subscribe() {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VITE_VAPID_PUBLIC_KEY is not set; skipping push subscription')
      return
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      await registerSubscription()
    } catch (err) {
      console.warn('Push subscription failed:', err)
    }
  },

  /**
   * Re-registers the push subscription on app load/login WITHOUT ever prompting --
   * a no-op unless permission was already granted in a past explicit subscribe()
   * call. Keeps the backend's subscription record fresh (e.g. after the browser
   * rotated the push endpoint) without risking the auto-block behavior above.
   */
  async subscribeSilently() {
    if (!VAPID_PUBLIC_KEY) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission !== 'granted') return

    try {
      await registerSubscription()
    } catch (err) {
      console.warn('Push re-subscription failed:', err)
    }
  },

  /**
   * Unsubscribes this device both from the browser's push service and the backend.
   * Must be called while the auth token is still valid (i.e. before it's cleared),
   * since removing the subscription record is an authenticated call.
   */
  async unsubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return

      const endpoint = subscription.endpoint
      await subscription.unsubscribe()
      await api.post('/driver/me/push-subscriptions/unsubscribe', { endpoint })
    } catch (err) {
      console.warn('Push unsubscribe failed:', err)
    }
  }
}

export default pushNotificationService
