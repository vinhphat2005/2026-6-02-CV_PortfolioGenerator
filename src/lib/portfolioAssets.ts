import {
  MAX_PORTFOLIO_ASSETS,
  MAX_PORTFOLIO_ASSET_BYTES,
  MAX_PORTFOLIO_IMAGE_UPLOAD_BYTES
} from "./securityLimits";
import { getOrCreateLocalSessionId } from "./localSession";

const DB_NAME = "career-forge-assets";
const STORE_NAME = "portfolio-images";
const DB_VERSION = 2;
const SESSION_INDEX = "sessionId";
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type PortfolioAssetRecord = {
  id: string;
  blob: Blob;
  name: string;
  createdAt: number;
  sessionId: string;
};

export function validatePortfolioImageFile(file: Pick<File, "size" | "type">) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Use a PNG, JPEG, or WebP image.");
  }
  if (file.size > MAX_PORTFOLIO_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image is larger than 5 MB.");
  }
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const store = request.result.objectStoreNames.contains(STORE_NAME)
        ? request.transaction?.objectStore(STORE_NAME)
        : request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      if (!store) return;
      if (!store.indexNames.contains(SESSION_INDEX)) {
        store.createIndex(SESSION_INDEX, SESSION_INDEX, { unique: false });
      }
      const sessionId = getOrCreateLocalSessionId();
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const current = cursor.result;
        if (!current) return;
        const value = current.value as Partial<PortfolioAssetRecord>;
        if (!value.sessionId) current.update({ ...value, sessionId });
        current.continue();
      };
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open local image library."));
  });
}

function objectStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
) {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = operation(transaction.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Local image library operation failed."));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
          database.close();
          reject(transaction.error || new Error("Local image library operation failed."));
        };
      })
  );
}

async function compressImage(file: File) {
  validatePortfolioImageFile(file);
  if (file.size <= MAX_PORTFOLIO_ASSET_BYTES) {
    return new Blob([file], { type: file.type });
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to resize image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.84, 0.72, 0.6, 0.48]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.size <= MAX_PORTFOLIO_ASSET_BYTES) return blob;
  }
  throw new Error("Image could not be compressed below 500 KiB.");
}

export async function storePortfolioImage(file: File, sessionId = getOrCreateLocalSessionId()) {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("Local image storage is unavailable.");
  }
  const count = await objectStore<number>("readonly", (store) => store.index(SESSION_INDEX).count(sessionId));
  if (count >= MAX_PORTFOLIO_ASSETS) {
    throw new Error("Local image library is limited to 20 images.");
  }
  const blob = await compressImage(file);
  const id = window.crypto.randomUUID();
  const record: PortfolioAssetRecord = {
    id,
    blob,
    name: file.name.slice(0, 160),
    createdAt: Date.now(),
    sessionId
  };
  await objectStore<IDBValidKey>("readwrite", (store) => store.add(record));
  return id;
}

export async function getPortfolioImage(id: string, sessionId = getOrCreateLocalSessionId()) {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  const record = await objectStore<PortfolioAssetRecord | undefined>("readonly", (store) => store.get(id));
  return record?.sessionId === sessionId ? record.blob : null;
}

export async function deletePortfolioImage(id: string, sessionId = getOrCreateLocalSessionId()) {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const record = await objectStore<PortfolioAssetRecord | undefined>("readonly", (store) => store.get(id));
  if (record?.sessionId === sessionId) {
    await objectStore<undefined>("readwrite", (store) => store.delete(id));
  }
}

export async function clearPortfolioImages(sessionId = getOrCreateLocalSessionId()) {
  if (typeof window === "undefined" || !window.indexedDB) return;
  const keys = await objectStore<IDBValidKey[]>("readonly", (store) => store.index(SESSION_INDEX).getAllKeys(sessionId));
  await Promise.all(keys.map((key) => objectStore<undefined>("readwrite", (store) => store.delete(key))));
}

export async function portfolioImageDataUrl(id: string, sessionId = getOrCreateLocalSessionId()) {
  const blob = await getPortfolioImage(id, sessionId);
  if (!blob) return null;
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Unable to read local image."));
    reader.readAsDataURL(blob);
  });
}
