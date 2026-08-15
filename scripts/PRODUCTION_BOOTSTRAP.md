# Production bootstrap (after merge to `main`)

## Status blockers

GitHub Actions deploy is failing because the repository secret **`FIREBASE_TOKEN` is expired**.

Regenerate it on a machine where you can log into Firebase:

```bash
npx firebase login:ci
```

Then in GitHub → **Settings → Secrets and variables → Actions**, update secret `FIREBASE_TOKEN` with the new token.

Also confirm Hosting has a default site for project `tax-app-c410d` (Firebase Console → Hosting).

After updating the secret, re-run the failed workflow on `main`, or push an empty commit:

```bash
git commit --allow-empty -m "chore: redeploy after FIREBASE_TOKEN refresh"
git push origin main
```

That deploy now runs: `firebase deploy --only hosting,firestore:rules`.

---

## 1) Deploy Firestore rules

Done in repo + CI config. Completes automatically once `FIREBASE_TOKEN` is valid.

Rules include one-time self-bootstrap for `demo.admin@iec-tax.test` as administrator.

## 2) Seed admin profile

After rules are live:

```bash
node scripts/seed-demo-admin.mjs
```

Creates `users/{uid}` for `demo.admin@iec-tax.test` with role `administrator`.

## 3) Enable Google SSO

Firebase Console (project **tax-app-c410d**):

1. Open [Authentication → Sign-in method](https://console.firebase.google.com/project/tax-app-c410d/authentication/providers)
2. Enable **Google**
3. Set support email
4. Confirm authorized domains include `tax-app-c410d.web.app`, `tax-app-c410d.firebaseapp.com`, and `krns.tax.app`

This cannot be completed from the agent without Console / Admin credentials.
