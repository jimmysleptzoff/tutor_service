import { motion } from "framer-motion";
import { CalendarCheck2, CheckCircle2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { appointments, courses } from "../data/mockData";
import { formatBookingMessage, getSlotsForTutor, getTutorsForCourse } from "../services/schedulingService";
import type { DemoScenario } from "../types/scheduling";

type StudentBookingPageProps = {
  scenario: DemoScenario;
};

export default function StudentBookingPage({ scenario }: StudentBookingPageProps) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const availableTutors = useMemo(() => getTutorsForCourse(selectedCourse), [selectedCourse]);
  const availableSlots = useMemo(() => getSlotsForTutor(selectedTutorId), [selectedTutorId]);
  const isReadyToBook = Boolean(selectedCourse && selectedTutorId && selectedSlotId);
  const mySessions = useMemo(() => appointments.filter((appointment) => appointment.status === "Scheduled"), []);
  const scenarioMultiplier = scenario === "finals" ? 1.4 : scenario === "tutor_shortage" ? 0.85 : 1;

  useEffect(() => {
    if (selectedTutorId && !availableTutors.some((tutor) => tutor.id === selectedTutorId)) {
      setSelectedTutorId("");
      setSelectedSlotId("");
    }
  }, [availableTutors, selectedTutorId]);

  useEffect(() => {
    if (selectedSlotId && !availableSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId("");
    }
  }, [availableSlots, selectedSlotId]);

  function handleBookSession() {
    setBookingMessage(
      formatBookingMessage({
        courseNum: selectedCourse,
        tutorId: selectedTutorId,
        slotId: selectedSlotId,
      })
    );
  }

  return (
    <motion.section
      className="panel ring-1 ring-white/10 dashboard-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel-header">
        <h2>Student Booking Flow</h2>
        <span className="chip">Quick booking desk</span>
      </div>

      <div className="meta-grid">
        <article>
          <h4>Upcoming sessions</h4>
          <p>{Math.max(1, Math.round(mySessions.length * scenarioMultiplier))}</p>
        </article>
        <article>
          <h4>Average fit score</h4>
          <p>{selectedTutorId ? `${availableTutors.find((item) => item.id === selectedTutorId)?.fitScore ?? 94}%` : "--"}</p>
        </article>
        <article>
          <h4>Conflict risk</h4>
          <p>{selectedSlotId ? (scenario === "normal" ? "0%" : scenario === "finals" ? "3%" : "6%") : "--"}</p>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="surface-card">
          <h3>Book a new session</h3>
          <p className="lead">Choose your course, tutor, and slot. Invalid combinations are blocked automatically.</p>
          <div className="form-grid">
            <label>
              Course
              <select value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
                <option value="">Choose course</option>
                {courses.map((course) => (
                  <option key={course.courseNum} value={course.courseNum}>
                    {course.courseNum} - {course.subject}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tutor
              <select
                value={selectedTutorId}
                onChange={(event) => setSelectedTutorId(event.target.value)}
                disabled={!selectedCourse}
              >
                <option value="">Choose tutor</option>
                {availableTutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} (fit score {tutor.fitScore}%)
                  </option>
                ))}
              </select>
            </label>

            <label>
              Available Slot
              <select
                value={selectedSlotId}
                onChange={(event) => setSelectedSlotId(event.target.value)}
                disabled={!selectedTutorId}
              >
                <option value="">Choose slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.start} - {slot.mode}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="action-row">
            <button className="primary-btn" type="button" disabled={!isReadyToBook} onClick={handleBookSession}>
              <CheckCircle2 size={15} />
              Confirm booking
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setSelectedCourse("");
                setSelectedTutorId("");
                setSelectedSlotId("");
                setBookingMessage("");
              }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {bookingMessage && <p className="notice">{bookingMessage}</p>}
        </article>

        <article className="surface-card">
          <h3>Upcoming sessions</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Tutor</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {mySessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.course}</td>
                    <td>{session.tutor}</td>
                    <td>{session.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="view-callout">
        <CalendarCheck2 size={16} />
        <span>Tip: picking a higher fit-score tutor usually means fewer schedule changes later.</span>
      </div>
    </motion.section>
  );
}
