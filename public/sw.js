const CACHE_NAME = "peringatan-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
		)
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (url.pathname.startsWith("/api/")) {
		event.respondWith(
			fetch(request).catch(() => new Response(JSON.stringify({ error: "Tidak ada koneksi" }), {
				headers: { "Content-Type": "application/json" },
				status: 503,
			}))
		);
		return;
	}

	event.respondWith(
		caches.match(request).then((cached) => {
			const fetchPromise = fetch(request).then((response) => {
				if (response.ok) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
				}
				return response;
			});
			return cached || fetchPromise;
		})
	);
});

const DB_NAME = "peringatan-db";
const DB_VERSION = 1;
const STORE_NAME = "preferences";

function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function setPreference(key, value) {
	const db = await openDb();
	const tx = db.transaction(STORE_NAME, "readwrite");
	tx.objectStore(STORE_NAME).put(value, key);
	return new Promise((resolve, reject) => {
		tx.oncomplete = resolve;
		tx.onerror = () => reject(tx.error);
	});
}

async function getPreference(key) {
	const db = await openDb();
	const tx = db.transaction(STORE_NAME, "readonly");
	const req = tx.objectStore(STORE_NAME).get(key);
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

self.addEventListener("push", (event) => {
	const payload = event.data?.json() ?? {};
	const title = payload.title || "Peringatan Cuaca";
	const options = {
		body: payload.body || "Ada peringatan cuaca baru untuk pantai Anda.",
		icon: "/icon-192x192.png",
		badge: "/icon-72x72.png",
		tag: payload.tag || "default",
		data: {
			url: payload.url || "/",
			beach: payload.beach || "",
		},
		vibrate: [100, 50, 100],
	};
	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const url = event.notification.data?.url || "/";
	event.waitUntil(
		self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url.includes(url) && "focus" in client) {
					return client.focus();
				}
			}
			return self.clients.openWindow(url);
		})
	);
});

self.addEventListener("pushsubscriptionchange", (event) => {
	event.waitUntil(
		(async () => {
			const subscription = await self.registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: await getPreference("vapidKey"),
			});
			const beach = await getPreference("beach");
			await fetch("/api/push/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subscription: subscription.toJSON(), beach_location: beach }),
			});
		})()
	);
});