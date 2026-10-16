/* Service worker de Nuuf : reçoit les notifications push. Aucun cache : les données financières restent toujours à jour. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/** Seuls les chemins internes sont suivis : jamais d'adresse externe venue d'un message. */
const cheminInterne = (v) => (typeof v === "string" && /^\/(?!\/)[\w\-/?=&%.]*$/.test(v) ? v : "/notifications");

self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = {};
  }
  const titre = typeof d.titre === "string" && d.titre ? d.titre.slice(0, 80) : "Nuuf";
  event.waitUntil(
    self.registration.showNotification(titre, {
      body: typeof d.texte === "string" ? d.texte.slice(0, 200) : "",
      icon: "/icons/icone-192.png",
      badge: "/icons/icone-192.png",
      tag: typeof d.tag === "string" ? d.tag.slice(0, 60) : undefined,
      data: { lien: cheminInterne(d.lien) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const lien = cheminInterne(event.notification.data && event.notification.data.lien);
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) {
        if ("focus" in f && "navigate" in f) return f.navigate(lien).then(() => f.focus());
      }
      return self.clients.openWindow(lien);
    }),
  );
});
