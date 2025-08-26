import { db } from "../firebase/firebase.js";
import {
  addDoc, collection, doc, getDoc, getDocs, query, where,
  serverTimestamp, updateDoc
} from "firebase/firestore";
import { newTicket } from "../../models/Ticket.js";

const TICKETS = "tickets";

export async function createTicket({ userId = null, items, total, contactEmail = null }) {
  const base = newTicket({ userId, items, total, contactEmail });
  const payload = { ...base, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const ref = await addDoc(collection(db, TICKETS), payload);
  return { id: ref.id, ...base };
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

// Nuevo: actualizar campos arbitrarios de un ticket
export async function updateTicket(id, updates) {
  await updateDoc(doc(db, TICKETS, id), { ...updates, updatedAt: serverTimestamp() });
}

// Conserva si te sirve para cambios de estado rápidos
export async function updateTicketStatus(id, status) {
  return updateTicket(id, { status });
}
