import { motion } from "framer-motion";
import { Activity, CalendarRange, ShieldCheck, Users } from "lucide-react";

const heatmapRows = [
  { course: "CS110", load: [2, 4, 6, 8, 6, 3] },
  { course: "MATH155", load: [1, 3, 5, 7, 8, 5] },
  { course: "CHEM115", load: [0, 2, 4, 5, 4, 2] },
];

const telemetry = [
  {
    title: "2.7x faster coordination",
    body: "When times are clearly structured, tutors spend less time in back-and-forth messages.",
  },
  {
    title: "Queue pressure visibility",
    body: "Admins can spot demand spikes early and add coverage before students drop off.",
  },
  {
    title: "Audit-ready records",
    body: "Appointments and notes are easy to trace when someone needs to review what happened.",
  },
];

function cellClass(load: number): string {
  if (load <= 2) return "heat-cell low";
  if (load <= 5) return "heat-cell medium";
  return "heat-cell high";
}

export default function OpsShowcase() {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Built for real tutoring operations</h2>
        <span className="chip">03 | Operations insight</span>
      </div>
      <p className="lead">
        This is more than a booking form. It gives your team clear demand signals, safe matching,
        and useful metrics during busy weeks.
      </p>

      <div className="ops-grid">
        <motion.article
          className="ops-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
        >
          <div className="ops-title-row">
            <p>
              <CalendarRange size={15} />
              <span>Demand heatmap</span>
            </p>
            <span>Finals week simulation</span>
          </div>
          {heatmapRows.map((row) => (
            <div key={row.course} className="heat-row">
              <strong>{row.course}</strong>
              <div className="heat-cells">
                {row.load.map((load, index) => (
                  <span key={`${row.course}-${index}`} className={cellClass(load)} />
                ))}
              </div>
            </div>
          ))}
        </motion.article>

        <motion.article
          className="ops-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="ops-title-row">
            <p>
              <ShieldCheck size={15} />
              <span>Match confidence</span>
            </p>
          </div>
          <div className="match-grid">
            <p>Tutor fit score: 94%</p>
            <p>Conflict risk: 0%</p>
          </div>
          <p className="lead">Keep pairings strong while still avoiding overlaps, even during peak demand.</p>
        </motion.article>
      </div>

      <div className="telemetry-grid">
        {telemetry.map((item, index) => (
          <motion.article
            key={item.title}
            className="telemetry-card"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            <div className="telemetry-head">
              {index === 0 ? <Users size={16} /> : index === 1 ? <Activity size={16} /> : <ShieldCheck size={16} />}
              <h4>{item.title}</h4>
            </div>
            <p>{item.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
