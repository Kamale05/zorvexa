/**
 * Zorvexa Super Admin Custom Claims Provisioning Script
 * 
 * Target Email: yasrepop@gmail.com
 * Designated Role: Super Admin / Owner
 * 
 * Usage:
 *   1. Download service-account.json from Firebase Console (Project Settings -> Service accounts).
 *   2. Run: node scripts/set-superadmin-claims.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const TARGET_SUPERADMIN_EMAIL = process.argv[2] || 'yasrepop@gmail.com';

async function main() {
  console.log('==============================================');
  console.log(' Zorvexa Super Admin Custom Claims Configurator');
  console.log(' Target Account: ' + TARGET_SUPERADMIN_EMAIL);
  console.log('==============================================\n');

  // Look for service account key
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !fs.existsSync(serviceAccountPath)) {
    console.log('[INFO] No service-account.json detected in workspace root.');
    console.log('[INFO] To set Custom Claims directly in production Firebase:');
    console.log('       1. Obtain your Firebase Admin Service Account key from Firebase Console:');
    console.log('          https://console.firebase.google.com/project/extreme-hawk-frtgb/settings/serviceaccounts/adminsdk');
    console.log('       2. Save it as service-account.json in the project root.');
    console.log('       3. Run: node scripts/set-superadmin-claims.js');
    console.log('\n[NOTICE] The client app and Firestore Security Rules are already configured');
    console.log('         to enforce Super Admin privileges strictly for ' + TARGET_SUPERADMIN_EMAIL + '.');
    return;
  }

  try {
    const credential = fs.existsSync(serviceAccountPath)
      ? admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')))
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId: 'extreme-hawk-frtgb',
    });

    console.log('[1/3] Searching for Firebase user with email:', TARGET_SUPERADMIN_EMAIL);
    let user;
    try {
      user = await admin.auth().getUserByEmail(TARGET_SUPERADMIN_EMAIL);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.warn('\n[!] IMPORTANT CONSTRAINT VERIFIED:');
        console.warn(`    User ${TARGET_SUPERADMIN_EMAIL} is not yet registered in Firebase Authentication.`);
        console.warn('    As instructed, we do NOT invent or create a fake password/account.');
        console.warn('    The owner must create/register their account via the Zorvexa app or Firebase Auth first.');
        console.warn('    Once registered, run this script again to instantly stamp custom claims.\n');
        return;
      }
      throw err;
    }

    console.log(`[2/3] User found! UID: ${user.uid}`);
    console.log('[3/3] Setting custom user claims: { role: "super_admin", admin: true }...');

    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'super_admin',
      admin: true,
    });

    // Also write document in adminRoles collection for sync
    const db = admin.firestore();
    await db.collection('adminRoles').doc(user.uid).set({
      uid: user.uid,
      email: TARGET_SUPERADMIN_EMAIL,
      role: 'owner',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('\n[SUCCESS] Custom Claims stamped successfully!');
    console.log(`          ${TARGET_SUPERADMIN_EMAIL} is now the verified Super Admin of Zorvexa.`);

  } catch (error) {
    console.error('[ERROR] Failed to set custom claims:', error.message);
  }
}

main();
