import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { getOrCreateDeviceId, describeDevice } from "./deviceId";
import type { DeviceRecord, ManagedUser, SsoAccessRequest, SsoProvider } from "../types/userAdmin";
import { DEFAULT_MAX_DEVICES } from "../types/userAdmin";
import type { UserRole } from "../App";

export class DeviceLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeviceLimitError";
  }
}

export class AccountInactiveError extends Error {
  constructor(message = "This account has been deactivated. Contact an administrator.") {
    super(message);
    this.name = "AccountInactiveError";
  }
}

export class SsoPendingError extends Error {
  constructor(message = "Your SSO access is pending administrator approval.") {
    super(message);
    this.name = "SsoPendingError";
  }
}

/** Register or refresh this browser as a device; enforce maxDevices when strict. */
export async function registerDeviceForUser(uid: string, profile: Partial<ManagedUser>): Promise<DeviceRecord> {
  const deviceId = getOrCreateDeviceId();
  const enforcement = profile.deviceEnforcement ?? "strict";
  const maxDevices = profile.maxDevices ?? DEFAULT_MAX_DEVICES;
  const devicesRef = collection(db, "users", uid, "devices");
  const snap = await getDocs(devicesRef);
  const devices = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DeviceRecord));
  const existing = devices.find((d) => d.deviceId === deviceId && !d.revoked);
  const now = new Date().toISOString();

  if (existing) {
    await updateDoc(doc(db, "users", uid, "devices", existing.id), { lastSeenAt: now });
    return { ...existing, lastSeenAt: now };
  }

  const activeCount = devices.filter((d) => !d.revoked).length;
  if (enforcement === "strict" && activeCount >= maxDevices) {
    throw new DeviceLimitError(
      `Device limit reached (${maxDevices}). Ask an administrator to revoke an unused device.`
    );
  }

  const record: Omit<DeviceRecord, "id"> = {
    deviceId,
    label: describeDevice(),
    userAgent: navigator.userAgent,
    createdAt: now,
    lastSeenAt: now,
    revoked: false,
  };
  const created = await addDoc(devicesRef, record);
  return { id: created.id, ...record };
}

export async function listUserDevices(uid: string): Promise<DeviceRecord[]> {
  const snap = await getDocs(collection(db, "users", uid, "devices"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as DeviceRecord))
    .sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1));
}

export async function revokeDevice(uid: string, deviceDocId: string, revokedBy: string): Promise<void> {
  await updateDoc(doc(db, "users", uid, "devices", deviceDocId), {
    revoked: true,
    revokedAt: new Date().toISOString(),
    revokedBy,
  });
}

export async function adminSendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
  try {
    await addDoc(collection(db, "passwordAdminActions"), {
      type: "reset_link",
      targetEmail: email,
      requestedBy: auth.currentUser?.uid || "",
      createdAt: new Date().toISOString(),
      status: "completed",
    });
  } catch (e) {
    console.warn("passwordAdminActions audit skipped:", e);
  }
}

export async function markMustChangePassword(uid: string, value: boolean): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    mustChangePassword: value,
    passwordUpdatedAt: new Date().toISOString(),
  });
}

export async function setUserMaxDevices(uid: string, maxDevices: number): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    maxDevices,
    deviceEnforcement: "strict",
  });
}

export async function setUserActiveStatus(uid: string, status: "active" | "inactive"): Promise<void> {
  await updateDoc(doc(db, "users", uid), { status });
}

export async function touchLastLogin(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { lastLogin: new Date().toISOString() });
}

export async function createSsoAccessRequest(input: {
  email: string;
  displayName: string;
  provider: SsoProvider;
  providerUid: string;
  requestedRole?: UserRole;
}): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db, "ssoAccessRequests"),
      where("email", "==", input.email.toLowerCase()),
      where("status", "==", "pending")
    )
  );
  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const ref = await addDoc(collection(db, "ssoAccessRequests"), {
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    provider: input.provider,
    providerUid: input.providerUid,
    requestedAt: new Date().toISOString(),
    status: "pending",
    requestedRole: input.requestedRole || "tax-collector",
  });
  return ref.id;
}

export async function listSsoRequests(): Promise<SsoAccessRequest[]> {
  const snap = await getDocs(collection(db, "ssoAccessRequests"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as SsoAccessRequest))
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
}

export async function approveSsoRequest(
  request: SsoAccessRequest,
  reviewerUid: string,
  linkedUid: string,
  role: UserRole
): Promise<void> {
  await updateDoc(doc(db, "ssoAccessRequests", request.id), {
    status: "approved",
    reviewedBy: reviewerUid,
    reviewedAt: new Date().toISOString(),
    linkedUid,
  });

  const userRef = doc(db, "users", linkedUid);
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    await updateDoc(userRef, {
      ssoEnabled: true,
      ssoProvider: request.provider,
      ssoStatus: "approved",
      ssoSubject: request.providerUid,
      status: "active",
      role,
      name: request.displayName || existing.data().name,
      email: request.email,
    });
  } else {
    await setDoc(userRef, {
      name: request.displayName || request.email.split("@")[0],
      email: request.email,
      role,
      status: "active",
      ssoEnabled: true,
      ssoProvider: request.provider,
      ssoStatus: "approved",
      ssoSubject: request.providerUid,
      maxDevices: DEFAULT_MAX_DEVICES,
      deviceEnforcement: "strict",
      createdAt: new Date().toISOString(),
      lastLogin: "Never",
    });
  }
}

export async function rejectSsoRequest(requestId: string, reviewerUid: string, reason: string): Promise<void> {
  await updateDoc(doc(db, "ssoAccessRequests", requestId), {
    status: "rejected",
    reviewedBy: reviewerUid,
    reviewedAt: new Date().toISOString(),
    rejectReason: reason,
  });
}

/** Record a generated-temp-password admin action (actual Auth update needs Cloud Function). */
export async function recordTempPasswordAction(targetUid: string, targetEmail: string): Promise<void> {
  try {
    await addDoc(collection(db, "passwordAdminActions"), {
      type: "temp_password",
      targetUid,
      targetEmail,
      requestedBy: auth.currentUser?.uid || "",
      createdAt: new Date().toISOString(),
      status: "client_generated",
    });
  } catch (e) {
    console.warn("passwordAdminActions audit skipped:", e);
  }
  await markMustChangePassword(targetUid, true);
}
