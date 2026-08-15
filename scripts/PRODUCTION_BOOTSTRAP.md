# Production bootstrap (after merge to `main`)

**Updated:** 2026-08-15 — see also `docs/CHAT_HANDOFF.md` for full chat continuity.

## Current status

| Step | Status |
|------|--------|
| `FIREBASE_TOKEN` GitHub secret | Refreshed; CI deploys on `main` succeeding |
| Deploy Firestore rules (`firestore:rules`) | Done via CI with hosting |
| Seed demo admin profile | Done (`demo.admin@iec-tax.test`) |
| Enable Google SSO | **Manual — still open** (Firebase Console) |

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

## 3) Enable Google SSO (remaining)

Firebase Console (project **tax-app-c410d**):

1. Open [Authentication → Sign-in method](https://console.firebase.google.com/project/tax-app-c410d/authentication/providers)
2. Enable **Google**
3. Set support email
4. Confirm authorized domains include `tax-app-c410d.web.app`, `tax-app-c410d.firebaseapp.com`, and `krns.tax.app`

This cannot be completed from the agent without Console / Admin credentials.
