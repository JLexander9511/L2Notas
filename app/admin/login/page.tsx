"use client";

import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const adminEmail = "japl.uba.1995@gmail.com";

  // Si ya hay un usuario admin logueado, lo mandamos directo al dashboard.
  // Si el usuario está autenticado pero no es admin, lo cerramos para que pueda iniciar sesión como admin.
  useEffect(() => {
    if (authLoading || !user) return;

    if (user.email === adminEmail) {
      router.replace("/admin/dashboard");
      return;
    }

    signOut(auth);
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El useEffect de arriba se encargará de redirigir al detectar el cambio en AuthContext
    } catch (err: any) {
      setLoading(false);
      // Manejo básico de errores de Firebase
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Credenciales inválidas. Inténtalo de nuevo.");
      } else {
        setError("Ocurrió un error al intentar iniciar sesión.");
      }
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Panel de Administrador</h1>
        <p style={styles.subtitle}>Ingresa tus credenciales para gestionar notas</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="profe@ejemplo.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.button,
              backgroundColor: loading ? "#ccc" : "#0070f3"
            }}
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}

// Estilos rápidos en un objeto para no depender de librerías externas por ahora
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.75rem",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: "0.85rem",
    textAlign: "center",
  }
};