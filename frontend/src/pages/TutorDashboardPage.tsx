import { motion } from "framer-motion";
import { ClipboardList, Timer } from "lucide-react";
import { useState } from "react";
import { getTutorUpcomingSessions } from "../services/schedulingService";

export default function TutorDashboardPage() {
  const [sessionNotes, setSessionNotes] = useState("");
  // Static mock for now, but structured like a normal data fetch result.
  const upcomingSessions = getTutorUpcomingSessions();

  return (
    <motion.section
      className="panel ring-1 ring-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="view-hero view-hero-tutor">
        <p>Tutor Operations</p>
        <h3>Stay on top of upcoming sessions and notes</h3>
      </div>
      <div className="panel-header">
        <h2>Tutor Dashboard</h2>
        <span className="chip">Today at a glance</span>
      </div>
      <p className="lead">
        Review your upcoming sessions, jot down what you covered, and keep follow-ups consistent for
        each student.
      </p>

      <div className="meta-grid">
        <article>
          <h4>Scheduled sessions</h4>
          <p>{upcomingSessions.length}</p>
        </article>
        <article>
          <h4>Response consistency</h4>
          <p>99.2%</p>
        </article>
        <article>
          <h4>Coverage status</h4>
          <p>Healthy</p>
        </article>
      </div>

      <div className="session-list">
        {/* Card layout is easier to scan in demos than raw bullet text. */}
        {upcomingSessions.map((appointment) => (
          <article key={appointment.id} className="session-item">
            <div className="session-title">
              <ClipboardList size={14} />
              <strong>{appointment.course}</strong>
            </div>
            <p>{appointment.student}</p>
            <span>
              <Timer size={13} />
              {appointment.time}
            </span>
          </article>
        ))}
      </div>

      <label className="notes-field">
        Session notes for your latest student
        <textarea
          rows={4}
          placeholder="What you covered, what to review next, and any follow-up notes..."
          value={sessionNotes}
          onChange={(event) => setSessionNotes(event.target.value)}
        />
      </label>
    </motion.section>
  );
}
