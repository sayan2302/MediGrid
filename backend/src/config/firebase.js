const admin = require('firebase-admin');
const env = require('./env');

let initialized = false;

const initFirebase = () => {
  if (initialized) {
    return;
  }

  if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey
    })
  });

  initialized = true;
};

const verifyIdToken = async (token) => {
  if (!initialized) {
    return null;
  }
  return admin.auth().verifyIdToken(token);
};

module.exports = { initFirebase, verifyIdToken };
