import { openDB } from 'idb';

async function initDB() {
    const db = await openDB('myAppDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('auth')) {
                db.createObjectStore('auth', { keyPath: 'key' });
            }
        },
    });
    return db; 
}
  
export async function saveToken(token) {
    const db = await initDB();
    const tx = db.transaction('auth', 'readwrite');
    await tx.objectStore('auth').put({ key: 'token', value: token });
    await tx.done;
}


export async function getToken() {
    const db = await initDB();
    const tx = db.transaction('auth', 'readonly');
    const entry = await tx.objectStore('auth').get('token');
    await tx.done;
    return entry?.value;
}