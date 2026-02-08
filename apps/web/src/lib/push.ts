/**
 * Web Push notification utilities for finished.dev
 *
 * Uses subscription.toJSON() for key extraction (base64url encoding)
 * matching the format expected by the web-push library.
 */

const SW_PATH = '/sw.js'

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    window.isSecureContext
  )
}

/**
 * Get the current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Convert a URL-safe base64 string to a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    return await navigator.serviceWorker.register(SW_PATH)
  } catch {
    return null
  }
}

/**
 * Subscribe to push notifications.
 * Explicitly registers SW, unsubscribes any existing subscription,
 * then creates a fresh one. Returns keys via toJSON() (base64url).
 */
export async function subscribeToPush(): Promise<{
  endpoint: string
  p256dh: string
  auth: string
} | null> {
  const publicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY
  if (!publicKey) {
    console.error('[Push] VAPID public key not configured')
    return null
  }

  const registration = await registerServiceWorker()
  if (!registration) {
    return null
  }

  await navigator.serviceWorker.ready

  try {
    // Unsubscribe existing before creating new (prevents stale subscriptions)
    const existing = await registration.pushManager.getSubscription()
    if (existing) {
      await existing.unsubscribe()
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })

    // Use toJSON() for base64url-encoded keys (matches web-push expectations)
    const json = subscription.toJSON()
    if (json.endpoint && json.keys) {
      return {
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh ?? '',
        auth: json.keys.auth ?? '',
      }
    }

    return null
  } catch (error) {
    console.error('[Push] Failed to subscribe:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
    }

    return false
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error)
    return false
  }
}
