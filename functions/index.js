// functions/index.js
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

setGlobalOptions({ maxInstances: 10 });

initializeApp();

/**
 * ensureAdminClaim (callable)
 * - Requiere usuario autenticado.
 * - Si existe admin_users/{uid}, asigna custom claim { admin: true }.
 * - Devuelve { ok: true/false, reason? }
 */
export const ensureAdminClaim = onCall(async (request) => {
  const authCtx = request.auth;
  if (!authCtx) {
    throw new Error("unauthenticated");
  }

  const uid = authCtx.uid;

  const db = getFirestore();
  const docRef = db.doc(`admin_users/${uid}`);
  const snap = await docRef.get();

  if (!snap.exists) {
    return { ok: false, reason: "not-listed" };
  }

  // Asigna el claim admin:true
  await getAuth().setCustomUserClaims(uid, { admin: true });

  // Marca opcional de auditoría
  await docRef.set(
    { claimAppliedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );

  return { ok: true };
});
