import React, { useEffect, useState } from "react";
import { apiUrl } from "../api";

export default function TutorDashboardPage({ user }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");

  const load = async () => {
    const res = await fetch(apiUrl("/appointments"));
    const data = await res.json();

    if (Array.isArray(data)) {
      setAppointments(data);
    } else {
      setAppointments([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tutorId = user.studentId;

  const mySessions = appointments.filter(
    (a) => String(a.tutorId) === String(tutorId)
  );

  const cancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}/cancel`), {
      method: "PUT",
    });

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    } else {
      setMessage("Error cancelling session");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Tutor Dashboard</h2>
        <p style={styles.sub}>
          Welcome {user.firstName} — manage your sessions
        </p>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h3>{mySessions.length}</h3>
          <p>Total</p>
        </div>

        <div style={styles.statCard}>
          <h3>
            {mySessions.filter((s) => s.status !== "cancelled").length}
          </h3>
          <p>Active</p>
        </div>

        <div style={styles.statCard}>
          <h3>
            {mySessions.filter((s) => s.status === "cancelled").length}
          </h3>
          <p>Cancelled</p>
        </div>
      </div>

      <div style={styles.card}>
        {mySessions.length === 0 && (
          <p style={styles.sub}>No sessions yet</p>
        )}

        {mySessions.map((a) => (
          <div key={a.appointmentId} style={styles.session}>
            <div>
              <strong>{a.courseNum}</strong>
              <p style={styles.sub}>Student: {a.studentId}</p>
              <p style={styles.sub}>
                {a.mode} • {a.location}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p>{new Date(a.startDateTime).toLocaleString()}</p>
              <p>{a.status}</p>

              <button
                style={styles.cancel}
                onClick={() => cancelSession(a.appointmentId)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { width: "900px", marginTop: "30px" },
  header: { marginBottom: "20px" },
  sub: { color: "#94a3b8" },
  message: { color: "#22c55e", marginBottom: "10px" },

  stats: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  statCard: {
    flex: 1,
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
  },

  session: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    padding: "12px",
    background: "#0f172a",
    borderRadius: "8px",
  },

  cancel: {
    background: "#f59e0b",
    border: "none",
    padding: "6px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
};