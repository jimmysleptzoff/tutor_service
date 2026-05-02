import { useEffect, useState } from "react";
import type { DemoScenario } from "../types/scheduling";

type Props = {
  scenario: DemoScenario;
};

const COURSES = ["CS101", "MATH155", "CHEM115"];

export default function StudentBookingPage({ scenario }: Props) {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [inputId, setInputId] = useState("");

  const [tutors, setTutors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [appointmentTime, setAppointmentTime] = useState("");

  const loadData = async () => {
    const t = await fetch("http://localhost:5000/tutors");
    setTutors(await t.json());

    const a = await fetch("http://localhost:5000/appointments");
    setAppointments(await a.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const login = () => {
    if (!inputId) return;
    setStudentId(Number(inputId));
  };

  const bookAppointment = async () => {
    if (!studentId || !selectedTutor || !selectedCourse || !appointmentTime) {
      alert("Fill everything");
      return;
    }

    await fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        tutorId: selectedTutor,
        courseNum: selectedCourse,
        startDateTime: appointmentTime,
      }),
    });

    loadData();
  };

  const visibleTutors = tutors.filter(
    (t) => t.courseNum === selectedCourse
  );

  return (
    <div style={{ padding: "20px", color: "white", maxWidth: "500px" }}>
      <h2>Student Portal</h2>

      {!studentId ? (
        <>
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Student ID"
          />
          <button onClick={login}>Continue</button>
        </>
      ) : (
        <>
          <h3>ID: {studentId}</h3>

          <select onChange={(e) => setSelectedCourse(e.target.value)}>
            <option>Select Course</option>
            {COURSES.map(c => <option key={c}>{c}</option>)}
          </select>

          <select onChange={(e) => setSelectedTutor(Number(e.target.value))}>
            <option>Select Tutor</option>
            {visibleTutors.map(t => (
              <option key={t.tutorId} value={t.tutorId}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            onChange={(e) => setAppointmentTime(e.target.value)}
          />

          <button onClick={bookAppointment}>Book</button>

          <h3>Your Appointments</h3>

          {appointments
            .filter(a => a.studentId === studentId)
            .map(a => (
              <div key={a.appointmentId}>
                {a.courseNum} — {a.tutorName}
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
                    loadData();
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
        </>
      )}
    </div>
  );
}