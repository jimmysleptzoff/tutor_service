/**
 * App shell — React Router + role dashboards (group project UI)
 * ---------------------------------------------------------------
 * What lives here:
 * - **Auth shell:** left `aside` navigation + main workspace with optional vertical scale on laptops.
 * - **Persistence:** reads `localStorage.user` on load; invalid/corrupt JSON is cleared safely.
 * - **Dev bypass:** `?devBypass=student|tutor|admin` in development auto-seeds a fake user (UI/video demos).
 * - **Role theming:** `roleTheme` drives sidebar gradient, rail color, and topbar pill so each role
 *   “feels” distinct (student=blue, tutor=teal, admin=violet) without duplicating page logic.
 * - **Routing:** `/` shows login or redirects to `/dashboard` when already signed in.
 * - **Sidebar dock:** `marginTop: auto` keeps **Log out** pinned to the bottom of the viewport-height
 *   column so it stays visible without scrolling the whole page.
 */
import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, LayoutDashboard, LogOut, Sparkles } from "lucide-react";

import { normalizeSessionUser } from "./api";
import LoginPage from "./pages/LoginPage";
import StudentBookingPage from "./pages/StudentBookingPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import AdminOpsPage from "./pages/AdminOpsPage";

type UserRole = "student" | "tutor" | "admin";

/** Lets designers hit `?devBypass=student|tutor|admin` in development without a real login. */
const DEV_BYPASS_PARAM = "devBypass";
const DEV_BYPASS_STORAGE_KEY = "devBypassRole";

function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "tutor" || value === "admin";
}

