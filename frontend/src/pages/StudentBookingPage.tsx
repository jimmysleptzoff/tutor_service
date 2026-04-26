import { motion } from "framer-motion";
import { CalendarCheck2, CheckCircle2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { courses } from "../data/mockData";
import { formatBookingMessage, getSlotsForTutor, getTutorsForCourse } from "../services/schedulingService";

export default function StudentBookingPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  // Memoized so the dependent dropdowns feel instant as people click through demo steps.
  const availableTutors = useMemo(() => getTutorsForCourse(selectedCourse), [selectedCourse]);
  const availableSlots = useMemo(() => getSlotsForTutor(selectedTutorId), [selectedTutorId]);

  // We keep booking logic in one helper to mirror how backend validation would respond.
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
      className="panel ring-1 ring-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="view-hero view-hero-student">
        <p>Student Experience</p>
        <h3>Pick a tutor and lock in a time in under a minute</h3>
      </div>
      <div className="panel-header">
        <h2>Student Booking Flow</h2>
        <span className="chip">Easy booking</span>
      </div>
      <p className="lead">
        Choose your course, select a tutor, and reserve an open time slot. We automatically block
        overlapping appointments before you confirm.
      </p>

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
          <select value={selectedTutorId} onChange={(event) => setSelectedTutorId(event.target.value)}>
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
          <select value={selectedSlotId} onChange={(event) => setSelectedSlotId(event.target.value)}>
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
        <button className="primary-btn" onClick={handleBookSession}>
          <CheckCircle2 size={15} />
          Confirm booking
        </button>
        <button
          className="ghost-btn"
          type="button"
          onClick={() => {
            // Full reset helps teammates quickly rerun the same demo path.
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

      <div className="meta-grid">
        <article>
          <h4>Match confidence</h4>
          <p>{selectedTutorId ? "94%" : "--"}</p>
        </article>
        <article>
          <h4>Conflict risk</h4>
          <p>{selectedSlotId ? "0%" : "--"}</p>
        </article>
        <article>
          <h4>Mode</h4>
          <p>{selectedSlotId ? availableSlots.find((slot) => slot.id === selectedSlotId)?.mode ?? "--" : "--"}</p>
        </article>
      </div>

      <div className="view-callout">
        <CalendarCheck2 size={16} />
        <span>Tip: picking a higher fit-score tutor usually means fewer schedule changes later.</span>
      </div>

      {bookingMessage && <p className="notice">{bookingMessage}</p>}
    </motion.section>
  );
}
