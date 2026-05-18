"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/firebase/config";
import { collection, query, onSnapshot, orderBy, Timestamp, setDoc, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

interface Nota {
  id?: string;
  cedula: string;
  nombre: string;
  notas?: { unidad: string; puntos: number }[];
  unidad?: string;
  puntos?: number;
}

interface GradeInput {
  unidad: string;
  puntos: string;
}

export default function AdminDashboard() {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [grades, setGrades] = useState<GradeInput[]>([{ unidad: "Unidad 1 - Fundamentos de Python", puntos: "" }]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "registroCalificaciones"), orderBy("cedula"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Nota));
      setNotas(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !nombre || grades.length === 0) return;

    // Validate grades
    const validGrades = grades.filter(g => g.puntos && !isNaN(Number(g.puntos)));
    if (validGrades.length === 0) return;

    // Check for duplicate units in the form
    const units = validGrades.map(g => g.unidad);
    if (new Set(units).size !== units.length) {
      alert("No puedes agregar la misma unidad múltiples veces.");
      return;
    }

    setLoading(true);
    try {
      // Get existing document
      const docRef = doc(db, "registroCalificaciones", cedula);
      const existingDoc = await getDoc(docRef);
      let existingNotas: { unidad: string; puntos: number }[] = [];
      if (existingDoc.exists()) {
        existingNotas = existingDoc.data().notas || [];
      }

      // Check for existing units
      const existingUnits = existingNotas.map(n => n.unidad);
      const conflictingUnits = validGrades.filter(g => existingUnits.includes(g.unidad));
      if (conflictingUnits.length > 0) {
        alert(`Las siguientes unidades ya están registradas: ${conflictingUnits.map(g => g.unidad).join(", ")}`);
        return;
      }

      // Merge and save
      const newNotas = [...existingNotas, ...validGrades.map(g => ({ unidad: g.unidad, puntos: Number(g.puntos) }))];
      await setDoc(docRef, {
        cedula,
        nombre,
        notas: newNotas,
        updatedAt: Timestamp.now()
      });

      // Reset form
      setGrades([{ unidad: "Unidad 1 - Fundamentos de Python", puntos: "" }]);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar en Firestore");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de sumatoria agrupada por ID de estudiante y Unidad
  const resumenNotas = notas.flatMap(nota => {
    if (nota.notas) {
      // New structure: array of grades
      return nota.notas.map(n => ({
        cedula: nota.cedula,
        nombre: nota.nombre,
        unidad: n.unidad,
        puntos: n.puntos
      }));
    } else {
      // Old structure: single grade per document
      return [{
        cedula: nota.cedula,
        nombre: nota.nombre,
        unidad: nota.unidad!,
        puntos: nota.puntos!
      }];
    }
  }).reduce((acc: Record<string, { nombre: string; cedula: string; unidad: string; total: number }>, curr) => {
    const key = `${curr.cedula}-${curr.unidad}`;
    if (!acc[key]) {
      acc[key] = { 
        nombre: curr.nombre, 
        cedula: curr.cedula, 
        unidad: curr.unidad, 
        total: 0 
      };
    }
    acc[key].total += curr.puntos;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Calificaciones</h1>
        <button 
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Formulario de Registro */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Registrar Notas</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">ID Estudiante</label>
              <input 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: 2024001"
                value={cedula}
                onChange={e => setCedula(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <input 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Notas por Unidad</label>
            {grades.map((grade, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={grade.unidad}
                    onChange={e => {
                      const newGrades = [...grades];
                      newGrades[index].unidad = e.target.value;
                      setGrades(newGrades);
                    }}
                  >
                    {[{n:1, name:"Fundamentos de Python"}, 
                      {n:2, name:"Algoritmos de ordenamiento y busqueda"},
                      {n:2.1, name:"Laboratorio 1 - Ordenamiento y Busqueda"}, 
                      {n:3, name:"Manejo avanzado de archivos y E/S"},
                      {n:3.2, name:"Laboratorio 2 - Manejo avanzado de archivos y E/S"}, 
                      {n:4, name:"Programacion orientada a objetos"}, 
                      {n:5, name:"Introduccion al procesamiento grafico o visualizacion de datos"}, 
                      {n:6, name:"Generacion de contenido con IA"}, 
                      {n:6.3, name:"Laboratorio 3 - Generacion de contenido con IA"}, 
                      {n:7, name:"Proyecto Final"},
                      {n:7.4, name:"Laboratorio 4 -Avances proyecto en laboratorio, documentacion y entrevistas"}, ].map(u => (
                      <option key={u.n} value={`Unidad ${u.n} - ${u.name}`}>Unidad {u.n}: {u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    value={grade.puntos}
                    onChange={e => {
                      const newGrades = [...grades];
                      newGrades[index].puntos = e.target.value;
                      setGrades(newGrades);
                    }}
                    max={20}
                  />
                </div>
                {grades.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => setGrades(grades.filter((_, i) => i !== index))}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button"
              onClick={() => setGrades([...grades, { unidad: "Unidad 1 - Fundamentos de Python", puntos: "" }])}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              + Agregar Unidad
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:bg-blue-300"
          >
            {loading ? "Guardando..." : "Registrar Notas"}
          </button>
        </form>
      </section>

      {/* Tabla de Resultados */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">Resumen Acumulado por Unidad</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 border-b">ID Alumno</th>
                <th className="px-6 py-3 border-b">Nombre Completo</th>
                <th className="px-6 py-3 border-b">Unidad</th>
                <th className="px-6 py-3 border-b text-center">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(resumenNotas).length > 0 ? (
                Object.values(resumenNotas).map((item: { nombre: string; cedula: string; unidad: string; total: number }) => (
                  <tr key={`${item.cedula}-${item.unidad}`} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-sm text-blue-600">{item.cedula}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{item.unidad}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-green-600">{item.total}</span>
                      <span className="text-gray-400 text-xs ml-1">pts</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No hay datos registrados aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
