"use client";

import { useEffect, useState } from "react";

type PushState = "idle" | "loading" | "enabled" | "denied" | "error";

type SubscriptionPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
};

const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

async function sendSubscription(payload: SubscriptionPayload) {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to save subscription");
  }
}

export default function PushSubscriptionClient() {
  const [status, setStatus] = useState<PushState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!vapidKey) {
      return;
    }

    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => {
          if (subscription) {
            setStatus("enabled");
          }
        })
        .catch(() => {
          setStatus("error");
        });
    }
  }, []);

  const handleSubscribe = async () => {
    setError(null);

    if (!vapidKey) {
      setError("Missing VAPID public key.");
      setStatus("error");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setError("Service workers are not supported in this browser.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const payload: SubscriptionPayload = {
        endpoint: subscription.endpoint,
        p256dh: subscription.toJSON().keys?.p256dh ?? "",
        auth: subscription.toJSON().keys?.auth ?? "",
        userAgent: navigator.userAgent,
      };

      if (!payload.p256dh || !payload.auth) {
        throw new Error("Subscription keys are missing");
      }

      await sendSubscription(payload);
      setStatus("enabled");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unknown error");
      setStatus("error");
    }
  };

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Push Notifications</h2>
      <p className="mt-2">
        Status: {status === "enabled" ? "Enabled" : "Not enabled"}
      </p>
      {status !== "enabled" ? (
        <button className="mt-3 underline" type="button" onClick={handleSubscribe}>
          Enable push notifications
        </button>
      ) : null}
      {status === "denied" ? (
        <p className="mt-2">Permission denied. Enable notifications in browser settings.</p>
      ) : null}
      {error ? <p className="mt-2">{error}</p> : null}
    </section>
  );
}
