// Grants the Firebase "admin" custom claim to a user, so they can open /#/admin
// and (once firestore.rules is deployed) edit products and rates.
//
// Usage:
//   node scripts/set-admin-claim.mjs <path-to-service-account.json> <email>
//
// The service-account JSON comes from Firebase Console → Project settings →
// Service accounts → Generate new private key. Keep it OUT of this repo.
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [serviceAccountPath, email] = process.argv.slice(2);
if (!serviceAccountPath || !email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <service-account.json> <email>');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8'))) });

const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims ?? {}), admin: true });
const updated = await auth.getUser(user.uid);
console.log(`Admin claim set for ${email} (uid ${user.uid}):`, updated.customClaims);
console.log('Sign out and sign back in on /#/admin for it to take effect.');
