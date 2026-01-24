// Service Worker for Web Push notifications
// Handles push events and notification interactions

/**
 * Handle incoming push notifications
 */
self.addEventListener('push', (event) => {
  // Parse the push event data
  let notificationData = {
    title: 'Notification',
    options: {
      badge: '/logo192.png',
      icon: '/logo192.png',
      tag: 'notification',
    },
  }

  // Try to parse JSON payload from push event
  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData.title = payload.title || notificationData.title
      notificationData.options = {
        ...notificationData.options,
        body: payload.body || '',
        data: payload.data || {},
      }
    } catch (e) {
      // If JSON parsing fails, use the raw text as body
      notificationData.options.body = event.data.text()
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options,
    ),
  )
})

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Get the data from the notification
  const data = event.notification.data || {}
  const targetUrl = data.url || '/'

  // Try to focus an existing window or open a new one
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Look for an existing window with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus()
          }
        }
        // If no matching window found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      }),
  )
})

/**
 * Handle notification close events (optional)
 */
self.addEventListener('notificationclose', (event) => {
  // Optional: track notification dismissals
  console.log('Notification closed:', event.notification.tag)
})
