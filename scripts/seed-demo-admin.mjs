#!/usr/bin/env node
/**
 * Seeds users/{uid} for demo.admin@iec-tax.test as administrator.
 * Requires deployed firestore.rules that allow this email to self-bootstrap.
 */
const API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDL6CBC34OHJjR68aYqYrHcYCeFbkzC9Kg";
const PROJECT = process.env.FIREBASE_PROJECT_ID || "tax-app-c410d";
const email = process.env.SEED_ADMIN_EMAIL || "demo.admin@iec-tax.test";
const password = process.env.SEED_ADMIN_PASSWORD || "DemoAdmin@123!";

async function main() {
  const authRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const auth = await authRes.json();
  if (auth.error) {
    throw new Error(`Auth failed: ${auth.error.message}`);
  }

  const uid = auth.localId;
  const token = auth.idToken;
  const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}`;

  const existing = await fetch(docUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (existing.ok) {
    const doc = await existing.json();
    console.log("Admin profile already exists:", doc.fields?.role?.stringValue || "(unknown role)");
    console.log("UID:", uid);
    return;
  }

  const now = new Date().toISOString();
  const body = {
    fields: {
      email: { stringValue: email },
      name: { stringValue: "Demo Administrator" },
      role: { stringValue: "administrator" },
      status: { stringValue: "active" },
      maxDevices: { integerValue: "5" },
      deviceEnforcement: { stringValue: "strict" },
      mustChangePassword: { booleanValue: false },
      ssoEnabled: { booleanValue: false },
      ssoStatus: { stringValue: "none" },
      createdAt: { stringValue: now },
      lastLogin: { stringValue: now },
    },
  };

  const createRes = await fetch(docUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Seed failed (${createRes.status}): ${created.error?.message || JSON.stringify(created)}`);
  }
  console.log("Seeded administrator profile for", email);
  console.log("UID:", uid);
  console.log("Role:", created.fields?.role?.stringValue);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
