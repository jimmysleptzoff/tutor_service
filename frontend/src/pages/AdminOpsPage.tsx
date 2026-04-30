import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { appointments } from "../data/mockData";
import { getAdminWaitlist } from "../services/schedulingService";
import type { DemoScenario } from "../types/scheduling";

type AdminOpsPageProps = {
  scenario: DemoScenario;
};

export default function AdminOpsPage({ scenario }: AdminOpsPageProps) {
  const queue = getAdminWaitlist();
  const scenarioQueueCount = scenario === "finals" ? queue.length + 3 : scenario === "tutor_shortage" ? queue.length + 2 : queue.length;

  return (
    <motion.section
      className="panel ring-1 ring-white/10 dashboard-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel-header">
        <h2>Admin View</h2>
        <span className="chip">Operations command</span>
      </div>

      <div className="meta-grid">
        <article>
          <h4>Conflicts prevented</h4>
          <p>{scenario === "normal" ? "100%" : scenario === "finals" ? "97%" : "94%"}</p>
        </article>
        <article>
          <h4>Queue pressure</h4>
          <p>{scenarioQueueCount} waiting</p>
        </article>
        <article>
          <h4>Audit readiness</h4>
          <p>{scenario === "tutor_shortage" ? "Monitoring" : "Enabled"}</p>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="surface-card">
          <h3>Session oversight</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Course</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.student}</td>
                    <td>{appointment.tutor}</td>
                    <td>{appointment.course}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`status-pill ${appointment.status === "Scheduled" ? "scheduled" : "waitlisted"}`}>
                        {appointment.status === "Scheduled" ? <ShieldCheck size={12} /> : <AlertTriangle size={12} />}
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="surface-card">
          <h3>Waitlist escalation queue</h3>
          <ul className="list">
            {queue.map((entry) => (
              <li key={entry.id}>
                {entry.student} - {entry.course} (priority {entry.priority}): {entry.risk}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </motion.section>
  );
}
