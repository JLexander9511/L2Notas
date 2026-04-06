import * as admin from "firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { studentId } = await request.json();

  if (!studentId) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  try {
    // Initialize admin if not already done
    if (!admin.apps.length) {
      const serviceAccount = require("../../../firebase/l2notas-firebase-adminsdk-fbsvc-a6e23fec14.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    const dbAdmin = admin.firestore();
    const docRef = dbAdmin.collection("registroCalificaciones").doc(studentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
    }

    const customToken = await admin.auth().createCustomToken(studentId);
    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Error en login de estudiante:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}