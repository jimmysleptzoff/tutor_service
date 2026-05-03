import React, { useEffect, useState } from "react";

export default function StudentBookingPage({ user }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [course, setCourse] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("online");

  const load = async () => {
    const a = await fetch("http://localhost:5000/appointments");
    const t = await fetch("http://localhost:5000/tutors");

    const ad = await a.json();
    const td = await t.json();

    setAppointments(Array.isArray(ad) ? ad : []);
    setTutors(Array.isArray(td) ? td : []);
  };

  useEffect(() => {
    load();
  }, []);

  const mySessions = appointments.filter(
    (a) => a.studentId === user.studentId
  );

  const filteredTutors = tutors.filter((t) => t.courseNum === course);

  const book = async () => {
    setMessage("");

    if (!course || !tutorId || !time) {
      setMessage("Fill required fields");
      return;
    }

    const res = await fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.studentId,
        tutorId: Number(tutorId),
        courseNum: course,
        startDateTime: time,
        notes,
        location,
        mode,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.message || "Booking failed");
      return;
    }

    setMessage("Session booked");
    setCourse("");
    setTutorId("");
    setTime("");
    setNotes("");
    setLocation("");
    load();
  };

  const cancel = async (id: number) => {
    if (!window.confirm("Cancel session?")) return;

    const res = await fetch(
      `http://localhost:5000/appointments/${id}/cancel`,
      { method: "PUT" }
    );

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Student Dashboard</h2>
        <p style={styles.sub}>Welcome {user.firstName}</p>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Book Session</h3>

          <select
            style={styles.input}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">Course</option>
            {Array.from(new Set(tutors.map((t) => t.courseNum))).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            style={styles.input}
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
          >
            <option value="">Tutor</option>
            {filteredTutors.map((t) => (
              <option key={t.tutorId} value={t.tutorId}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            style={styles.input}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <select
            style={styles.input}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="online">Online</option>
            <option value="in_person">In Person</option>
          </select>

          <textarea
            style={styles.textarea}
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button style={styles.primary} onClick={book}>
            Book
          </button>
        </div>

        <div style={styles.card}>
          <h3>Your Sessions</h3>

          {mySessions.length === 0 && (
            <p style={styles.sub}>No sessions yet</p>
          )}

          {mySessions.map((a) => (
            <div key={a.appointmentId} style={styles.session}>
              <div>
                <strong>{a.courseNum}</strong>
                <p style={styles.sub}>{a.tutorName}</p>
                <p style={styles.meta}>
                  {a.mode === "online" ? "Online" : "In Person"} • {a.location}
                </p>
              </div>

              <div style={styles.right}>
                <p>{new Date(a.startDateTime).toLocaleString()}</p>
                <span
                  style={{
                    color: a.status === "cancelled" ? "#ef4444" : "#22c55e",
                  }}
                >
                  {a.status}
                </span>

                {a.status !== "cancelled" && (
                  <button
                    style={styles.danger}
                    onClick={() => cancel(a.appointmentId)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: { width: "100%", maxWidth: "1200px" },

  header: { marginBottom: "20px" },

  sub: { color: "#94a3b8" },

  message: {
    marginBottom: "15px",
    color: "#22c55e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
  },

  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    background: "#020617",
    border: "1px solid #334155",
    color: "white",
    borderRadius: "6px",
  },

  textarea: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    background: "#020617",
    color: "white",
    borderRadius: "6px",
  },

  primary: {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    color: "white",
  },

  danger: {
    marginTop: "5px",
    padding: "6px",
    background: "#ef4444",
    border: "none",
    borderRadius: "6px",
    color: "white",
  },

  session: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    padding: "12px",
    background: "#0f172a",
    borderRadius: "8px",
  },

  meta: {
    fontSize: "12px",
    color: "#94a3b8",
  },

  right: {
    textAlign: "right",
  },
};