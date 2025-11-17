self.addEventListener('install', (e) => {
    console.log('Service worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('Service worker activated');
});