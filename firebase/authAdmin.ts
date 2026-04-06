// src/firebase/auth.ts
import { auth } from "./config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export const loginAdmin = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = () => signOut(auth);