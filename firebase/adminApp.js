import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set");
  }
  const serviceAccount = JSON.parse(credentialsJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

