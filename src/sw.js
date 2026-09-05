import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.skipWaiting()
self.addEventListener('activate', () => self.clients.claim())

// Background push delivery -- this is what lets a ride request or cancellation
// reach the driver even when the PWA tab is backgrounded or fully closed, which
// a plain WebSocket message (see src/services/websocketService.js) cannot do.
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch (e) {
    payload = { title: 'Driveast Partner', body: event.data.text() }
  }

  const title = payload.title || 'Driveast Partner'
  const isNewRequest = payload.data?.type === 'new_request'
  const options = {
    body: payload.body || '',
    icon: '/logo192.png',
    // Android renders this using ONLY its alpha channel (a plain white
    // silhouette on a system-chosen circle) -- favicon-32x32.png used to be
    // used here, but it's a fully opaque image with zero transparency, so the
    // "silhouette" was just a solid blank blob. This is a purpose-made
    // transparent-background glyph so the mask actually has a shape to show.
    badge: '/notification-badge-d.png',
    // tag + renotify: a second "new_request" arriving while the first is still
    // showing replaces it (rather than being silently dropped) and re-alerts --
    // ride requests expire within minutes, so the driver must see each one.
    tag: payload.data?.type || 'driveast-notification',
    renotify: true,
    // Heavy, attention-grabbing driver alert vibration (500ms buzz, 200ms pause, repeat 3 times)
    vibrate: isNewRequest ? [500, 200, 500, 200, 500, 200, 500] : [200, 100, 200],
    data: payload.data || {},
    // Ride offers shouldn't auto-dismiss -- the driver needs to see and act on
    // them even if the phone screen is off when it arrives.
    requireInteraction: isNewRequest
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data || {}
  const isNewRequest = data.type === 'new_request'

  event.notification.close()

  const targetPath = isNewRequest ? '/requests' : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c)
      // Only steer to targetPath when launching a fresh tab. Force-navigating an
      // ALREADY OPEN tab here used to yank a driver mid-trip (e.g. on the Payment
      // or OTP screen) straight to the Requests list, wiping out their in-progress
      // trip view for no reason other than "some notification was tapped" -- the
      // open tab already has full app state and its own routing; just bring it to
      // the front and let the driver keep doing what they were doing.
      if (existing) {
        return existing.focus()
      }
      return self.clients.openWindow(targetPath)
    })
  )
})
