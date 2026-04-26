import type { ReactNode } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { DemoRole } from "../types/scheduling";

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
  children: ReactNode;
};

export default function AppLayout({ role, setRole, children }: AppLayoutProps) {
  const { scrollYProgress } = useScroll();
  // Spring keeps the progress bar smooth instead of jumpy.
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 22, mass: 0.28 });

  return (
    <div className={`app-shell antialiased role-${role}`}>
      <motion.div className="scroll-progress" style={{ scaleX: smoothProgress }} />
      <div className="content-wrap px-1 sm:px-2 lg:px-3">
        <motion.header
          className="top-bar ring-1 ring-white/10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="top-head">
            <div className="brand-wrap">
              <span className="brand-tile" aria-hidden>
                TS
              </span>
              <div>
                <p className="brand">Tutoring Scheduler</p>
                <p className="tagline">Scheduling built for campus tutoring teams.</p>
              </div>
            </div>
            <div className="status-strip">
              <span>
                <Gauge size={13} />
                Ready for demo
              </span>
              <span>
                <ShieldCheck size={13} />
                Role-based access
              </span>
            </div>
          </div>
          <div className="top-controls">
            <label className="role-switch">
              Demo role
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
          </div>
        </motion.header>

        <motion.nav
          className="nav-tabs rounded-2xl"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
        >
          {/* Keep tabs explicit so teammates can demo each role flow quickly. */}
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `transition-all duration-300 hover:shadow-glow ${isActive ? "active" : ""}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </motion.nav>

        <main className="space-y-4 sm:space-y-5">{children}</main>

        <footer className="footer-note">
          <Sparkles size={14} />
          <span>Demo mode: {role.toUpperCase()} view active. Booking conflicts are checked automatically.</span>
        </footer>
      </div>
    </div>
  );
}
