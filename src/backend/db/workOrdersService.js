import { db } from "../firebase/firebase.js";
import {
  collection, doc, getDoc, getDocs, onSnapshot, query, where, orderBy, limit
} from "firebase/firestore";
import { isAdmin, isDigitalDesigner, isPatternDesigner } from "../../utils/roles.js";

const WOS = "workOrders";

export async function getWorkOrderById(id) {
  const snap = await getDoc(doc(db, WOS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function listenWorkOrder(id, cb) {
  return onSnapshot(doc(db, WOS, id), (d) => cb(d.exists() ? { id: d.id, ...d.data() } : null));
}

export async function listWorkOrdersForUser(user) {
  // Maqueta: si tienes asignación por uid úsala; si no, trae últimos 50
  try {
    const col = collection(db, WOS);
    let q = query(col, orderBy("updatedAt", "desc"), limit(50));

    // Si más adelante guardas assignedTo, filtra por rol:
    // if (isDigitalDesigner(user)) q = query(col, where("digital.assignedTo", "==", user.uid));
    // else if (isPatternDesigner(user)) q = query(col, where("pattern.assignedTo", "==", user.uid));

    const snaps = await getDocs(q);
    return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}
