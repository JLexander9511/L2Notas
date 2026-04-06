import * as admin from "firebase-admin";
import serviceAccount from "./l2notas-firebase-adminsdk-fbsvc-a6e23fec14.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

