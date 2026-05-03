import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: ReactNode;
  role: "student" | "tutor" | "admin";
  setRole: (role: "student" | "tutor" | "admin") => void;
};

export default function AppLayout({ children, role, setRole }: Props) {
  const navigate = useNavigate();

  const go = (r: "student" | "tutor" | "admin") => {
    setRole(r);
    navigate(`/${r}`);
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Tutoring Scheduler</h1>

        <div style={styles.nav}>
          {["student", "tutor", "admin"].map((r) => (
            <button
              key={r}
              style={role === r ? styles.active : styles.button}
              onClick={() => go(r as any)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h2 style={styles.heroTitle}>
          {role === "student" && "Book tutoring sessions in seconds"}
          {role === "tutor" && "Manage your upcoming sessions"}
          {role === "admin" && "Oversee and manage all appointments"}
        </h2>

        <p style={styles.heroSub}>
          {role === "student" && "Choose a course, select a tutor, and schedule instantly."}
          {role === "tutor" && "View sessions, take notes, and stay organized."}
          {role === "admin" && "Monitor, cancel, and manage scheduling across the system."}
        </p>
      </div>

      {/* Content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e2a55, #0f172a)",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 40px",
    background: "#020617",
    borderBottom: "1px solid #1e293b",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
  },
  nav: {
    display: "flex",
    gap: "10px",
  },
  button: {
    background: "#1e293b",
    color: "#cbd5f5",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  active: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  hero: {
    textAlign: "center" as const,
    marginTop: "50px",
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "26px",
    fontWeight: "600",
  },
  heroSub: {
    color: "#94a3b8",
    marginTop: "8px",
  },

  main: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  },
};