import { motion } from "framer-motion";
import { ClipboardList, Timer } from "lucide-react";
import { useState } from "react";
import { getTutorUpcomingSessions } from "../services/schedulingService";
import type { DemoScenario } from "../types/scheduling";

type TutorDashboardPageProps = {
  scenario: DemoScenario;
};

export default function TutorDashboardPage({ scenario }: TutorDashboardPageProps) {
  const [sessionNotes, setSessionNotes] = useState("");
  const upcomingSessions = getTutorUpcomingSessions();
  const scenarioSessionCount = scenario === "finals" ? upcomingSessions.length + 2 : scenario === "tutor_shortage" ? Math.max(1, upcomingSessions.length - 1) : upcomingSessions.length;

  return (
    <motion.section
      className="panel ring-1 ring-white/10 dashboard-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel-header">
        <h2>Tutor Dashboard</h2>
        <span className="chip">Teaching cockpit</span>
      </div>

      <div className="meta-grid">
        <article>
          <h4>Scheduled sessions</h4>
          <p>{scenarioSessionCount}</p>
        </article>
        <article>
          <h4>Response consistency</h4>
          <p>{scenario === "normal" ? "99.2%" : scenario === "finals" ? "97.8%" : "95.9%"}</p>
        </article>
        <article>
          <h4>Coverage status</h4>
          <p>{scenario === "normal" ? "Healthy" : scenario === "finals" ? "Busy" : "At risk"}</p>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="surface-card">
          <h3>Today timeline</h3>
          <div className="session-list">
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
        </article>

        <article className="surface-card">
          <h3>Session notes</h3>
          <p className="lead">Capture what you covered and what should happen next for the student.</p>
          <label className="notes-field">
            Session notes for your latest student
            <textarea
              rows={8}
              placeholder="What you covered, what to review next, and any follow-up notes..."
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
            />
          </label>
        </article>
      </div>
    </motion.section>
  );
}
