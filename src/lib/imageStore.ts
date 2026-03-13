/**
 * DualDeer Image Store
 * Stores product images as base64 in IndexedDB — free, no cloud required.
 * Falls back to localStorage for small images.
 */

const DB_NAME = "dualdeer_images";
const DB_VERSION = 1;
const STORE_NAME = "images";

type ImageRecord = { id: string; dataUrl: string; name: string; createdAt: number };

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE_NAME)) {
        d.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => { db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export async function saveImage(file: File): Promise<string> {
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const dataUrl = await fileToDataUrl(file);
  const record: ImageRecord = { id, dataUrl, name: file.name, createdAt: Date.now() };
  
  try {
    const d = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = d.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback to localStorage if IndexedDB fails
    try {
      localStorage.setItem(`dd_img_${id}`, dataUrl);
    } catch { /* ignore */ }
  }
  
  return id;
}

export async function getImage(id: string): Promise<string | null> {
  if (!id) return null;
  // If it's already a data URL or regular URL, return as-is
  if (id.startsWith("data:") || id.startsWith("http") || id.startsWith("/")) return id;
  
  try {
    const d = await getDB();
    const record = await new Promise<ImageRecord | undefined>((resolve, reject) => {
      const tx = d.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (record) return record.dataUrl;
  } catch { /* ignore */ }
  
  // Fallback check localStorage
  return localStorage.getItem(`dd_img_${id}`) || null;
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const d = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = d.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* ignore */ }
  localStorage.removeItem(`dd_img_${id}`);
}

export async function getAllImages(): Promise<ImageRecord[]> {
  try {
    const d = await getDB();
    return new Promise<ImageRecord[]>((resolve, reject) => {
      const tx = d.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Sync utils for components that need to render image URLs reactively
const imageCache = new Map<string, string>();

export function getCachedImage(id: string): string | null {
  if (!id) return null;
  if (id.startsWith("data:") || id.startsWith("http") || id.startsWith("/")) return id;
  return imageCache.get(id) || null;
}

export async function preloadImage(id: string): Promise<string | null> {
  if (!id) return null;
  if (id.startsWith("data:") || id.startsWith("http") || id.startsWith("/")) return id;
  if (imageCache.has(id)) return imageCache.get(id)!;
  const url = await getImage(id);
  if (url) imageCache.set(id, url);
  return url;
}
