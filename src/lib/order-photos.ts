const DB_NAME = "prezent3d-order-photos";
const STORE_NAME = "files";
const RECORD_KEY = "current-order";

export function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readOrderPhotos(): Promise<File[]> {
  const db = await openPhotoDatabase();
  try {
    return await new Promise<File[]>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(RECORD_KEY);
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result as File[] : []);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function saveOrderPhotos(files: File[]): Promise<void> {
  const db = await openPhotoDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(files, RECORD_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}