import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import StudentBookingPage from "./pages/StudentBookingPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import AdminOpsPage from "./pages/AdminOpsPage";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const getDashboard = () => {
    if (!user) return <Navigate to="/" />;

    if (user.role === "student") return <StudentBookingPage user={user} />;
    if (user.role === "tutor") return <TutorDashboardPage user={user} />;
    if (user.role === "admin") return <AdminOpsPage user={user} />;

    return <Navigate to="/" />;
  };

  return (
    <div style={styles.app}>
      {user && (
        <div style={styles.sidebar}>
          <h2 style={{ marginBottom: "30px" }}>Scheduler</h2>

        <button style={styles.navBtn} onClick={() => navigate("/dashboard")}>
          {user?.role === "student" && "My Sessions"}
          {user?.role === "tutor" && "My Schedule"}
          {user?.role === "admin" && "All Appointments"}
        </button>

          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>
      )}

      <div style={styles.main}>
        <div style={styles.topbar}>
          {user && (
            <span>
              {user.firstName} ({user.role})
            </span>
          )}
        </div>

        <div style={styles.content}>
          <Routes>
            <Route
              path="/"
              element={
                <LoginPage
                  setUser={(u: any) => {
                    setUser(u);
                    localStorage.setItem("user", JSON.stringify(u));
                    navigate("/dashboard");
                  }}
                />
              }
            />

            <Route path="/dashboard" element={getDashboard()} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "white",
  },

  sidebar: {
    width: "220px",
    background: "#0f172a",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  navBtn: {
    background: "#1e293b",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  logout: {
    marginTop: "auto",
    background: "#ef4444",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  topbar: {
    height: "60px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 20px",
  },

  content: {
    padding: "30px",
  },
};