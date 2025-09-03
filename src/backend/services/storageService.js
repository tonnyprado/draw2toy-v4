// /src/services/storageService.js
// Bandera: si es false, no sube nada y retorna null.
const STORAGE_ENABLED = import.meta.env.VITE_STORAGE_ENABLED === "true";

// Útil por si quieres revisar en otras partes
export function isStorageEnabled() {
  return STORAGE_ENABLED;
}

/**
 * Sube un archivo a Firebase Storage y regresa { url, path }.
 * Si STORAGE_ENABLED=false, devuelve null sin fallar.
 * @param {File|Blob} file
 * @param {string} pathHint Subcarpeta sugerida, p.ej. "custom-toys"
 * @returns {Promise<{url:string, path:string} | null>}
 */
export async function uploadDesign(file, pathHint = "") {
  if (!STORAGE_ENABLED) return null;

  if (!file) {
    throw new Error("[uploadDesign] file inválido");
  }

  // Carga perezosa de SDK para no inflar el bundle si está apagado
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { app } = await import("../firebase/firebase.js"); // asegúrate de exportar { app } desde src/firebase.js

  const storage = getStorage(app);
  const uid = (await getCurrentUidSafe()) || "anon";

  // Nombre de archivo seguro
  const originalName = (file.name || `design-${Date.now()}`);
  const fileName = sanitizeFileName(originalName);
  const folder = sanitizePathSegment(pathHint || "drafts");
  const path = `uploads/${uid}/${folder}/${fileName}`;

  // Content-Type seguro (HEIC/HEIF y fallback)
  const contentType = sniffContentType(file);

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType });
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

// ---- Helpers ----
async function getCurrentUidSafe() {
  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    return auth?.currentUser?.uid || null;
  } catch {
    return null;
  }
}

function sanitizeFileName(name) {
  // quita caracteres raros, limita longitud, preserva extensión si existe
  const parts = String(name).split(".");
  const ext = parts.length > 1 ? "." + parts.pop().toLowerCase() : "";
  const base = parts.join(".").replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";
  return base + ext;
}

function sanitizePathSegment(seg) {
  return String(seg).replace(/[^a-zA-Z0-9/_\-]+/g, "_").replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

function sniffContentType(file) {
  const type = (file.type || "").toLowerCase();
  if (type) return type;

  // Si el navegador no proporciona type (pasa a veces con HEIC)
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".heif")) return "image/heif";
  if (name.endsWith(".png"))  return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}
