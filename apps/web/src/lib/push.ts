/**
 * Web Push notification utilities for finished.dev
 *
 * Provides service worker registration, push subscription management,
 * and notification handling using the Web Push API.
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
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
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
 * Request notification permission from the user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications not supported')
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    })
    console.log('[Push] Service worker registered:', registration.scope)
    return registration
  } catch (error) {
    console.error('[Push] Service worker registration failed:', error)
    return null
  }
}

/**
 * Convert a URL-safe base64 string to a Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
 * Get or create a push subscription
 */
export async function subscribeToPush(
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications not supported')
    return null
  }

  // Use env var if no key provided
  const publicKey = vapidPublicKey || import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY
  if (!publicKey) {
    console.error('[Push] VAPID public key not configured')
    return null
  }

  // Check permission
  const permission = await requestPermission()
  if (permission !== 'granted') {
    console.warn('[Push] Notification permission denied')
    return null
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    console.log('[Push] Existing subscription found')
    return subscription
  }

  // Create new subscription
  try {
    const convertedVapidKey = urlBase64ToUint8Array(publicKey)
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey as BufferSource,
    })
    console.log('[Push] New subscription created')
    return subscription
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
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      console.log('[Push] Unsubscribed successfully')
      return true
    }

    return false
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error)
    return false
  }
}

/**
 * Get the current push subscription
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('[Push] Failed to get subscription:', error)
    return null
  }
}

/**
 * Extract subscription keys for server storage
 */
export function extractSubscriptionKeys(subscription: PushSubscription): {
  endpoint: string
  p256dh: string
  auth: string
} {
  const key = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')

  return {
    endpoint: subscription.endpoint,
    p256dh: key ? arrayBufferToBase64(key) : '',
    auth: auth ? arrayBufferToBase64(auth) : '',
  }
}

/**
 * Convert an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Initialize push notifications (register SW + subscribe)
 * Call this on app load to set up push notifications
 */
export async function initializePush(
  onSubscription?: (subscription: PushSubscription) => void
): Promise<void> {
  if (!isPushSupported()) {
    console.warn('[Push] Push notifications not supported in this browser')
    return
  }

  // Register service worker
  await registerServiceWorker()

  // Subscribe to push
  const subscription = await subscribeToPush()

  if (subscription && onSubscription) {
    onSubscription(subscription)
  }
}
