import { motion } from "framer-motion";
import { Rocket, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FinalCta from "../components/FinalCta";
import OpsShowcase from "../components/OpsShowcase";
import ScrollReveal from "../components/ScrollReveal";
import StatGrid from "../components/StatGrid";
import TrustStrip from "../components/TrustStrip";
import { metrics } from "../data/mockData";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-stack">
      <motion.section
        className="hero-panel ring-1 ring-white/10"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="hero-ambient" />
        <div className="hero-floor" />
        <div className="hero-core">
          <div className="signal-row signal-row-minimal">
            <span>
              <ShieldCheck size={13} />
              <span>98% sessions completed</span>
            </span>
            <span>
              <Rocket size={13} />
              <span>Live tutor availability</span>
            </span>
          </div>
          <p className="eyebrow">Tutor-Ready Platform</p>
          <h1>Book smarter. Tutor with confidence.</h1>
          <p className="lead">
            Schedule tutoring by course, see open tutor times in real time, and keep session notes
            in one place so your team can show the full workflow clearly.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" type="button" onClick={() => navigate("/student")}>
              Create free account
            </button>
            <button className="ghost-btn" type="button" onClick={() => navigate("/tutor")}>
              I already have access
            </button>
          </div>
          <p className="hero-microline">No credit card required · reliable for live demos</p>
        </div>
      </motion.section>

      <ScrollReveal className="panel ring-1 ring-white/10" delay={0.03}>
        <div className="section-head">
          <p className="eyebrow">01 | Platform</p>
          <h2>Everything your section needs</h2>
        </div>
        <p className="lead">
          Students can find open help quickly, and tutors can protect their calendars without
          awkward double-booking before exam week.
        </p>
      </ScrollReveal>

      <ScrollReveal className="panel ring-1 ring-white/10" delay={0.05}>
        <div className="section-head">
          <p className="eyebrow">02 | Why it feels different</p>
          <h2>Scheduling you can trust</h2>
        </div>
        <TrustStrip />
      </ScrollReveal>

      <ScrollReveal className="panel ring-1 ring-white/10" delay={0.06}>
        <StatGrid items={metrics} />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <OpsShowcase />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <FinalCta />
      </ScrollReveal>
    </div>
  );
}
