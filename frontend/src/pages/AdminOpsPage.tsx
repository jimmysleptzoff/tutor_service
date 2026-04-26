import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { appointments } from "../data/mockData";
import { getAdminWaitlist } from "../services/schedulingService";

export default function AdminOpsPage() {
  // Waitlist is shown separately so admins can triage risk quickly.
  const queue = getAdminWaitlist();

  return (
    <motion.section
      className="panel ring-1 ring-white/10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="view-hero view-hero-admin">
        <p>Admin Command</p>
        <h3>See schedule health and waitlist pressure in one place</h3>
      </div>
      <div className="panel-header">
        <h2>Admin View</h2>
        <span className="chip">Operations overview</span>
      </div>
      <p className="lead">
        Keep an eye on booking health, waitlist demand, and overall session activity across the
        platform.
      </p>

      <div className="meta-grid">
        <article>
          <h4>Conflicts prevented</h4>
          <p>100%</p>
        </article>
        <article>
          <h4>Queue pressure</h4>
          <p>{queue.length} waiting</p>
        </article>
        <article>
          <h4>Audit readiness</h4>
          <p>Enabled</p>
        </article>
      </div>

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
                  {/* Visual status badge makes “Scheduled” vs “Waitlisted” readable at a glance. */}
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

      <h3 className="subheading">Waitlist Escalation Queue</h3>
      <ul className="list">
        {queue.map((entry) => (
          <li key={entry.id}>
            {entry.student} - {entry.course} (priority {entry.priority}): {entry.risk}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
