"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/firebase/AuthContext";
import { db, auth } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Nota {
  unidad: string;
  puntos: number;
}

interface StudentData {
  nombre: string;
  cedula: string;
  notas: Nota[];
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();

  // 1. Protección de ruta y carga de datos
  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Si no hay sesión, al login de estudiante
      return;
    }

    if (user) {
      // Obtenemos el documento del estudiante desde registroCalificaciones
      const fetchStudentData = async () => {
        try {
          const docRef = doc(db, "registroCalificaciones", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as StudentData;
            setStudentData(data);
          } else {
            console.log("No se encontró el documento del estudiante");
          }
        } catch (error) {
          console.error("Error al obtener los datos del estudiante:", error);
        } finally {
          setLoadingData(false);
        }
      };

      fetchStudentData();
    }
  }, [user, loading, router]);

  // 2. No necesitamos lógica de suma por unidad, mostramos notas individuales

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con Logout */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Hola, <span className="text-blue-600">{studentData?.nombre || "Estudiante"}</span>
            </h1>
            <p className="text-sm text-gray-500 font-mono">Cedula: {user?.uid}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl transition-all duration-200 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </header>

        {/* Grid de Notas Individuales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentData?.notas && studentData.notas.length > 0 ? (
            studentData.notas.map((nota, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">
                  Nota
                </span>
                <h2 className="text-lg font-bold text-gray-800 mb-2">{nota.unidad}</h2>
                <div className="relative flex items-center justify-center">
                  <div className="text-4xl font-extrabold text-gray-900 leading-none">
                    {nota.puntos}
                  </div>
                  <span className="text-gray-400 font-medium ml-2 self-end mb-1">pts</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-lg">Aún no hay notas registradas para tu ID.</p>
            </div>
          )}
        </div>

        {/* Footer Informativo */}
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Notas preliminares, materia Lenguajes de programacion 2 - UNEFA</p>
        </footer>
      </div>
    </div>
  );
}