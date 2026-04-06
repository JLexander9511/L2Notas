"use client";

import { useAuth } from "@/firebase/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin/login") return;

    // Si terminó de cargar y no hay usuario, redirigir al login
    if (!loading && !user) {
      router.push("/admin/login");
    }

    // Seguridad extra: Verificar que el email sea el tuyo
    // (Reemplaza con tu correo configurado en Firebase)
    if (!loading && user && user.email !== "japl.uba.1995@gmail.com") {
      router.push("/"); // Si es un alumno "curioso", lo mandamos al inicio
    }
  }, [user, loading, router, pathname]);

  // Skip authentication checks for the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Mientras verifica la sesión, mostramos una pantalla de carga
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  // Si no hay usuario, no renderizamos nada mientras ocurre la redirección
  if (!user) return null;

  return (
    <div style={styles.adminWrapper}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Profesor</h2>
        <nav style={styles.nav}>
          <a href="/admin/dashboard" style={styles.navLink}>Inicio</a>
          <button 
            onClick={() => signOut(auth)} 
            style={styles.logoutBtn}
          >
            Cerrar Sesión
          </button>
        </nav>
      </aside>

      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "sans-serif"
  },
  adminWrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    backgroundColor: "#f9f9f9"
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#1a202c",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column"
  },
  sidebarTitle: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    borderBottom: "1px solid #2d3748",
    paddingBottom: "10px"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  navLink: {
    color: "#cbd5e0",
    textDecoration: "none",
    padding: "8px 0"
  },
  logoutBtn: {
    marginTop: "20px",
    backgroundColor: "#e53e3e",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer"
  },
  content: {
    flex: 1,
    padding: "40px"
  }
};