const CACHE_PREFIX = 'boba-lab-cache-';
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
    './Images/LogoText.webp',
    './Images/Lychee.webp',
    './Images/Mango.webp',
    './Images/Matcha.webp',
    './Images/Strawberry.webp',
    './Images/Taro.webp',
    './Images/Freya.png'
];

let resolvedCacheName;
let cacheNamePromise;

async function deriveCacheName() {
    if (resolvedCacheName) {
        return resolvedCacheName;
    }

    if (!cacheNamePromise) {
        cacheNamePromise = (async () => {
            const registration = self.registration;
            const candidate =
                (registration && (registration.installing || registration.waiting || registration.active)?.scriptURL) ||
                new URL('service-worker.js', self.location.href).toString();

            try {
                if (!self.crypto?.subtle?.digest) {
                    throw new Error('SubtleCrypto digest not available');
                }

                const response = await fetch(candidate, { cache: 'no-store' });
                const buffer = await response.arrayBuffer();
                const digest = await self.crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(digest));
                const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
                resolvedCacheName = `${CACHE_PREFIX}${hashHex.slice(0, 16)}`;
            } catch (error) {
                console.warn('Failed to derive cache name from service worker script.', error);
                const fallbackScope = (self.registration?.scope || self.location.origin).replace(/[^a-z0-9]/gi, '-');
                const suffix = fallbackScope.slice(-20) || 'fallback';
                resolvedCacheName = `${CACHE_PREFIX}${suffix}`;
            }

            return resolvedCacheName;
        })();
    }

    return cacheNamePromise;
}

async function getCacheName() {
    return deriveCacheName();
}

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cacheName = await getCacheName();
        const cache = await caches.open(cacheName);
        await cache.addAll(
            OFFLINE_ASSETS.map(asset => new Request(asset, { cache: 'reload' }))
        );
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheName = await getCacheName();
        const keys = await caches.keys();
        await Promise.all(
            keys.filter(key => key !== cacheName).map(key => caches.delete(key))
        );

        await self.clients.claim();
    })());
});

async function staleWhileRevalidate(event, cacheName) {
    const cache = await caches.open(cacheName);
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

    if (requestURL.pathname.endsWith('service-worker.js')) {
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            const cacheName = await getCacheName();

            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(cacheName);
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

    event.respondWith((async () => {
        const cacheName = await getCacheName();
        return staleWhileRevalidate(event, cacheName);
    })());
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
