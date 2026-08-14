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
  const options = {
    body: payload.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    // tag + renotify: a second "new_request" arriving while the first is still
    // showing replaces it (rather than being silently dropped) and re-alerts --
    // ride requests expire within minutes, so the driver must see each one.
    tag: payload.data?.type || 'driveast-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    data: payload.data || {}
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetPath = event.notification.data?.type === 'new_request' ? '/requests' : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c)
      if (existing) {
        if ('navigate' in existing) existing.navigate(targetPath).catch(() => {})
        return existing.focus()
      }
      return self.clients.openWindow(targetPath)
    })
  )
})
