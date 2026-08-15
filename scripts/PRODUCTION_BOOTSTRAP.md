# Production bootstrap (after merge to `main`)

**Updated:** 2026-08-15 — see also `docs/CHAT_HANDOFF.md` for full chat continuity.

## Current status

| Step | Status |
|------|--------|
| `FIREBASE_TOKEN` GitHub secret | Refreshed; CI deploys on `main` succeeding |
| Deploy Firestore rules (`firestore:rules`) | Done via CI with hosting |
| Seed demo admin profile | Done (`demo.admin@iec-tax.test`) |
| Enable Google sign-in provider | Done (provider responds; SSO redirect UX verified) |
| Google SSO app flow | Done — `signInWithRedirect` + account chooser (PR #6) |

---

## If CI deploy fails again (expired token)

Regenerate on a machine where you can log into Firebase:

```bash
npx firebase login:ci
```

Then in GitHub → **Settings → Secrets and variables → Actions**, update secret `FIREBASE_TOKEN`.

Confirm Hosting has a default site for project `tax-app-c410d` (Firebase Console → Hosting).

Re-run the workflow on `main`, or:

```bash
git commit --allow-empty -m "chore: redeploy after FIREBASE_TOKEN refresh"
git push origin main
```

Deploy command used by CI: `firebase deploy --only hosting,firestore:rules`.

---

## 1) Deploy Firestore rules

Wired in repo (`firebase.json` → `"firestore": { "rules": "firestore.rules" }`) and CI.

Rules include a self-bootstrap create path for `demo.admin@iec-tax.test` as administrator. Tighten or remove once real admins exist.

## 2) Seed admin profile

```bash
node scripts/seed-demo-admin.mjs
```

Creates/updates `users/{uid}` for:

- Email: `demo.admin@iec-tax.test`
- Password: `DemoAdmin@123!`
- Role: `administrator`
- UID (current): `9m0Z7ZK5vsfROUrVsO1ETiLPio53`

## 3) Google SSO (Console + app)

### Console checklist (already enabled for this project)

1. [Authentication → Sign-in method](https://console.firebase.google.com/project/tax-app-c410d/authentication/providers) → **Google** enabled
2. Support email set
3. Authorized domains include at least:
   - `localhost`
   - `tax-app-c410d.web.app`
   - `tax-app-c410d.firebaseapp.com`
   - `krns.tax.app`
   - `karennistategovernment.org` (as configured)

### App behavior

- Login button **Continue with Google** uses Firebase **`signInWithRedirect`** (not popup) so the Gmail / Google Workspace account chooser works reliably.
- New Google identities create an `ssoAccessRequests` doc; admins approve under **User Admin → SSO Approvals**.
- A Google sign-in creates a **different Firebase UID** than email/password for the same address unless accounts are linked.

### Optional: Cloud Functions

Deploy `functions/` when privileged password set (`adminSetTemporaryPassword`) is required in production.
