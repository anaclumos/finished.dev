self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || "Finished.dev";
  const options = {
    body: payload.body || "You have a new notification.",
    icon: payload.icon || "/favicon.ico",
    data: payload.url || "/dashboard",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data || "/dashboard";

  event.waitUntil(self.clients.openWindow(targetUrl));
});
