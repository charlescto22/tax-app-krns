/**
 * Optional Cloud Functions for privileged password operations.
 * Deploy with: firebase deploy --only functions
 *
 * adminSetTemporaryPassword — sets Auth password via Admin SDK (not possible from client).
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const adminSetTemporaryPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const caller = await admin.firestore().collection("users").doc(context.auth.uid).get();
  if (!caller.exists || caller.data()?.role !== "administrator") {
    throw new functions.https.HttpsError("permission-denied", "Administrators only.");
  }

  const { uid, password } = data || {};
  if (!uid || !password || String(password).length < 8) {
    throw new functions.https.HttpsError("invalid-argument", "uid and password (8+ chars) required.");
  }

  await admin.auth().updateUser(uid, { password: String(password) });
  await admin.firestore().collection("users").doc(uid).set(
    {
      mustChangePassword: true,
      passwordUpdatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  await admin.firestore().collection("passwordAdminActions").add({
    type: "temp_password",
    targetUid: uid,
    requestedBy: context.auth.uid,
    createdAt: new Date().toISOString(),
    status: "completed_via_function",
  });

  return { ok: true };
});
