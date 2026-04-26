import { motion } from "framer-motion";
import { Ban, CalendarCheck2, ShieldCheck } from "lucide-react";

const trustItems = [
  {
    icon: Ban,
    title: "No double-booking",
    body: "Tutor time is checked automatically, so overlapping appointments do not slip through.",
  },
  {
    icon: CalendarCheck2,
    title: "Real availability",
    body: "Open times come from live availability, not a copied spreadsheet.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware access",
    body: "Students, tutors, and admins each get the tools that fit what they need to do.",
  },
];

export default function TrustStrip() {
  return (
    <div className="trust-grid">
      {trustItems.map((item, index) => (
        <motion.article
          key={item.title}
          className="trust-card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <div className="icon-pill">
            <item.icon size={16} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </motion.article>
      ))}
    </div>
  );
}
