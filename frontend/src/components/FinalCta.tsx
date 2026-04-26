import { motion } from "framer-motion";
import { LogIn, Rocket } from "lucide-react";

const chips = [
  "No overlap scheduling",
  "Role-aware access",
  "Waitlist escalation",
  "Session audit trail",
];

export default function FinalCta() {
  return (
    <motion.section
      className="final-cta"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
    >
      <p className="eyebrow">04 | Ready to present</p>
      <h2>Show the full tutoring flow in under two minutes</h2>
      <p>
        Switch roles, make a booking, update statuses, and show session notes tied to real records
        so your walkthrough stays clear from start to finish.
      </p>
      <div className="cta-chip-grid">
        {chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
      <div className="hero-actions">
        <button className="primary-btn" type="button">
          <Rocket size={15} />
          Create account
        </button>
        <button className="ghost-btn" type="button">
          <LogIn size={15} />
          Sign in
        </button>
      </div>
    </motion.section>
  );
}
