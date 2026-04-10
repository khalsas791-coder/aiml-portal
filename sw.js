const CACHE_NAME = 'neural-v5-cache';
const ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/css/variables.css',
    '/css/ultra.css',
    '/css/neural-bg.css',
    '/js/ui-core.js',
    '/js/data-engine.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
