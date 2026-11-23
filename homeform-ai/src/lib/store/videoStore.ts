"use client";
/**
 * Keeps analysed videos ON THIS DEVICE ONLY (IndexedDB) so the user can replay them with the
 * skeleton overlay. Videos are never uploaded. Users can delete them at any time.
 */
import type { PoseFrame } from "@/lib/analysis/types";

const DB = "homeform", STORE = "videos", VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB indisponible"));
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface LocalVideo { blob: Blob; frames: PoseFrame[]; savedAt: string }

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

/** Compact frames: keep 3 decimals to limit storage. */
function compact(frames: PoseFrame[]): PoseFrame[] {
  const q = (n: number) => Math.round(n * 1000) / 1000;
  return frames.map((f) => ({ t: q(f.t), landmarks: f.landmarks ? f.landmarks.map((l) => ({ x: q(l.x), y: q(l.y), z: 0, visibility: q(l.visibility) })) : null }));
}

export async function saveVideo(id: string, blob: Blob, frames: PoseFrame[]) {
  try { await tx("readwrite", (s) => s.put({ blob, frames: compact(frames), savedAt: new Date().toISOString() } satisfies LocalVideo, id)); return true; } catch { return false; }
}
export async function getVideo(id: string): Promise<LocalVideo | null> {
  try { return ((await tx("readonly", (s) => s.get(id))) as LocalVideo) ?? null; } catch { return null; }
}
export async function deleteVideo(id: string) {
  try { await tx("readwrite", (s) => s.delete(id)); } catch { /* ignore */ }
}
export async function clearVideos() {
  try { await tx("readwrite", (s) => s.clear()); } catch { /* ignore */ }
}
