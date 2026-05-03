import React, { useEffect, useState } from "react";
import { apiUrl } from "../api";

export default function AdminOpsPage({ user }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    const res = await fetch(apiUrl("/appointments"));
    const data = await res.json();
    setAppointments(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const cancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}/cancel`), {
      method: "PUT",
    });

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    }
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Delete permanently?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}`), {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Session deleted");
      load();
    }
  };

  const filtered = appointments.filter((a) => {
    const textMatch =
      a.courseNum.toLowerCase().includes(search.toLowerCase()) ||
      String(a.studentId).includes(search) ||
      a.tutorName.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all" || a.status === statusFilter;

    return textMatch && statusMatch;
  });

  const chartData = Object.values(
    appointments.reduce((acc: any, a: any) => {
      const date = new Date(a.startDateTime).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }

      acc[date].count += 1;
      return acc;
    }, {})
  ) as { date: string; count: number }[];

  const maxCount = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <div style={styles.page}>
      <h2>Admin Dashboard</h2>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.chartCard}>
        <h3>Sessions Per Day</h3>
        {chartData.length === 0 ? (
          <p style={styles.chartEmpty}>No session data yet.</p>
        ) : (
          <div style={styles.barChart}>
            {chartData.map((row) => (
              <div key={row.date} style={styles.barColumn}>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      height: `${(row.count / maxCount) * 100}%`,
                    }}
                    title={`${row.date}: ${row.count}`}
                  />
                </div>
                <span style={styles.barLabel}>{row.date}</span>
                <span style={styles.barCount}>{row.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.filters}>
        <input
          style={styles.input}
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.input}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={styles.card}>
        {filtered.map((a) => (
          <div key={a.appointmentId} style={styles.session}>
            <div>
              <strong>{a.courseNum}</strong>
              <p>
                {a.studentId} | {a.tutorName}
              </p>
            </div>

            <div>
              <p>{new Date(a.startDateTime).toLocaleString()}</p>

              <button onClick={() => cancelSession(a.appointmentId)}>
                Cancel
              </button>

              <button onClick={() => deleteSession(a.appointmentId)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: any = {
  page: { width: "100%", maxWidth: "1200px" },

  message: { color: "#22c55e" },

  chartCard: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  chartEmpty: { color: "#94a3b8", margin: "24px 0" },

  barChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    minHeight: "220px",
    paddingTop: "8px",
    overflowX: "auto",
  },

  barColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: "1 0 56px",
    minWidth: "56px",
  },

  barTrack: {
    width: "100%",
    height: "160px",
    background: "#0f172a",
    borderRadius: "6px",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },

  barFill: {
    width: "100%",
    background: "linear-gradient(180deg, #60a5fa, #2563eb)",
    borderRadius: "4px 4px 0 0",
    minHeight: "4px",
    transition: "height 0.2s ease",
  },

  barLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "8px",
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "72px",
  },

  barCount: {
    fontSize: "12px",
    color: "#e2e8f0",
    fontWeight: 600,
    marginTop: "4px",
  },

  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  input: {
    padding: "10px",
    background: "#0f172a",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "6px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
  },

  session: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#0f172a",
    marginTop: "10px",
    borderRadius: "8px",
  },
};