const CACHE_NAME = 'boba-lab-cache-v1';
const OFFLINE_ASSETS = [
    './',
    './index.html',
    './about.html',
    './contact.html',
    './order.html',
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
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
    );
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

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }

                    const clonedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
                    return response;
                })
                .catch(error => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }

                    throw error;
                });
        })
    );
});
