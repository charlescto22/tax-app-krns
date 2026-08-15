# Security — IEC Taxation

Security posture for the live Firebase-backed IEC Taxation app (`tax-app-c410d`).

## Authentication & authorization

### Authentication
- **Firebase Auth** email/password
- **Google / Google Workspace SSO** via `signInWithRedirect` + `prompt: select_account` (popup was abandoned due to Cross-Origin-Opener-Policy breakage)
- **Forgot password** via Firebase reset email
- **Force password change** after admin-issued temporary passwords

### Authorization (RBAC)
Roles stored on Firestore `users/{uid}`:

| Role | Access |
|------|--------|
| `administrator` | Full (dashboard, rates, users, remittance, reports, …) |
| `remittance-manager` | Remittance, reports, calculation; collection view-oriented |
| `tax-collector` | Collection / calculation / settings-oriented |

Client route guards in `App.tsx` mirror these roles. **Server enforcement** is Firestore rules (`firestore.rules`).

### SSO gate
New Google identities create `ssoAccessRequests` documents. Until an administrator approves, the user is signed out and cannot enter.

### Device enforcement
Optional per-user max devices with registration under `users/{uid}/devices` and revoke from User Admin.

## Password policy (UI)

- Minimum 8 characters
- Uppercase, lowercase, number, special character indicators on login / change flows
- Passwords are handled by Firebase Auth (not stored in app code or localStorage)
- Remember Me stores **email only**

## Session handling

- App session mirror in `sessionStorage` (`userSession`) for UX/routing
- Logout calls Firebase `auth.signOut()` and clears session
- Do not treat client session alone as authoritative — Auth + Firestore rules decide access

## Input & XSS

- Prefer React text rendering (JSX escaping)
- Validate emails before Auth calls
- Avoid `dangerouslySetInnerHTML` for user content

## Hosting security headers

Configured in `firebase.json` (served by Firebase Hosting), including:

- `Content-Security-Policy` allowing Firebase Auth, Google accounts, gstatic, Firestore/Identity Toolkit endpoints
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Working test account

| Email | Password | Role |
|-------|----------|------|
| `demo.admin@iec-tax.test` | `DemoAdmin@123!` | administrator |

Legacy `@taxadmin.gov` credentials in older docs are obsolete.

## Production checklist

- [x] HTTPS via Firebase Hosting
- [x] Firebase Auth (not client-only password tables)
- [x] Firestore security rules deployed with hosting CI
- [x] CSP / frame / nosniff headers on hosting
- [x] Google SSO redirect flow
- [ ] Deploy Cloud Functions when privileged Admin SDK password set is required
- [ ] Remove or tighten `demo.admin@iec-tax.test` rules bootstrap when real admins exist
- [ ] Rotate demo password after handoff to operators
- [ ] Periodic dependency / rules review

## Security contact

Report issues to the IEC IT officer responsible for this project (organization email), not a fictional `@taxadmin.gov` address.

---

**Last updated:** 2026-08-15
