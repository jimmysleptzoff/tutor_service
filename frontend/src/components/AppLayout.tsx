import type { ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { AlertTriangle, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import type { DemoAlert, DemoRole, DemoScenario } from "../types/scheduling";

type Tab = {
  to: string;
  label: string;
  end?: boolean;
};

const tabs: Tab[] = [
  { to: "/", label: "Landing", end: true },
  { to: "/student", label: "Student" },
  { to: "/tutor", label: "Tutor" },
  { to: "/admin", label: "Admin" },
];

type AppLayoutProps = {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  scenario: DemoScenario;
  setScenario: (scenario: DemoScenario) => void;
  alerts: DemoAlert[];
  children: ReactNode;
};

export default function AppLayout({
  role,
  setRole,
  scenario,
  setScenario,
  alerts,
  children,
}: AppLayoutProps) {
  const { scrollYProgress } = useScroll();
  const location = useLocation();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: 0.28 });

  const viewLabel = location.pathname === "/" ? "Overview" : role === "student" ? "Student Dashboard" : role === "tutor" ? "Tutor Dashboard" : "Admin Dashboard";

  return (
    <div className={`app-shell antialiased role-${role}`}>
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} />
      <div className="dashboard-frame">
        <div className="content-wrap">
          <motion.header
            className="top-bar ring-1 ring-white/10"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="top-head">
              <p className="brand-inline">Tutoring Scheduler</p>
              <p className="eyebrow">Operations View</p>
              <h1 className="view-title">{viewLabel}</h1>
              <p className="tagline">Track scheduling quality, session readiness, and queue pressure in one place.</p>
            </div>
            <div className="top-controls">
              <label className="role-switch">
                Active role
                <select value={role} onChange={(event) => setRole(event.target.value as DemoRole)}>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="live-pill">
                <span className="live-dot" />
                <span>{role.toUpperCase()} VIEW</span>
              </div>
              <div className="status-strip">
                <span>
                  <Gauge size={13} />
                  System healthy
                </span>
                <span>
                  <ShieldCheck size={13} />
                  Role-safe controls
                </span>
              </div>
            </div>
          </motion.header>

          <motion.nav
            className="nav-tabs rounded-2xl"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
          >
            {tabs.map((tab) => (
              <NavLink key={tab.to} to={tab.to} end={tab.end}>
                {tab.label}
              </NavLink>
            ))}
          </motion.nav>

          <section className="demo-command">
            <article className="surface-card">
              <div className="panel-header">
                <h2>Scenario Studio</h2>
                <span className="chip">Live environment</span>
              </div>
              <div className="command-grid">
                <label className="role-switch">
                  Demo scenario
                  <select value={scenario} onChange={(event) => setScenario(event.target.value as DemoScenario)}>
                    <option value="normal">Normal Week</option>
                    <option value="finals">Finals Week Surge</option>
                    <option value="tutor_shortage">Tutor Sick Day</option>
                  </select>
                </label>
                <p className="scenario-copy">
                  Switch pressure conditions instantly and watch KPIs, queue pressure, and readiness shift
                  in real time.
                </p>
              </div>
            </article>

            <article className="surface-card">
              <div className="panel-header">
                <h2>Live Alerts</h2>
                <span className="chip">{alerts.length} active</span>
              </div>
              <div className="alerts-stack">
                {alerts.map((alert) => (
                  <p key={alert.id} className={`alert-pill ${alert.level}`}>
                    <AlertTriangle size={14} />
                    {alert.message}
                  </p>
                ))}
              </div>
            </article>
          </section>

          <main className="space-y-4 sm:space-y-5">{children}</main>

          <footer className="footer-note">
            <Sparkles size={14} />
            <span>Demo mode: {role.toUpperCase()} view active. Booking conflicts are checked automatically.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
