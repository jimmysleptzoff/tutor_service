import { useEffect, useState } from "react";

export default function TutorDashboardPage() {
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
      <h2>Tutor Dashboard</h2>

      {appointments.map(a => (
        <div key={a.appointmentId}>
          {a.courseNum} — Student {a.studentId}
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

          <textarea
            defaultValue={a.notes || ""}
            onBlur={async (e) => {
              await fetch(
                `http://localhost:5000/appointments/${a.appointmentId}/notes`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ notes: e.target.value }),
                }
              );
            }}
          />
        </div>
      ))}
    </div>
  );
}