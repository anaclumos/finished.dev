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

export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) {
    return 'denied'
  }
  return Notification.permission
}

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

export async function subscribeToPush(): Promise<{
  endpoint: string
  p256dh: string
  auth: string
} | null> {
  const publicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY
  if (!publicKey) {
    return null
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  try {
    // Always unsubscribe first — never reuse stale subscriptions
    const existing = await registration.pushManager.getSubscription()
    if (existing) {
      await existing.unsubscribe()
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })

    const json = subscription.toJSON()
    if (!(json.endpoint && json.keys)) {
      return null
    }
    return {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh ?? '',
      auth: json.keys.auth ?? '',
    }
  } catch {
    return null
  }
}
