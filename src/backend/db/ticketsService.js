// src/backend/db/ticketsService.js
import { db } from "../firebase/firebase.js";
import {
  addDoc, collection, doc, getDoc, getDocs, query, where,
  serverTimestamp, updateDoc
} from "firebase/firestore";
import { newTicket } from "../../models/Ticket.js";

const TICKETS = "tickets";

/**
 * Crea un ticket compatible con reglas:
 * - Logueado: userId = uid, guest = false/ausente
 * - Invitado: userId = null, guest = true
 * - status: "pendiente"
 */
export async function createTicket({
  userId = null,
  items,
  total,
  contactEmail = null,
  guest = false,          // <- NUEVO: respeta lo que manda Checkout
  status = "pendiente",   // <- NUEVO: default alineado con rules
}) {
  // Tu modelo puede inicializar varios campos; lo usamos como base:
  const base = newTicket({ userId, items, total, contactEmail });

  // Ensamblamos el doc final garantizando campos exigidos por rules
  const docData = {
    ...base,
    userId: userId ?? null,
    guest: !!guest,
    status: status || "pendiente",
    items: Array.isArray(items) ? items : [],
    total: Number(total || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, TICKETS), docData);
  // Devolvemos lo mínimo necesario para navegación
  return { id: ref.id };
}

export async function getTicketById(id) {
  const snap = await getDoc(doc(db, TICKETS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function listTicketsByUser(userId) {
  const q = query(collection(db, TICKETS), where("userId", "==", userId));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function adminListTickets() {
  const snaps = await getDocs(collection(db, TICKETS));
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTicket(id, updates) {
  await updateDoc(doc(db, TICKETS, id), { ...updates, updatedAt: serverTimestamp() });
}

export async function updateTicketStatus(id, status) {
  return updateTicket(id, { status });
}
