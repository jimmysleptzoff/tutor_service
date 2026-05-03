import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminOpsPage({ user }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    const res = await fetch("http://localhost:5000/appointments");
    const data = await res.json();
    setAppointments(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const cancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session?")) return;

    const res = await fetch(
      `http://localhost:5000/appointments/${id}/cancel`,
      { method: "PUT" }
    );

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    }
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Delete permanently?")) return;

    const res = await fetch(
      `http://localhost:5000/appointments/${id}`,
      { method: "DELETE" }
    );

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

  // chart data
  const chartData = Object.values(
    appointments.reduce((acc: any, a: any) => {
      const date = new Date(a.startDateTime).toLocaleDateString();

      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }

      acc[date].count += 1;
      return acc;
    }, {})
  );

  return (
    <div style={styles.page}>
      <h2>Admin Dashboard</h2>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.chartCard}>
        <h3>Sessions Per Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#334155" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
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