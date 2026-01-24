/**
 * Web Push Helper Functions
 *
 * Provides utilities for service worker registration and push subscription
 * using the Web Push API and VAPID public key from environment variables.
 */

/**
 * Convert a base64url-encoded VAPID public key to a Uint8Array
 * Required for the `applicationServerKey` parameter in pushManager.subscribe()
 *
 * @param base64String - Base64url-encoded VAPID public key
 * @returns Uint8Array representation of the key
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // Add padding if needed
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
 * Register the service worker for push notifications
 *
 * @returns ServiceWorkerRegistration if successful, null if not available or already registered
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Guard against non-browser environments
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      {
        scope: '/',
      },
    )
    console.log('Service Worker registered successfully:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Subscribe to push notifications
 *
 * @param registration - ServiceWorkerRegistration from registerServiceWorker()
 * @returns PushSubscription if successful
 * @throws Error if subscription fails or VAPID key is not configured
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> {
  // Guard against non-browser environments
  if (typeof window === 'undefined') {
    throw new Error(
      'subscribeToPush can only be called in a browser environment',
    )
  }

  const publicKeyString = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY
  if (!publicKeyString) {
    throw new Error('VITE_WEB_PUSH_PUBLIC_KEY environment variable is not set')
  }

  const applicationServerKey = urlBase64ToUint8Array(
    publicKeyString,
  ) as BufferSource

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
    console.log('Push subscription successful:', subscription)
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    throw error
  }
}

/**
 * Unsubscribe from push notifications
 *
 * @param subscription - PushSubscription to unsubscribe from
 * @returns true if unsubscription was successful, false otherwise
 */
export async function unsubscribeFromPush(
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    const success = await subscription.unsubscribe()
    if (success) {
      console.log('Push unsubscription successful')
    } else {
      console.warn('Push unsubscription returned false')
    }
    return success
  } catch (error) {
    console.error('Push unsubscription failed:', error)
    return false
  }
}
