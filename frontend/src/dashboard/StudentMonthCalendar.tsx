/**
 * Month grid for the student workspace. Uses local timezone (browser) for day buckets — good for
 * display; ICS export uses absolute UTC stamps separately.
 */
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Session = {
  appointmentId: number;
  startDateTime: string;
  courseNum: string;
  tutorName: string;
  status?: string;
  mode?: string;
  location?: string;
};

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** 6-row (42 cell) grid starting Sunday — matches typical US wall calendars. */
function buildMonthCells(visibleMonth: Date): (Date | null)[] {
  const first = startOfMonth(visibleMonth);
  const lead = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  return cells;
}

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const s: Record<string, React.CSSProperties> = {
  wrap: { width: "100%" },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    gap: "10px",
  },
  monthLabel: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: "#e2e8f0",
  },
  navBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid rgba(71,85,105,0.55)",
    background: "rgba(2,6,23,0.45)",
    color: "#94a3b8",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: "4px",
  },
  dow: {
    textAlign: "center",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    padding: "4px 0 8px",
  },
  cell: {
    aspectRatio: "1",
    minHeight: "36px",
    borderRadius: "10px",
    border: "1px solid transparent",
    background: "rgba(2,6,23,0.25)",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "default",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "6px",
    gap: "3px",
  },
  cellMuted: { opacity: 0.35 },
  cellToday: {
    borderColor: "rgba(56,189,248,0.45)",
    boxShadow: "0 0 0 1px rgba(56,189,248,0.15)",
  },
  cellSelected: {
    borderColor: "rgba(129,140,250,0.55)",
    background: "linear-gradient(145deg, rgba(56,189,248,0.12), rgba(15,23,42,0.5))",
  },
  cellHas: { color: "#e2e8f0" },
  dotRow: { display: "flex", gap: "3px", justifyContent: "center", flexWrap: "wrap", maxWidth: "100%" },
  dot: {
    width: "5px",
    height: "5px",
    borderRadius: "99px",
    background: "#38bdf8",
    boxShadow: "0 0 6px rgba(56,189,248,0.5)",
  },
  dotCancelled: { background: "#64748b", boxShadow: "none" },
  detail: {
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(51,65,85,0.55)",
    background: "rgba(2,6,23,0.35)",
  },
  detailTitle: {
    margin: "0 0 8px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  detailRow: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "6px",
    lineHeight: 1.4,
  },
};

type Props = {
  sessions: Session[];
};

export default function StudentMonthCalendar({ sessions }: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState<string | null>(() => ymd(new Date()));

  const bumpMonth = (delta: number) => {
    const n = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(n);
    const today = new Date();
    const sameRealMonth =
      today.getFullYear() === n.getFullYear() && today.getMonth() === n.getMonth();
    // Land on "today" when browsing back to the current month; otherwise default to the 1st.
    setSelectedKey(sameRealMonth ? ymd(today) : ymd(startOfMonth(n)));
  };

  const byDay = useMemo(() => {
    const m = new Map<string, Session[]>();
    for (const a of sessions) {
      const d = new Date(a.startDateTime);
      if (Number.isNaN(d.getTime())) continue;
      const k = ymd(d);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(a);
    }
    m.forEach((arr) => {
      arr.sort(
        (x: Session, y: Session) =>
          +new Date(x.startDateTime) - +new Date(y.startDateTime)
      );
    });
    return m;
  }, [sessions]);

  const cells = useMemo(() => buildMonthCells(cursor), [cursor]);
  const label = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const todayKey = ymd(new Date());

  const selectedSessions =
    selectedKey && byDay.has(selectedKey) ? byDay.get(selectedKey)! : [];

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <motion.button
          type="button"
          style={s.navBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Previous month"
          onClick={() => bumpMonth(-1)}
        >
          <ChevronLeft size={18} />
        </motion.button>
        <p style={s.monthLabel}>{label}</p>
        <motion.button
          type="button"
          style={s.navBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          aria-label="Next month"
          onClick={() => bumpMonth(1)}
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      <div style={s.grid}>
        {WEEK.map((d) => (
          <div key={d} style={s.dow}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) {
            return <div key={`e-${i}`} style={{ ...s.cell, ...s.cellMuted }} />;
          }
          const k = ymd(d);
          const list = byDay.get(k) || [];
          const inViewMonth = d.getMonth() === cursor.getMonth();
          const isToday = k === todayKey;
          const isSel = k === selectedKey;
          return (
            <motion.button
              key={k}
              type="button"
              initial={false}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedKey(k)}
              style={{
                ...s.cell,
                ...(!inViewMonth ? s.cellMuted : {}),
                ...(isToday ? s.cellToday : {}),
                ...(isSel ? s.cellSelected : {}),
                ...(list.length ? s.cellHas : {}),
                cursor: "pointer",
              }}
            >
              <span>{d.getDate()}</span>
              {list.length > 0 && (
                <span style={s.dotRow}>
                  {list.slice(0, 4).map((a) => (
                    <span
                      key={a.appointmentId}
                      style={{
                        ...s.dot,
                        ...(a.status === "cancelled" ? s.dotCancelled : {}),
                      }}
                    />
                  ))}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={s.detail}>
        <p style={s.detailTitle}>
          {selectedKey
            ? new Date(selectedKey + "T12:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Pick a day"}
        </p>
        {selectedSessions.length === 0 ? (
          <p style={{ ...s.detailRow, marginBottom: 0, color: "#64748b" }}>No sessions on this day.</p>
        ) : (
          selectedSessions.map((a) => (
            <p key={a.appointmentId} style={s.detailRow}>
              <strong style={{ color: "#7dd3fc" }}>{a.courseNum}</strong> · {a.tutorName} ·{" "}
              {new Date(a.startDateTime).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              <span style={{ color: "#64748b", textTransform: "capitalize" }}>({a.status})</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}
