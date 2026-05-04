/**
 * Tutor dashboard — personal session queue for the logged-in tutor (group project)
 * --------------------------------------------------------------------------------
 * Matching rule: appointment rows use `tutorId`. In our schema/auth seeding, the tutor account’s
 * **`user.studentId` is aligned with `tutor.tutorId`** so we can filter without a second API field.
 * If the backend later returns a dedicated `tutorId` on the user object, extend `tutorKey()` only.
 *
 * UI deliverable notes:
 * - Same “elite shell” patterns as the student page: mesh, gradient hero, KPI row, timeline rail.
 * - Upcoming vs history split mirrors the student experience for grading consistency.
 * - Toast + loading states use the shared Framer presets in `../dashboard/shared.ts`.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../api";
import {
  dashboardContainerVariants,
  dashboardItemVariants,
  formatRelativeSessionTime,
  timeOfDayGreeting,
} from "../dashboard/shared";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  CircleSlash2,
  Clock3,
  LayoutGrid,
  MonitorPlay,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  UserRound,
  Zap,
} from "lucide-react";

/** In this schema, tutors log in with `studentId` aligned to `tutor.tutorId`. */
function tutorKey(user: any): string {
  return String(user?.studentId ?? user?.tutorId ?? "");
}

export default function TutorDashboardPage({ user }: any) {
  const [isCompact, setIsCompact] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/appointments"));
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1050);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const key = tutorKey(user);
  const mySessions = useMemo(
    () => appointments.filter((a) => String(a.tutorId) === key),
    [appointments, key]
  );

  const now = new Date();

  // Same partition semantics as the student "Session intelligence" column (future vs past/cancelled).
  const { upcomingSorted, historySorted } = useMemo(() => {
    const n = new Date();
    const upcoming = mySessions
      .filter((a) => a.status !== "cancelled" && new Date(a.startDateTime) >= n)
      .sort((a, b) => +new Date(a.startDateTime) - +new Date(b.startDateTime));
    const history = mySessions
      .filter((a) => a.status === "cancelled" || new Date(a.startDateTime) < n)
      .sort((a, b) => +new Date(b.startDateTime) - +new Date(a.startDateTime));
    return { upcomingSorted: upcoming, historySorted: history };
  }, [mySessions]);

  const nextSession = upcomingSorted[0];
  const activeCount = mySessions.filter((s) => s.status !== "cancelled").length;
  const cancelledCount = mySessions.filter((s) => s.status === "cancelled").length;

  const isError = message.toLowerCase().includes("error");

  const cancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}/cancel`), {
      method: "PUT",
    });

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    } else {
      setMessage("Error cancelling session");
    }
  };

  return (
    <motion.div
      style={styles.page}
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="show"
    >
      <div style={styles.mesh} aria-hidden />
      <div style={styles.meshB} aria-hidden />

      <motion.div
        variants={dashboardItemVariants}
        style={{ ...styles.heroOuter, ...(isCompact ? styles.heroOuterCompact : {}) }}
      >
        <motion.div
          aria-hidden
          style={styles.heroGlow}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <div style={{ ...styles.heroInner, ...(isCompact ? styles.heroInnerCompact : {}) }}>
          <div style={styles.heroLeft}>
            <div style={styles.heroEyebrowRow}>
              <span style={styles.heroIconBadge}>
                <Radar size={16} />
              </span>
              <span style={styles.heroEyebrow}>Tutor workspace</span>
            </div>
            <h1 style={styles.heroH1}>
              {timeOfDayGreeting()},{" "}
              <span style={styles.heroName}>{user.firstName}</span>
            </h1>
            <p style={styles.heroLead}>
              Your queue, distilled: who is coming up, what they need, and where you meet — in one
              glance.
            </p>
            <div style={styles.heroTrust}>
              <ShieldCheck size={14} style={{ opacity: 0.85 }} />
              <span>Live roster · Status-aware · Built for back-to-back days</span>
            </div>
          </div>
          <div style={{ ...styles.heroRight, ...(isCompact ? styles.heroRightCompact : {}) }}>
            <div style={styles.nextCard}>
              <p style={styles.nextLabel}>
                <Timer size={13} />
                Next session
              </p>
              {nextSession ? (
                <>
                  <p style={styles.nextCourse}>{nextSession.courseNum}</p>
                  <p style={styles.nextMeta}>
                    <UserRound size={13} />
                    Student {nextSession.studentId}
                  </p>
                  <p style={styles.nextWhen}>
                    {formatRelativeSessionTime(new Date(nextSession.startDateTime), now)} ·{" "}
                    {new Date(nextSession.startDateTime).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <div style={styles.nextPillRow}>
                    <span style={styles.nextPill}>
                      {nextSession.mode === "online" ? (
                        <MonitorPlay size={12} />
                      ) : (
                        <Building2 size={12} />
                      )}
                      {nextSession.mode === "online" ? "Online" : "In person"}
                    </span>
                  </div>
                </>
              ) : (
                <div style={styles.nextEmpty}>
                  <CircleDashed size={22} style={{ opacity: 0.7 }} />
                  <p style={styles.nextEmptyTitle}>Quiet calendar</p>
                  <p style={styles.nextEmptySub}>
                    When students book you, the next commitment lands here automatically.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={styles.heroRibbon}>
          <LayoutGrid size={14} />
          <span>Dashboard</span>
          <ChevronRight size={14} style={{ opacity: 0.5 }} />
          <span style={{ color: "#5eead4" }}>Tutor ops</span>
        </div>
      </motion.div>

      <motion.div
        variants={dashboardItemVariants}
        style={{ ...styles.kpiRow, ...(isCompact ? styles.kpiRowCompact : {}) }}
      >
        {[
          {
            label: "Total bookings",
            value: mySessions.length,
            hint: "All-time with you",
            icon: CalendarDays,
            accent: "rgba(45, 212, 191, 0.35)",
          },
          {
            label: "Active roster",
            value: activeCount,
            hint: "Non-cancelled",
            icon: Zap,
            accent: "rgba(34, 211, 238, 0.28)",
          },
          {
            label: "Cancelled",
            value: cancelledCount,
            hint: "Released slots",
            icon: Ban,
            accent: "rgba(52, 211, 153, 0.2)",
          },
        ].map((k) => (
          <motion.div
            key={k.label}
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            style={{ ...styles.kpiCard, borderColor: k.accent }}
          >
            <div style={styles.kpiTop}>
              <span style={{ ...styles.kpiIconWrap, background: k.accent }}>
                <k.icon size={17} />
              </span>
              <Star size={14} style={{ opacity: 0.25 }} />
            </div>
            <p style={styles.kpiLabel}>{k.label}</p>
            <p style={styles.kpiValue}>{loading ? "—" : k.value}</p>
            <p style={styles.kpiHint}>{k.hint}</p>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              ...styles.message,
              ...(isError ? styles.messageError : styles.messageSuccess),
            }}
          >
            {isError ? <CircleSlash2 size={16} /> : <CheckCircle2 size={16} />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={dashboardItemVariants}
        layout
        whileHover={{ y: -2 }}
        style={{ ...styles.card, ...(isCompact ? styles.cardCompact : {}) }}
      >
        <div style={styles.cardHead}>
          <div>
            <h2 style={styles.cardTitle}>Session queue</h2>
            <p style={styles.cardSubtitle}>
              Scan delivery mode, student ID, and timing — cancel with one tap when plans shift.
            </p>
          </div>
          <span style={styles.cardChip}>
            <Sparkles size={13} />
            Live
          </span>
        </div>

        {loading && (
          <div style={styles.skeletonStack}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={styles.skeletonLine}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        )}

        {!loading && mySessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIcon}>
              <Radar size={26} />
            </div>
            <div>
              <p style={styles.emptyTitle}>No sessions on your roster</p>
              <p style={styles.emptyText}>
                As soon as a student books you for a slot, it will appear here with full context.
              </p>
            </div>
          </motion.div>
        )}

        {!loading && mySessions.length > 0 && (
          <>
            {upcomingSorted.length > 0 && (
              <div style={styles.block}>
                <p style={styles.blockTitle}>
                  <Zap size={14} />
                  Upcoming
                </p>
                <div style={styles.timeline}>
                  {upcomingSorted.map((a, idx) => (
                    <TutorSessionRow
                      key={a.appointmentId}
                      a={a}
                      now={now}
                      showLine={idx < upcomingSorted.length - 1}
                      onCancel={() => cancelSession(a.appointmentId)}
                    />
                  ))}
                </div>
              </div>
            )}
            {historySorted.length > 0 && (
              <div style={{ ...styles.block, marginTop: upcomingSorted.length ? 18 : 0 }}>
                <p style={styles.blockTitleMuted}>
                  <Clock3 size={14} />
                  History
                </p>
                <div style={styles.timeline}>
                  {historySorted.map((a, idx) => (
                    <TutorSessionRow
                      key={a.appointmentId}
                      a={a}
                      now={now}
                      showLine={idx < historySorted.length - 1}
                      onCancel={() => cancelSession(a.appointmentId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function TutorSessionRow({
  a,
  now,
  showLine,
  onCancel,
}: {
  a: any;
  now: Date;
  showLine: boolean;
  onCancel: () => void;
}) {
  const dt = new Date(a.startDateTime);
  const rel = formatRelativeSessionTime(dt, now);
  const isCancelled = a.status === "cancelled";
  const isUpcoming = !isCancelled && dt >= now;

  return (
    <div style={styles.tlItem}>
      <div style={styles.tlRail}>
        <span
          style={{
            ...styles.tlDot,
            ...(isUpcoming ? styles.tlDotHot : {}),
            ...(isCancelled ? styles.tlDotCancelled : {}),
          }}
        />
        {showLine && <span style={styles.tlLine} />}
      </div>
      <motion.div
        layout
        whileHover={{ scale: 1.005 }}
        style={{
          ...styles.session,
          ...(isUpcoming ? styles.sessionHot : {}),
          ...(isCancelled ? styles.sessionCancelled : {}),
        }}
      >
        <div style={styles.sessionMain}>
          <span style={styles.courseBadge}>{a.courseNum}</span>
          <p style={styles.sessionStudent}>
            <UserRound size={14} />
            Student {a.studentId}
          </p>
          <p style={styles.meta}>
            {a.mode === "online" ? <MonitorPlay size={13} /> : <Building2 size={13} />}
            <span style={{ textTransform: "capitalize" }}>{String(a.mode || "").replace("_", " ")}</span>
            {a.location ? (
              <>
                <span style={styles.metaDot}>·</span>
                {a.location}
              </>
            ) : null}
          </p>
        </div>
        <div style={styles.sessionAside}>
          <p style={styles.relTime}>{rel}</p>
          <p style={styles.absTime}>
            {dt.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
          <span
            style={{
              ...styles.statusPill,
              ...(isCancelled ? styles.statusCancelled : styles.statusActive),
            }}
          >
            {a.status}
          </span>
          {!isCancelled && (
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              style={styles.cancel}
              onClick={onCancel}
            >
              <CircleSlash2 size={14} />
              Cancel
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* All layout/color tokens for this page live here (see StudentBookingPage for the same pattern). */
const styles: any = {
  page: {
    width: "100%",
    maxWidth: "1220px",
    margin: "0 auto",
    position: "relative",
    paddingBottom: "28px",
  },
  mesh: {
    pointerEvents: "none",
    position: "absolute",
    inset: "-4% -10% auto -10%",
    height: "300px",
    background:
      "radial-gradient(ellipse 70% 55% at 15% 18%, rgba(45,212,191,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 10%, rgba(34,211,238,0.1), transparent 50%)",
    zIndex: 0,
  },
  meshB: {
    pointerEvents: "none",
    position: "absolute",
    inset: "auto -20% -8% -20%",
    height: "220px",
    background:
      "radial-gradient(ellipse 55% 45% at 50% 100%, rgba(13,148,136,0.08), transparent 55%)",
    zIndex: 0,
  },

  heroOuter: {
    position: "relative",
    zIndex: 1,
    marginBottom: "20px",
    borderRadius: "22px",
    padding: "2px",
    background:
      "linear-gradient(135deg, rgba(45,212,191,0.55) 0%, rgba(20,184,166,0.35) 45%, rgba(6,182,212,0.28) 100%)",
    boxShadow: "0 24px 60px rgba(2, 6, 23, 0.55), 0 0 0 1px rgba(148,163,184,0.1)",
  },
  heroOuterCompact: {},
  heroGlow: {
    position: "absolute",
    inset: "-30%",
    background: "radial-gradient(circle at 28% 38%, rgba(45,212,191,0.22), transparent 45%)",
    zIndex: 0,
  },
  heroInner: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    background:
      "linear-gradient(165deg, rgba(15,23,42,0.95) 0%, rgba(12,28,48,0.9) 48%, rgba(8,25,35,0.94) 100%)",
    backdropFilter: "blur(12px)",
    padding: "26px 26px 20px",
    display: "grid",
    gridTemplateColumns: "1.25fr 0.95fr",
    gap: "22px",
    overflow: "hidden",
  },
  heroInnerCompact: { gridTemplateColumns: "1fr", padding: "22px 20px 18px" },
  heroLeft: { minWidth: 0 },
  heroEyebrowRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  heroIconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(45,212,191,0.2), rgba(15,23,42,0.85))",
    border: "1px solid rgba(45,212,191,0.38)",
    color: "#5eead4",
  },
  heroEyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#5eead4",
  },
  heroH1: {
    margin: 0,
    fontSize: "clamp(26px, 3.2vw, 34px)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    color: "#f8fafc",
  },
  heroName: {
    background: "linear-gradient(90deg, #5eead4, #67e8f9)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  heroLead: {
    margin: "12px 0 0",
    maxWidth: "520px",
    fontSize: "15px",
    lineHeight: 1.55,
    color: "#94a3b8",
  },
  heroTrust: {
    marginTop: "18px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#64748b",
  },
  heroRight: { minWidth: 0 },
  heroRightCompact: { gridColumn: "1 / -1" },
  nextCard: {
    height: "100%",
    minHeight: "168px",
    borderRadius: "16px",
    padding: "16px 18px",
    border: "1px solid rgba(45,212,191,0.25)",
    background:
      "linear-gradient(145deg, rgba(19,78,74,0.4) 0%, rgba(15,23,42,0.78) 100%), rgba(15,23,42,0.35)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  nextLabel: {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#2dd4bf",
  },
  nextCourse: {
    margin: "12px 0 0",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#ccfbf1",
  },
  nextMeta: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#99f6e4",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  nextWhen: {
    margin: "10px 0 0",
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.45,
  },
  nextPillRow: { marginTop: "12px" },
  nextPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "5px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(45,212,191,0.35)",
    color: "#99f6e4",
    background: "rgba(19,78,74,0.35)",
  },
  nextEmpty: { marginTop: "8px", textAlign: "center", padding: "8px 4px 4px", color: "#64748b" },
  nextEmptyTitle: { margin: "10px 0 4px", fontSize: "15px", fontWeight: 700, color: "#cbd5e1" },
  nextEmptySub: { margin: 0, fontSize: "12px", lineHeight: 1.5, color: "#64748b" },
  heroRibbon: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 22px 14px",
    fontSize: "12px",
    color: "#64748b",
    borderTop: "1px solid rgba(148,163,184,0.12)",
    background: "rgba(2,6,23,0.35)",
    borderRadius: "0 0 18px 18px",
  },

  kpiRow: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  kpiRowCompact: { gridTemplateColumns: "1fr" },
  kpiCard: {
    borderRadius: "16px",
    padding: "16px 18px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "linear-gradient(180deg, rgba(24,44,71,0.55) 0%, rgba(12,28,48,0.78) 100%)",
    boxShadow: "0 14px 36px rgba(2,6,23,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  kpiTop: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  kpiIconWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccfbf1",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  kpiLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  kpiValue: {
    margin: "8px 0 4px",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1,
    color: "#f1f5f9",
  },
  kpiHint: { margin: 0, fontSize: "12px", color: "#64748b" },

  message: {
    position: "relative",
    zIndex: 1,
    marginBottom: "16px",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 600,
    fontSize: "14px",
  },
  messageSuccess: {
    color: "#bbf7d0",
    background: "linear-gradient(90deg, rgba(22,101,52,0.45), rgba(15,23,42,0.5))",
    border: "1px solid rgba(74,222,128,0.4)",
  },
  messageError: {
    color: "#fecaca",
    background: "linear-gradient(90deg, rgba(127,29,29,0.45), rgba(15,23,42,0.5))",
    border: "1px solid rgba(248,113,113,0.4)",
  },

  card: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    border: "1px solid rgba(45,212,191,0.15)",
    background: "linear-gradient(180deg, rgba(24,44,71,0.5) 0%, rgba(12,28,48,0.88) 100%)",
    padding: "22px",
    boxShadow: "0 20px 50px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 70px rgba(20,184,166,0.06)",
  },
  cardCompact: { padding: "16px" },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "14px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#f8fafc",
  },
  cardSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
    maxWidth: "560px",
  },
  cardChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    border: "1px solid rgba(45,212,191,0.35)",
    color: "#5eead4",
    background: "rgba(19,78,74,0.4)",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "6px 12px",
  },

  block: {},
  blockTitle: {
    margin: "0 0 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#2dd4bf",
  },
  blockTitleMuted: {
    margin: "0 0 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  timeline: { display: "flex", flexDirection: "column", gap: 0 },

  tlItem: { display: "flex", gap: "12px", alignItems: "stretch" },
  tlRail: {
    width: "18px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "18px",
  },
  tlDot: {
    width: "11px",
    height: "11px",
    borderRadius: "999px",
    background: "#334155",
    border: "2px solid rgba(148,163,184,0.5)",
    flexShrink: 0,
  },
  tlDotHot: {
    background: "linear-gradient(145deg, #2dd4bf, #06b6d4)",
    borderColor: "rgba(45,212,191,0.65)",
    boxShadow: "0 0 14px rgba(45,212,191,0.4)",
  },
  tlDotCancelled: {
    background: "#7f1d1d",
    borderColor: "rgba(248,113,113,0.5)",
  },
  tlLine: {
    width: "2px",
    flex: 1,
    minHeight: "12px",
    marginTop: "4px",
    borderRadius: "2px",
    background: "linear-gradient(180deg, rgba(45,212,191,0.35), rgba(51,65,85,0.25))",
  },

  session: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "4px",
    padding: "14px 16px",
    background: "rgba(2,6,23,0.45)",
    border: "1px solid rgba(51,65,85,0.5)",
    borderRadius: "14px",
  },
  sessionHot: {
    borderColor: "rgba(45,212,191,0.28)",
    background: "linear-gradient(135deg, rgba(19,78,74,0.35) 0%, rgba(2,6,23,0.55) 100%)",
    boxShadow: "0 12px 28px rgba(2,6,23,0.35)",
  },
  sessionCancelled: { opacity: 0.82 },
  sessionMain: { minWidth: 0 },
  sessionAside: { textAlign: "right", flexShrink: 0, minWidth: "112px" },
  courseBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "4px 9px",
    borderRadius: "8px",
    background: "rgba(45,212,191,0.12)",
    border: "1px solid rgba(45,212,191,0.35)",
    color: "#5eead4",
  },
  sessionStudent: {
    margin: "8px 0 4px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  meta: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
  },
  metaDot: { opacity: 0.5 },
  relTime: { margin: 0, fontSize: "13px", fontWeight: 800, color: "#5eead4" },
  absTime: { margin: "4px 0 8px", fontSize: "11px", color: "#64748b" },
  statusPill: {
    display: "inline-flex",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "capitalize",
    border: "1px solid transparent",
  },
  statusActive: {
    color: "#86efac",
    background: "rgba(22,101,52,0.35)",
    borderColor: "rgba(74,222,128,0.4)",
  },
  statusCancelled: {
    color: "#fca5a5",
    background: "rgba(127,29,29,0.35)",
    borderColor: "rgba(248,113,113,0.4)",
  },
  cancel: {
    marginTop: "10px",
    padding: "8px 12px",
    background: "linear-gradient(180deg, rgba(245,158,11,0.95), rgba(217,119,6,0.98))",
    border: "1px solid rgba(253,186,116,0.45)",
    borderRadius: "10px",
    color: "white",
    fontWeight: 700,
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
  },

  skeletonStack: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0" },
  skeletonLine: {
    height: "52px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(24,44,71,0.65), rgba(51,65,85,0.4))",
  },
  emptyState: {
    border: "1px dashed rgba(45,212,191,0.28)",
    borderRadius: "16px",
    padding: "22px",
    background: "rgba(19,78,74,0.12)",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  emptyIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(45,212,191,0.2), rgba(15,23,42,0.85))",
    border: "1px solid rgba(45,212,191,0.3)",
    color: "#5eead4",
    flexShrink: 0,
  },
  emptyTitle: { margin: "0 0 6px", color: "#ccfbf1", fontWeight: 800, fontSize: "16px" },
  emptyText: { margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: 1.55 },
};
