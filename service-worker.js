const CACHE_NAME = 'boba-lab-cache-v1';
const OFFLINE_ASSETS = [
    './',
    './index.html',
    './about.html',
    './contact.html',
    './order.html',
    './404.html',
    './style.css',
    './script.js',
    './Images/AboutUs.webp',
    './Images/Banner1.webp',
    './Images/Banner2.webp',
    './Images/Banner3.webp',
    './Images/BrownSugar.webp',
    './Images/Caramel.webp',
    './Images/GreenMilk.webp',
    './Images/Houjicha.webp',
    './Images/Icon.ico',
    './Images/Logo.webp',
    './Images/Lychee.webp',
    './Images/Mango.webp',
    './Images/Matcha.webp',
    './Images/Strawberry.webp',
    './Images/Taro.webp'
];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(
            OFFLINE_ASSETS.map(asset => new Request(asset, { cache: 'reload' }))
        );
    })());
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

async function staleWhileRevalidate(event) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);

    const fetchPromise = fetch(event.request)
        .then(networkResponse => {
            if (
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type !== 'opaque'
            ) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => null);

    if (cachedResponse) {
        event.waitUntil(fetchPromise);
        return cachedResponse;
    }

    const networkResponse = await fetchPromise;
    if (networkResponse) {
        return networkResponse;
    }

    throw new Error('Network request failed and no cache entry found.');
}

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.match('./index.html');
            }
        })());
        return;
    }

    event.respondWith(staleWhileRevalidate(event));
});