function getDevBypassUser(): Record<string, unknown> | null {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
    return null;
  }

  const roleFromQuery = new URLSearchParams(window.location.search).get(DEV_BYPASS_PARAM);
  const roleFromStorage = localStorage.getItem(DEV_BYPASS_STORAGE_KEY);
  const role = isUserRole(roleFromQuery)
    ? roleFromQuery
    : isUserRole(roleFromStorage)
      ? roleFromStorage
      : null;

  if (!role) {
    return null;
  }

  localStorage.setItem(DEV_BYPASS_STORAGE_KEY, role);

  return {
    studentId: 99999999,
    firstName: "Dev",
    lastName: "Bypass",
    email: "dev@local.test",
    role,
  };
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  /** Slight UI scale when logged in so dense dashboards fit on one screen (demo / laptop). */
  const [workspaceScale, setWorkspaceScale] = useState(1);
  const navigate = useNavigate();
  /** When logged out we still need a fallback for any stray `roleTheme` reads — student blue is neutral enough. */
  const role = (user?.role as UserRole | undefined) || "student";

  /**
   * Visual tokens shared by sidebar + topbar so the shell "rhymes" with each role dashboard
   * (student=blue/cyan, tutor=teal, admin=violet) without importing page-level style objects.
   */
  const roleTheme =
    role === "admin"
      ? {
          appGlow: "radial-gradient(circle at 20% -10%, rgba(192, 132, 252, 0.24), transparent 46%)",
          pill: "rgba(124, 58, 237, 0.38)",
          pillBorder: "rgba(216, 180, 254, 0.45)",
          pillGlow: "0 0 24px rgba(167, 139, 250, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
          rail: "#c084fc",
          railSoft: "rgba(192, 132, 252, 0.42)",
          sidebarBg:
            "linear-gradient(185deg, rgba(46,16,70,0.98) 0%, rgba(15,23,42,0.97) 45%, rgba(12,10,28,0.98) 100%)",
          rolePill: "rgba(124, 58, 237, 0.35)",
        }
      : role === "tutor"
        ? {
            appGlow: "radial-gradient(circle at 20% -10%, rgba(45, 212, 191, 0.22), transparent 46%)",
            pill: "rgba(13, 148, 136, 0.38)",
            pillBorder: "rgba(45, 212, 191, 0.48)",
            pillGlow: "0 0 24px rgba(45, 212, 191, 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
            rail: "#2dd4bf",
            railSoft: "rgba(45, 212, 191, 0.42)",
            sidebarBg:
              "linear-gradient(185deg, rgba(10,40,42,0.98) 0%, rgba(15,23,42,0.97) 48%, rgba(8,25,35,0.98) 100%)",
            rolePill: "rgba(13, 148, 136, 0.32)",
          }
        : {
            appGlow: "radial-gradient(circle at 20% -10%, rgba(96, 165, 250, 0.24), transparent 46%)",
            pill: "rgba(30, 58, 138, 0.4)",
            pillBorder: "rgba(125, 211, 252, 0.48)",
            pillGlow: "0 0 24px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
            rail: "#38bdf8",
            railSoft: "rgba(56, 189, 248, 0.4)",
            sidebarBg:
              "linear-gradient(185deg, rgba(15,30,62,0.98) 0%, rgba(15,23,42,0.97) 48%, rgba(8,20,45,0.98) 100%)",
            rolePill: "rgba(56, 189, 248, 0.22)",
          };

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 900);
      // Login page stays full size; dashboards zoom out a touch on typical laptop widths.
      if (w < 900) setWorkspaceScale(1);
      else if (w < 1200) setWorkspaceScale(0.88);
      else if (w < 1440) setWorkspaceScale(0.9);
      else if (w < 1680) setWorkspaceScale(0.92);
      else setWorkspaceScale(0.94);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Restore session after refresh; normalize shape so MySQL string ids / odd role casing never brick the SPA.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        const normalized = normalizeSessionUser(parsed);
        if (normalized) {
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        } else {
          localStorage.removeItem("user");
        }
        return;
      }
    } catch {
      localStorage.removeItem("user");
    }

    const bypassUser = getDevBypassUser();
    if (bypassUser) {
      const normalized = normalizeSessionUser(bypassUser);
      if (normalized) {
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  // In dev, if a bypass role is pinned, “logout” re-seeds the bypass user so designers aren’t kicked to cold login.
  const logout = () => {
    localStorage.removeItem("user");
    const devBypassRole = localStorage.getItem(DEV_BYPASS_STORAGE_KEY);
    const shouldKeepBypass =
      process.env.NODE_ENV === "development" && isUserRole(devBypassRole);

    if (shouldKeepBypass) {
      const bypassUser = getDevBypassUser();
      const normalized = bypassUser ? normalizeSessionUser(bypassUser) : null;
      if (normalized) {
        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        navigate("/dashboard");
        return;
      }
    }

    setUser(null);
    navigate("/");
  };

  const getDashboard = () => {
    if (!user) return <Navigate to="/" />;

    if (user.role === "student") return <StudentBookingPage user={user} />;
    if (user.role === "tutor") return <TutorDashboardPage user={user} />;
    if (user.role === "admin") return <AdminOpsPage user={user} />;

    return <Navigate to="/" />;
  };

  const scale = user ? workspaceScale : 1;

  return (
    <div style={{ ...styles.app, backgroundImage: roleTheme.appGlow }}>
      {/* Left rail: sticky within viewport so nav + logout stay usable while main content scrolls */}
      {user && (
        <aside
          style={{
            ...styles.sidebar,
            ...(isMobile ? styles.sidebarMobile : {}),
            background: roleTheme.sidebarBg,
            boxShadow: `inset 4px 0 0 0 ${roleTheme.rail}, inset -1px 0 0 rgba(148, 163, 184, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.1)`,
          }}
        >
          <div style={styles.brandRow}>
            <div
              style={{
                ...styles.brandMark,
                borderColor: roleTheme.rail,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 12px 28px rgba(0,0,0,0.35)`,
              }}
            >
              <CalendarDays size={isMobile ? 18 : 22} color={roleTheme.rail} />
            </div>
            <div style={{ ...styles.brandBlock, ...(isMobile ? styles.brandBlockMobile : {}) }}>
              <p style={{ ...styles.brandEyebrow, ...(isMobile ? styles.brandTextMobile : {}) }}>Tutor Service</p>
              <h2 style={{ ...styles.brandTitle, ...(isMobile ? styles.brandTextMobile : {}) }}>Scheduler</h2>
            </div>
          </div>

          <span
            style={{
              ...styles.rolePill,
              background: roleTheme.rolePill,
              borderColor: roleTheme.rail,
            }}
          >
            {String(user.role).replace(/^\w/, (c: string) => c.toUpperCase())} workspace
          </span>

          <p style={styles.navSectionLabel}>Navigation</p>
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              ...styles.navBtn,
              ...(isMobile ? styles.navBtnMobile : {}),
              borderColor: roleTheme.railSoft,
            }}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={15} />
            {user?.role === "student" && "My Sessions"}
            {user?.role === "tutor" && "My Schedule"}
            {user?.role === "admin" && "All Appointments"}
          </motion.button>

          <div style={styles.sidebarDock}>
            <p style={styles.accountLabel}>Account</p>
            <motion.button
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{ ...styles.logout, ...(isMobile ? styles.logoutMobile : {}) }}
              onClick={logout}
              type="button"
            >
              <LogOut size={15} />
              {!isMobile && "Log out"}
              {isMobile && "Out"}
            </motion.button>
            <p style={styles.sideFoot}>Studio edition</p>
          </div>
        </aside>
      )}

      <div style={styles.main}>
        {/* Decorative overlays for a premium "studio dashboard" look. */}
        <motion.div
          aria-hidden
          style={{ ...styles.bgOrbA, ...(isMobile ? styles.bgOrbAMobile : {}) }}
          animate={{ x: [0, 16, -10, 0], y: [0, -12, 8, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          style={{ ...styles.bgOrbB, ...(isMobile ? styles.bgOrbBMobile : {}) }}
          animate={{ x: [0, -12, 14, 0], y: [0, 10, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Scroll lives here; optional CSS scale below zooms dense dashboards on laptops (login stays scale=1). */}
        <div style={styles.mainScroll}>
          <div
            style={{
              ...styles.workspaceScaled,
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              width: scale !== 1 ? `${100 / scale}%` : "100%",
              minHeight: scale !== 1 ? `${100 / scale}%` : undefined,
            }}
          >
            <div
              style={{
                ...styles.topbar,
                ...(isMobile ? styles.topbarMobile : {}),
                ...(user
                  ? {
                      boxShadow: `0 8px 28px rgba(2, 6, 23, 0.25), inset 0 -1px 0 ${roleTheme.railSoft}`,
                    }
                  : {}),
              }}
            >
              {user && (
                <motion.span
                  whileHover={{ y: -1, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  style={{
                    ...styles.userPill,
                    background: roleTheme.pill,
                    borderColor: roleTheme.pillBorder,
                    boxShadow: roleTheme.pillGlow,
                  }}
                >
                  <Sparkles size={13} />
                  {user.firstName}
                  <span style={styles.userPillRole}>· {user.role}</span>
                </motion.span>
              )}
            </div>

            <div style={{ ...styles.content, ...(isMobile ? styles.contentMobile : {}) }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    user ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <LoginPage
                        setUser={(u: any) => {
                          const normalized = normalizeSessionUser(u);
                          if (normalized) {
                            setUser(normalized);
                            localStorage.setItem("user", JSON.stringify(normalized));
                            navigate("/dashboard");
                          }
                        }}
                      />
                    )
                  }
                />

                <Route path="/dashboard" element={getDashboard()} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    position: "relative",
  },

  sidebar: {
    width: "268px",
    flexShrink: 0,
    alignSelf: "flex-start",
    position: "sticky",
    top: 0,
    height: "100vh",
    maxHeight: "100vh",
    overflowY: "auto",
    overscrollBehavior: "contain",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.86) 100%)",
    borderRight: "1px solid rgba(148, 163, 184, 0.18)",
    padding: "22px 16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "inset -1px 0 0 rgba(148, 163, 184, 0.06)",
  },
  sidebarMobile: {
    width: "96px",
    padding: "16px 10px 14px",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },
  brandMark: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    border: "2px solid rgba(148, 163, 184, 0.35)",
    background: "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rolePill: {
    display: "inline-block",
    alignSelf: "flex-start",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#e2e8f0",
    marginBottom: "6px",
  },
  navSectionLabel: {
    margin: "12px 0 0",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  accountLabel: {
    margin: 0,
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  /** Pinned to the bottom of the viewport-height sidebar so Log out stays fully on-screen. */
  sidebarDock: {
    marginTop: "auto",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "12px",
    paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
  },

  brandBlock: {
    flex: 1,
    minWidth: 0,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.55)",
    padding: "10px 12px",
  },
  brandBlockMobile: {
    padding: "8px",
    display: "none",
  },

  brandEyebrow: {
    margin: 0,
    color: "#93c5fd",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 700,
  },

  brandTitle: {
    margin: "6px 0 0",
    fontSize: "20px",
  },
  brandTextMobile: {
    display: "none",
  },

  navBtn: {
    background: "linear-gradient(180deg, #1e293b 0%, #172033 100%)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 600,
    transition: "all 180ms ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navBtnMobile: {
    fontSize: "0",
    justifyContent: "center",
    padding: "10px 8px",
  },

  logout: {
    marginTop: 0,
    background: "linear-gradient(180deg, rgba(239,68,68,0.95) 0%, rgba(185,28,28,0.98) 100%)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
    padding: "12px 12px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    transition: "all 180ms ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 10px 26px rgba(220, 38, 38, 0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
  },
  logoutMobile: {
    fontSize: "0",
    padding: "10px 8px",
  },
  sideFoot: {
    margin: "4px 2px 0",
    color: "#64748b",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  main: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  mainScroll: {
    flex: 1,
    overflow: "auto",
    position: "relative",
    zIndex: 1,
  },
  workspaceScaled: {
    transformOrigin: "0 0",
    position: "relative",
  },

  topbar: {
    height: "60px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
    background: "rgba(2, 6, 23, 0.66)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 24px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 8px 28px rgba(2, 6, 23, 0.25)",
  },
  topbarMobile: {
    height: "52px",
    padding: "0 12px",
  },

  content: {
    padding: "22px 24px 30px",
    maxWidth: "1320px",
    position: "relative",
    zIndex: 1,
  },
  contentMobile: {
    padding: "14px 12px 18px",
  },

  userPill: {
    border: "1px solid rgba(96, 165, 250, 0.3)",
    borderRadius: "999px",
    background: "rgba(30, 58, 138, 0.35)",
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#f1f5ff",
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
  },
  userPillRole: {
    fontWeight: 500,
    opacity: 0.88,
    textTransform: "lowercase",
    letterSpacing: "0.02em",
  },
  bgOrbA: {
    position: "absolute",
    width: "420px",
    height: "420px",
    top: "-120px",
    right: "-90px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.24), rgba(30,64,175,0) 65%)",
    filter: "blur(8px)",
    pointerEvents: "none",
  },
  bgOrbAMobile: {
    width: "240px",
    height: "240px",
    top: "-70px",
    right: "-60px",
  },
  bgOrbB: {
    position: "absolute",
    width: "380px",
    height: "380px",
    bottom: "-110px",
    left: "-100px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 60% 40%, rgba(192,132,252,0.2), rgba(107,33,168,0) 66%)",
    filter: "blur(10px)",
    pointerEvents: "none",
  },
  bgOrbBMobile: {
    width: "220px",
    height: "220px",
    bottom: "-80px",
    left: "-70px",
  },
};