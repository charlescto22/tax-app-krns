import type { UserRole } from "../App";

export type UserStatus = "active" | "inactive";
export type SsoProvider = "google" | "microsoft" | "saml";
export type SsoRequestStatus = "pending" | "approved" | "rejected";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: string;
  department?: string;
  allowedTaxTypes?: string[];
  status: UserStatus;
  lastLogin?: string;
  createdAt?: string;
  /** Max concurrent registered devices (default 2) */
  maxDevices?: number;
  deviceEnforcement?: "strict" | "off";
  mustChangePassword?: boolean;
  passwordUpdatedAt?: string;
  ssoEnabled?: boolean;
  ssoProvider?: SsoProvider;
  ssoStatus?: "none" | "pending" | "approved" | "revoked";
  ssoSubject?: string;
}

export interface DeviceRecord {
  id: string;
  deviceId: string;
  label: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  revoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
}

export interface SsoAccessRequest {
  id: string;
  email: string;
  displayName: string;
  provider: SsoProvider;
  providerUid: string;
  requestedAt: string;
  status: SsoRequestStatus;
  linkedUid?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  requestedRole?: UserRole;
}

export const DEFAULT_MAX_DEVICES = 2;
