// src/services/contactService.js
import { db } from "../firebase/firebase";
import {
  addDoc, collection, serverTimestamp,
  updateDoc, doc
} from "firebase/firestore";

const COL = "contactMessages";
const SUBJECTS = ["general", "pedido", "soporte", "colaboracion"];

export async function addContactMessage({ name, email, subject, orderId, message, source, sourcePath }) {
  const s = SUBJECTS.includes(subject) ? subject : "general";

  const payload = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    subject: s,
    orderId: orderId ? String(orderId).trim() : null,
    message: String(message || "").trim(),
    status: "new",
    source: source || "contact_form",
    sourcePath: sourcePath || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Limpieza básica
  if (!payload.name || !payload.email || !payload.message) {
    throw new Error("Faltan campos requeridos");
  }

  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

export async function updateMessageStatus(id, status, opts = {}) {
  const allowed = ["new", "in_progress", "resolved", "archived"];
  if (!allowed.includes(status)) throw new Error("Estatus inválido");

  await updateDoc(doc(db, COL, id), {
    status,
    internalNote: opts.internalNote || null,
    handledBy: opts.handledBy || null,
    updatedAt: serverTimestamp(),
  });
}
