import { useEffect, useState } from "react";

export default function AdminPage() {
  const [appointments, setAppointments] = useState<any[]>([]);

  const load = async () => {
    const res = await fetch("http://localhost:5000/appointments");
    setAppointments(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Admin Dashboard</h2>

      {appointments.map(a => (
        <div key={a.appointmentId} style={{ marginBottom: "15px" }}>
          <b>{a.courseNum}</b> — {a.tutorName}
          <br />
          {new Date(a.startDateTime).toLocaleString()}
          <br />
          Status: {a.status}
          <br />

          <button
            onClick={async () => {
              await fetch(
                `http://localhost:5000/appointments/${a.appointmentId}/cancel`,
                { method: "PUT" }
              );
              load();
            }}
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              await fetch(
                `http://localhost:5000/appointments/${a.appointmentId}`,
                { method: "DELETE" }
              );
              load();
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}