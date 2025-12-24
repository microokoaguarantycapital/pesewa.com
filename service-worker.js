'use strict';

const CACHE_NAME = 'pesewa-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/main.css',
  '/assets/js/app.js',
  '/manifest.json',
  '/pages/countries/index.html',
  '/pages/groups.html',
  '/pages/lending.html',
  '/pages/borrowing.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/qa.html',
  '/pages/blacklist.html',
  '/pages/debt-collectors.html',
  '/pages/ledger.html',
  '/pages/subscriptions.html',
  '/pages/admin.html',
  '/pages/countries/kenya.html',
  '/pages/countries/uganda.html',
  '/pages/countries/tanzania.html',
  '/pages/countries/rwanda.html',
  '/pages/countries/burundi.html',
  '/pages/countries/somalia.html',
  '/pages/countries/south-sudan.html',
  '/pages/countries/ethiopia.html',
  '/pages/countries/congo.html',
  '/pages/countries/nigeria.html',
  '/pages/countries/south-africa.html',
  '/pages/countries/ghana.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with network-first strategy for dynamic content
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML pages, use network-first strategy
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the fetched response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, return offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For static assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // For CSS/JS files, return a fallback
            if (event.request.url.includes('.css')) {
              return new Response('/* Offline fallback */', {
                headers: { 'Content-Type': 'text/css' }
              });
            }
            if (event.request.url.includes('.js')) {
              return new Response('// Offline fallback', {
                headers: { 'Content-Type': 'application/javascript' }
              });
            }
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(submitFormData());
  }
});

async function submitFormData() {
  try {
    const db = await openFormDatabase();
    const forms = await getAllForms(db);
    
    for (const form of forms) {
      const response = await fetch(form.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.data)
      });
      
      if (response.ok) {
        await deleteForm(db, form.id);
        console.log('Form submitted successfully:', form.id);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function openFormDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PesewaForms', 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('forms')) {
        db.createObjectStore('forms', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    
    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}

function getAllForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readonly');
    const store = transaction.objectStore('forms');
    const request = store.getAll();
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

function deleteForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['forms'], 'readwrite');
    const store = transaction.objectStore('forms');
    const request = store.delete(id);
    
    request.onsuccess = function() {
      resolve();
    };
    
    request.onerror = function() {
      reject(request.error);
    };
  });
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Pesewa.com',
    icon: 'assets/images/icon-192x192.png',
    badge: 'assets/images/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pesewa.com', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic sync for updates (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
      event.waitUntil(updateContent());
    }
  });
}

async function updateContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = urlsToCache.map(url => new Request(url));
    
    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.error('Failed to update:', request.url, error);
      }
    }
    
    console.log('Content updated successfully');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}