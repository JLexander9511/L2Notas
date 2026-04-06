"use client";

import React, { useState } from "react";
import { auth } from "@/firebase/config";
import { signInWithCustomToken } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Llamar a nuestra API para obtener el token
      const res = await fetch("/api/loginEstudiantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al ingresar");

      // 2. Autenticar en Firebase con el token recibido
      await signInWithCustomToken(auth, data.token);

      // 3. Redirigir al dashboard del estudiante
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Consulta de Notas</h1>
          <p className="text-gray-500 mt-2">Ingresa tu cédula para ver tus resultados</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Cédula
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Ej: 12345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 transform active:scale-95 disabled:bg-gray-400"
          >
            {loading ? "Verificando..." : "Consultar Notas"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Notas para materias, Prof. Jesus Piñate © {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}