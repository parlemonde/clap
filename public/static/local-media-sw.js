/* global self, indexedDB, Response, URL */

const DATABASE_NAME = 'clap-local-media';
const DATABASE_VERSION = 1;
const STORE_NAME = 'media';
const LOCAL_MEDIA_URL_PREFIX = '/local-media/';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(LOCAL_MEDIA_URL_PREFIX)) {
        return;
    }

    event.respondWith(getLocalMediaResponse(url.pathname));
});

async function getLocalMediaResponse(pathname) {
    const id = pathname.slice(LOCAL_MEDIA_URL_PREFIX.length);
    const record = await getLocalMediaRecord(id);
    if (!record) {
        return new Response('Local media not found', { status: 404 });
    }

    return new Response(record.blob, {
        headers: {
            'Content-Type': record.mimeType || record.blob.type || 'application/octet-stream',
            'Content-Length': String(record.size || record.blob.size),
            'Cache-Control': 'no-store',
        },
    });
}

async function getLocalMediaRecord(id) {
    const database = await openDatabase();
    try {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        return await requestToPromise(store.get(id));
    } finally {
        database.close();
    }
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onerror = () => {
            reject(request.error || new Error('Unable to open local media database.'));
        };
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onerror = () => {
            reject(request.error || new Error('Local media database request failed.'));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}
