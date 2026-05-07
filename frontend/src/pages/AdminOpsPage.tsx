/**
 * Admin dashboard — “control tower” for all appointments (group project)
 * ------------------------------------------------------------------------
 * - Lists **every** appointment with search (course / student id / tutor) + status chips.
 * - **Chart:** buckets counts by calendar day (local date string) — sorted so the bar chart reads
 *   chronologically left → right (easier to narrate in a recorded demo).
 * - **Actions:** cancel (keeps row, status flip) vs delete (hard remove) — both confirm() first.
 * - **UI pass:** violet hero shell, KPI cards, springy chart bars, skeletons while loading — matches
 *   the same motion tokens as other dashboards (`../dashboard/shared.ts`).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../api";
import {
  dashboardContainerVariants,
  dashboardItemVariants,
  timeOfDayGreeting,
} from "../dashboard/shared";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Crown,
  Filter,
  LayoutGrid,
  Search,
  Sparkles,
  Trash2,
  XCircle,
  CalendarClock,
  UserRound,
  GraduationCap,
  CircleSlash2,
} from "lucide-react";

export default function AdminOpsPage({ user }: any) {
  const [isCompact, setIsCompact] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [courseTotals, setCourseTotals] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appointmentsRes, totalsRes] = await Promise.all([
        fetch(apiUrl("/appointments")),
        fetch(apiUrl("/reports/appointments-by-course")),
      ]);
      const appointmentsData = await appointmentsRes.json();
      const totalsData = await totalsRes.json().catch(() => []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setCourseTotals(Array.isArray(totalsData) ? totalsData : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1100);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Bucket by calendar day in the viewer's locale, then sort so the bar chart reads left → older, right → newer.
  const chartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const a of appointments) {
      const date = new Date(a.startDateTime).toLocaleDateString();
      buckets[date] = (buckets[date] || 0) + 1;
    }
    return Object.entries(buckets)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const maxCount = Math.max(1, ...chartData.map((d) => d.count));

  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const cancelledCount = appointments.filter((a) => a.status === "cancelled").length;

  // Client-side only: keeps the Express API unchanged while still feeling snappy for demos.
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return appointments.filter((a) => {
      const textMatch =
        !q ||
        String(a.courseNum ?? "")
          .toLowerCase()
          .includes(q) ||
        String(a.studentId ?? "").includes(q) ||
        String(a.tutorName ?? "")
          .toLowerCase()
          .includes(q);
      const statusMatch = statusFilter === "all" || a.status === statusFilter;
      return textMatch && statusMatch;
    });
  }, [appointments, search, statusFilter]);

  const cancelSession = async (id: number) => {
    if (!window.confirm("Cancel this session?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}/cancel`), {
      method: "PUT",
    });

    if (res.ok) {
      setMessage("Session cancelled");
      load();
    }
  };

  const deleteSession = async (id: number) => {
    if (!window.confirm("Delete permanently?")) return;

    const res = await fetch(apiUrl(`/appointments/${id}`), {
      method: "DELETE",
    });

    if (res.ok) {
      setMessage("Session deleted");
      load();
    }
  };

  const isError = message.toLowerCase().includes("fail") || message.toLowerCase().includes("error");

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
          animate={{ opacity: [0.45, 0.72, 0.45], scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div style={{ ...styles.heroInner, ...(isCompact ? styles.heroInnerCompact : {}) }}>
          <div style={styles.heroLeft}>
            <div style={styles.heroEyebrowRow}>
              <span style={styles.heroIconBadge}>
                <Crown size={16} />
              </span>
              <span style={styles.heroEyebrow}>Administrator</span>
            </div>
            <h1 style={styles.heroH1}>
              {timeOfDayGreeting()},{" "}
              <span style={styles.heroName}>{user?.firstName || "Admin"}</span>
            </h1>
            <p style={styles.heroLead}>
              Global visibility into bookings, demand by day, and surgical controls for exceptions
              — without leaving this surface.
            </p>
            <div style={styles.heroStats}>
              <span style={styles.heroStat}>
                <Activity size={14} />
                {appointments.length} records
              </span>
              <span style={styles.heroStat}>
                <CheckCircle2 size={14} />
                {scheduledCount} scheduled
              </span>
            </div>
          </div>
          <div style={{ ...styles.heroRight, ...(isCompact ? styles.heroRightCompact : {}) }}>
            <div style={styles.towerCard}>
              <p style={styles.towerLabel}>
                <BarChart3 size={14} />
                Pulse
              </p>
              <p style={styles.towerValue}>{loading ? "—" : `${chartData.length} active days`}</p>
              <p style={styles.towerSub}>
                Bars below aggregate session starts per calendar day — newest traffic on the right.
              </p>
            </div>
          </div>
        </div>
        <div style={styles.heroRibbon}>
          <LayoutGrid size={14} />
          <span>Dashboard</span>
          <ChevronRight size={14} style={{ opacity: 0.5 }} />
          <span style={{ color: "#d8b4fe" }}>Control tower</span>
        </div>
      </motion.div>

      <motion.div
        variants={dashboardItemVariants}
        style={{ ...styles.kpiRow, ...(isCompact ? styles.kpiRowCompact : {}) }}
      >
        {[
          { label: "Total volume", value: appointments.length, hint: "All appointments", k: "t" },
          { label: "Scheduled", value: scheduledCount, hint: "Active commitments", k: "s" },
          { label: "Cancelled", value: cancelledCount, hint: "Released / stopped", k: "c" },
        ].map((row) => (
          <motion.div
            key={row.k}
            whileHover={{ y: -3, scale: 1.01 }}
            style={styles.kpiCard}
          >
            <p style={styles.kpiLabel}>{row.label}</p>
            <p style={styles.kpiValue}>{loading ? "—" : row.value}</p>
            <p style={styles.kpiHint}>{row.hint}</p>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
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

      <motion.div variants={dashboardItemVariants} style={styles.chartCard}>
        <div style={styles.cardHead}>
          <div>
            <h2 style={styles.cardTitle}>Sessions per day</h2>
            <p style={styles.cardSubtitle}>
              Chronological demand signal — hover columns to sense load before staffing pivots.
            </p>
          </div>
          <span style={styles.cardChip}>
            <Sparkles size={13} />
            Forecast
          </span>
        </div>
        {loading ? (
          <div style={styles.chartSkeleton}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                style={styles.chartSkCol}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <p style={styles.chartEmpty}>No session data yet — chart will populate after first bookings.</p>
        ) : (
          <div style={styles.barChart}>
            {chartData.map((row) => (
              <motion.div key={row.date} style={styles.barColumn} whileHover={{ y: -3 }}>
                <div style={styles.barTrack}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(row.count / maxCount) * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.05 }}
                    style={styles.barFill}
                    title={`${row.date}: ${row.count}`}
                  />
                </div>
                <span style={styles.barLabel}>{row.date}</span>
                <span style={styles.barCount}>{row.count}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={dashboardItemVariants} style={styles.courseTotalsCard}>
        <div style={styles.cardHead}>
          <div>
            <h2 style={styles.cardTitle}>Appointments by course</h2>
            <p style={styles.cardSubtitle}>Live aggregate from the `/reports/appointments-by-course` endpoint.</p>
          </div>
          <span style={styles.cardChipMuted}>{courseTotals.length} courses</span>
        </div>
        {loading ? (
          <div style={styles.skeletonStack}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={styles.skeletonLine}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : courseTotals.length === 0 ? (
          <p style={styles.chartEmpty}>No aggregated rows yet. Create appointments to populate this view.</p>
        ) : (
          <div style={styles.courseTotalsList}>
            {courseTotals.map((row) => (
              <div key={row.courseNum} style={styles.courseTotalRow}>
                <span style={styles.courseTotalCourse}>{row.courseNum}</span>
                <span style={styles.courseTotalCount}>{row.totalAppointments}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        variants={dashboardItemVariants}
        style={{ ...styles.filterBar, ...(isCompact ? styles.filterBarCompact : {}) }}
      >
        <div style={{ ...styles.searchWrap, ...(isCompact ? styles.searchWrapFull : {}) }}>
          <Search size={16} style={{ opacity: 0.55 }} />
          <input
            style={styles.searchInput}
            placeholder="Search course, student ID, tutor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.statusRow}>
          <span style={styles.filterIconLabel}>
            <Filter size={14} />
            Status
          </span>
          {(["all", "scheduled", "cancelled"] as const).map((s) => (
            <button
              key={s}
              type="button"
              style={{
                ...styles.statusChip,
                ...(statusFilter === s ? styles.statusChipOn : {}),
              }}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s === "scheduled" ? "Scheduled" : "Cancelled"}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={dashboardItemVariants}
        layout
        whileHover={{ y: -2 }}
        style={{ ...styles.ledgerCard, ...(isCompact ? styles.ledgerCardCompact : {}) }}
      >
        <div style={styles.cardHead}>
          <div>
            <h2 style={styles.cardTitle}>Session ledger</h2>
            <p style={styles.cardSubtitle}>
              Cancel to preserve history, delete to purge — both actions confirm before execution.
            </p>
          </div>
          <span style={styles.cardChipMuted}>
            {filtered.length} / {appointments.length}
          </span>
        </div>

        {!loading && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <CalendarClock size={24} />
            </div>
            <div>
              <p style={styles.emptyTitle}>No rows match</p>
              <p style={styles.emptyText}>
                Loosen search keywords or set status to &quot;All&quot; to see the full ledger again.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div style={styles.skeletonStack}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                style={styles.skeletonLine}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}

        {!loading &&
          filtered.map((a) => (
            <motion.div
              key={a.appointmentId}
              layout
              whileHover={{ scale: 1.003 }}
              style={{ ...styles.session, ...(isCompact ? styles.sessionCompact : {}) }}
            >
              <div style={styles.sessionMain}>
                <div style={styles.sessionTop}>
                  <span style={styles.courseBadge}>{a.courseNum}</span>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...(a.status === "cancelled" ? styles.statusCancelled : styles.statusScheduled),
                    }}
                  >
                    {a.status}
                  </span>
                </div>
                <p style={styles.sessionMeta}>
                  <UserRound size={13} />
                  {a.studentId}
                  <span style={styles.dot}>·</span>
                  <GraduationCap size={13} />
                  {a.tutorName}
                </p>
              </div>

              <div style={{ ...styles.sessionActions, ...(isCompact ? styles.sessionActionsCompact : {}) }}>
                <p style={styles.time}>
                  {new Date(a.startDateTime).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <div style={{ ...styles.actionRow, ...(isCompact ? styles.actionRowCompact : {}) }}>
                  <motion.button
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    style={styles.actionBtn}
                    onClick={() => cancelSession(a.appointmentId)}
                  >
                    <XCircle size={14} />
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => deleteSession(a.appointmentId)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>
    </motion.div>
  );
}

/* Inline styles: chart, filters, and ledger cards are co-located for one-file grading clarity. */
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
      "radial-gradient(ellipse 68% 52% at 18% 16%, rgba(167,139,250,0.16), transparent 55%), radial-gradient(ellipse 45% 38% at 88% 8%, rgba(192,132,252,0.12), transparent 50%)",
    zIndex: 0,
  },
  meshB: {
    pointerEvents: "none",
    position: "absolute",
    inset: "auto -20% -6% -20%",
    height: "220px",
    background:
      "radial-gradient(ellipse 55% 45% at 50% 100%, rgba(88,28,135,0.12), transparent 55%)",
    zIndex: 0,
  },

  heroOuter: {
    position: "relative",
    zIndex: 1,
    marginBottom: "20px",
    borderRadius: "22px",
    padding: "2px",
    background:
      "linear-gradient(135deg, rgba(192,132,252,0.55) 0%, rgba(124,58,237,0.4) 42%, rgba(91,33,182,0.35) 100%)",
    boxShadow: "0 24px 60px rgba(2, 6, 23, 0.55), 0 0 0 1px rgba(148,163,184,0.1)",
  },
  heroOuterCompact: {},
  heroGlow: {
    position: "absolute",
    inset: "-28%",
    background: "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.22), transparent 42%)",
    zIndex: 0,
  },
  heroInner: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    background:
      "linear-gradient(165deg, rgba(15,23,42,0.96) 0%, rgba(32,19,57,0.88) 48%, rgba(15,23,42,0.94) 100%)",
    backdropFilter: "blur(12px)",
    padding: "26px 26px 20px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.9fr",
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
    background: "linear-gradient(145deg, rgba(167,139,250,0.25), rgba(15,23,42,0.85))",
    border: "1px solid rgba(196,181,253,0.4)",
    color: "#e9d5ff",
  },
  heroEyebrow: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#d8b4fe",
  },
  heroH1: {
    margin: 0,
    fontSize: "clamp(26px, 3.2vw, 34px)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#faf5ff",
  },
  heroName: {
    background: "linear-gradient(90deg, #e9d5ff, #c4b5fd)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  heroLead: {
    margin: "12px 0 0",
    maxWidth: "540px",
    fontSize: "15px",
    lineHeight: 1.55,
    color: "#94a3b8",
  },
  heroStats: { marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "10px" },
  heroStat: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#c4b5fd",
    padding: "6px 11px",
    borderRadius: "999px",
    border: "1px solid rgba(196,181,253,0.25)",
    background: "rgba(88,28,135,0.2)",
  },
  heroRight: { minWidth: 0 },
  heroRightCompact: { gridColumn: "1 / -1" },
  towerCard: {
    height: "100%",
    minHeight: "150px",
    borderRadius: "16px",
    padding: "16px 18px",
    border: "1px solid rgba(196,181,253,0.28)",
    background:
      "linear-gradient(145deg, rgba(88,28,135,0.45) 0%, rgba(15,23,42,0.82) 100%), rgba(15,23,42,0.35)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  towerLabel: {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#d8b4fe",
  },
  towerValue: { margin: "12px 0 6px", fontSize: "22px", fontWeight: 800, color: "#f5f3ff" },
  towerSub: { margin: 0, fontSize: "12px", lineHeight: 1.5, color: "#94a3b8" },
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
    border: "1px solid rgba(196,181,253,0.2)",
    background: "linear-gradient(180deg, rgba(56,33,94,0.55) 0%, rgba(24,15,43,0.82) 100%)",
    boxShadow: "0 14px 36px rgba(2,6,23,0.38), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  kpiLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#a78bfa",
  },
  kpiValue: {
    margin: "10px 0 4px",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#faf5ff",
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

  chartCard: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    border: "1px solid rgba(196,181,253,0.16)",
    background: "linear-gradient(180deg, rgba(30,27,55,0.75) 0%, rgba(15,23,42,0.9) 100%)",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 20px 48px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  courseTotalsCard: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    border: "1px solid rgba(196,181,253,0.16)",
    background: "linear-gradient(180deg, rgba(30,27,55,0.75) 0%, rgba(15,23,42,0.9) 100%)",
    padding: "22px",
    marginBottom: "18px",
    boxShadow: "0 20px 48px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
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
    color: "#faf5ff",
  },
  cardSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
    maxWidth: "520px",
  },
  cardChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    border: "1px solid rgba(196,181,253,0.38)",
    color: "#e9d5ff",
    background: "rgba(88,28,135,0.35)",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "6px 12px",
  },
  cardChipMuted: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    border: "1px solid rgba(148,163,184,0.22)",
    color: "#94a3b8",
    background: "rgba(15,23,42,0.55)",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    padding: "6px 12px",
  },
  chartEmpty: { color: "#94a3b8", margin: "28px 0", textAlign: "center", fontSize: "14px" },
  chartSkeleton: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    minHeight: "200px",
    paddingTop: "12px",
  },
  chartSkCol: {
    flex: "1 0 40px",
    height: "140px",
    borderRadius: "10px",
    background: "linear-gradient(180deg, rgba(88,28,135,0.35), rgba(15,23,42,0.5))",
    border: "1px solid rgba(51,65,85,0.4)",
  },

  barChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    minHeight: "220px",
    paddingTop: "8px",
    overflowX: "auto",
  },
  barColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: "1 0 56px",
    minWidth: "56px",
  },
  barTrack: {
    width: "100%",
    height: "160px",
    background: "rgba(2,6,23,0.75)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
    border: "1px solid rgba(71,85,105,0.55)",
  },
  barFill: {
    width: "100%",
    background: "linear-gradient(180deg, #c4b5fd 0%, #7c3aed 48%, #5b21b6 100%)",
    borderRadius: "6px 6px 0 0",
    minHeight: "4px",
    boxShadow: "0 0 20px rgba(124,58,237,0.35)",
  },
  barLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    marginTop: "8px",
    textAlign: "center",
    wordBreak: "break-word",
    maxWidth: "76px",
  },
  barCount: {
    fontSize: "12px",
    color: "#e9d5ff",
    fontWeight: 700,
    marginTop: "4px",
  },
  courseTotalsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  courseTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(71,85,105,0.45)",
    borderRadius: "10px",
    padding: "10px 12px",
    background: "rgba(2,6,23,0.4)",
  },
  courseTotalCourse: {
    color: "#e9d5ff",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  courseTotalCount: {
    color: "#c4b5fd",
    fontWeight: 800,
  },

  filterBar: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },
  filterBarCompact: { flexDirection: "column", alignItems: "stretch" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1 1 280px",
    borderRadius: "14px",
    border: "1px solid rgba(71,85,105,0.55)",
    background: "rgba(2,6,23,0.55)",
    padding: "0 14px",
    color: "#94a3b8",
  },
  searchWrapFull: { flex: "1 1 auto", minWidth: 0 },
  searchInput: {
    flex: 1,
    minWidth: 0,
    padding: "12px 0",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f8fafc",
    fontSize: "14px",
  },
  statusRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
  },
  filterIconLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    marginRight: "4px",
  },
  statusChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(71,85,105,0.55)",
    background: "rgba(15,23,42,0.6)",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusChipOn: {
    borderColor: "rgba(196,181,253,0.55)",
    color: "#faf5ff",
    background: "linear-gradient(180deg, rgba(88,28,135,0.55), rgba(15,23,42,0.85))",
    boxShadow: "0 0 20px rgba(124,58,237,0.15)",
  },

  ledgerCard: {
    position: "relative",
    zIndex: 1,
    borderRadius: "20px",
    border: "1px solid rgba(196,181,253,0.14)",
    background: "linear-gradient(180deg, rgba(30,27,55,0.55) 0%, rgba(15,23,42,0.92) 100%)",
    padding: "22px",
    boxShadow: "0 20px 50px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 80px rgba(91,33,182,0.08)",
  },
  ledgerCardCompact: { padding: "16px" },

  session: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 18px",
    background: "rgba(2,6,23,0.42)",
    border: "1px solid rgba(51,65,85,0.45)",
    marginTop: "10px",
    borderRadius: "14px",
    alignItems: "flex-start",
  },
  sessionCompact: { flexDirection: "column" },
  sessionMain: { minWidth: 0, flex: 1 },
  sessionTop: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  courseBadge: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "4px 9px",
    borderRadius: "8px",
    background: "rgba(124,58,237,0.2)",
    border: "1px solid rgba(196,181,253,0.35)",
    color: "#e9d5ff",
  },
  sessionMeta: {
    margin: 0,
    color: "#a5b4fc",
    display: "inline-flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    fontSize: "13px",
  },
  dot: { color: "#7c3aed", fontWeight: 700 },
  sessionActions: {
    textAlign: "right",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },
  sessionActionsCompact: { alignItems: "flex-start", textAlign: "left" },
  time: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 600,
  },
  actionRow: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" },
  actionRowCompact: { justifyContent: "flex-start" },
  actionBtn: {
    background: "linear-gradient(180deg, rgba(245,158,11,0.95), rgba(217,119,6,0.98))",
    border: "1px solid rgba(253,186,116,0.45)",
    color: "#fff",
    borderRadius: "10px",
    padding: "8px 12px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  deleteBtn: {
    background: "linear-gradient(180deg, rgba(239,68,68,0.95), rgba(185,28,28,0.98))",
    border: "1px solid rgba(248,113,113,0.45)",
    color: "#fff",
    borderRadius: "10px",
    padding: "8px 12px",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  statusPill: {
    display: "inline-flex",
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "capitalize",
    border: "1px solid transparent",
  },
  statusScheduled: {
    color: "#a7f3d0",
    background: "rgba(6,78,59,0.4)",
    borderColor: "rgba(52,211,153,0.35)",
  },
  statusCancelled: {
    color: "#fca5a5",
    background: "rgba(127,29,29,0.35)",
    borderColor: "rgba(248,113,113,0.4)",
  },

  emptyState: {
    border: "1px dashed rgba(196,181,253,0.3)",
    borderRadius: "16px",
    padding: "22px",
    background: "rgba(88,28,135,0.12)",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "8px",
  },
  emptyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(167,139,250,0.25), rgba(15,23,42,0.85))",
    border: "1px solid rgba(196,181,253,0.35)",
    color: "#e9d5ff",
    flexShrink: 0,
  },
  emptyTitle: { margin: "0 0 6px", color: "#faf5ff", fontWeight: 800, fontSize: "16px" },
  emptyText: { margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: 1.55 },

  skeletonStack: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px 0 8px" },
  skeletonLine: {
    height: "56px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(56,33,94,0.55), rgba(51,65,85,0.35))",
  },
};
