# Production bootstrap notes (IEC Tax Admin)
#
# 1) Firestore rules — deployed via GitHub Actions on push to main
#    (`firebase deploy --only hosting,firestore:rules`).
#
# 2) Seed admin profile — run after rules deploy:
#    node scripts/seed-demo-admin.mjs
#
# 3) Google SSO — enable in Firebase Console:
#    Authentication → Sign-in method → Google → Enable
#    Add authorized domain for your Hosting URL if prompted.
