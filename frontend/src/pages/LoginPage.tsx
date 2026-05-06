/**
 * Auth entry — numeric student ID + role (login) or full profile fields (sign-up).
 * ----------------------------------------------------------------------------
 * Reliability work before GitHub / recorded demos:
 * - Responses run through `normalizeSessionUser` (`api.ts`) so `localStorage` never stores odd MySQL shapes.
 * - `<form>` + submit handler so **Enter** works like users expect.
 * - Network errors mention **`npm run api`** + CRA **`proxy`** so graders can unblock themselves quickly.
 */
import { useState, type CSSProperties } from "react";
import { apiUrl, getApiBase, normalizeSessionUser } from "../api";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

function networkErrorMessage(): string {
  const base = getApiBase();
  if (!base) {
    return (
      "Could not reach the API. From the project root run `npm run api` (or `cd backend && node server.js`). " +
      "In development the UI uses the CRA `proxy` in frontend/package.json (default port 5001). " +
      "If the API runs elsewhere, set REACT_APP_API_URL in frontend/.env."
    );
  }
  return (
    `Can't reach the API at ${base}. ` +
    "Confirm the server is running and REACT_APP_API_URL is correct if you use it."
  );
}

function apiErrorMessage(body: unknown, fallback: string): string {
  if (body == null) return fallback;
  if (typeof body === "string" && body.trim()) {
    const msg = body.trim();
    if (msg.toLowerCase().includes("access denied for user")) {
      return "Database credentials are wrong in backend/.env. Update DB_USER / DB_PASSWORD, restart API, then try again.";
    }
    return msg;
  }
  if (typeof body !== "object") return fallback;
  const o = body as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) {
    const msg = o.message.trim();
    if (msg.toLowerCase().includes("access denied for user")) {
      return "Database credentials are wrong in backend/.env. Update DB_USER / DB_PASSWORD, restart API, then try again.";
    }
    return msg;
  }
  if (typeof o.sqlMessage === "string" && o.sqlMessage.trim()) return o.sqlMessage.trim();
  if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
  return fallback;
}

/** Read body as text then JSON so we never lose server messages on error responses. */
async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.trim().slice(0, 400) };
  }
}

export default function LoginPage({ setUser }: any) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState("student");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (mode === "login") void handleLogin();
    else void handleSignup();
  };

  const handleLogin = async () => {
    setError("");
    const id = studentId.trim();
    if (!id) {
      setError("Enter your student ID.");
      return;
    }
    if (!/^\d+$/.test(id)) {
      setError("Student ID should be numbers only.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/users/${encodeURIComponent(id)}`));

      if (!res.ok) {
        const errBody = await readJsonBody(res);
        if (res.status === 404) {
          setError("No account found for that ID. Try Sign up or check the role.");
        } else {
          setError(apiErrorMessage(errBody, `Login failed (HTTP ${res.status}).`));
        }
        return;
      }

      const data = (await readJsonBody(res)) as Record<string, unknown> | null;
      const normalized = normalizeSessionUser(data);
      if (!normalized) {
        setError("The server returned an unexpected profile. Ask your TA or check the database row.");
        return;
      }

      // Compare case-insensitively — DB text casing can drift from the select value.
      if (String(normalized.role).toLowerCase() !== role.trim().toLowerCase()) {
        setError("That ID exists, but the role doesn't match. Pick the correct role above.");
        return;
      }

      setUser(normalized);
    } catch {
      setError(networkErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    const id = studentId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setError("Enter a numeric student ID.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Fill in first name, last name, and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          role,
        }),
      });

      const data = await readJsonBody(res);

      if (!res.ok) {
        setError(apiErrorMessage(data, `Sign up failed (HTTP ${res.status}).`));
        return;
      }

      const normalized = normalizeSessionUser(data);
      if (!normalized) {
        setError("Unexpected response after sign up. Try logging in.");
        return;
      }

      setUser(normalized);
    } catch {
      setError(networkErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div style={styles.wrap} className="login-page">
      <div style={styles.mesh} aria-hidden />
      <div style={styles.meshLower} aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={styles.cardFrame}
      >
        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <GraduationCap size={22} />
          </div>
          <p style={styles.kicker}>Tutor Scheduler</p>
          <h1 style={styles.title}>{mode === "login" ? "Sign in" : "Create account"}</h1>
          <p style={styles.subtitle}>
            {mode === "login"
              ? "Use your numeric student ID and the role that matches your account."
              : "Create your profile once, then sign in anytime with the same ID."}
          </p>
          <div style={styles.badges}>
            <span style={styles.badge}>
              <ShieldCheck size={14} /> Secure
            </span>
            <span style={styles.badge}>
              <Sparkles size={14} /> Fast
            </span>
            <span style={styles.badge}>
              <UserRound size={14} /> Role-based
            </span>
          </div>

          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div style={styles.segment} role="tablist" aria-label="Auth mode">
              <button
                type="button"
                style={{
                  ...styles.segmentBtn,
                  ...(mode === "login" ? styles.segmentBtnActive : {}),
                }}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Login
              </button>
              <button
                type="button"
                style={{
                  ...styles.segmentBtn,
                  ...(mode === "signup" ? styles.segmentBtnActive : {}),
                }}
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </div>

            <label style={styles.label}>
              Role
              <select
                style={styles.input}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label style={styles.label}>
              Student ID
              <input
                style={styles.input}
                placeholder="e.g. 700123456"
                inputMode="numeric"
                autoComplete="username"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </label>

            {mode === "signup" && (
              <>
                <label style={styles.label}>
                  First name
                  <input
                    style={styles.input}
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </label>
                <label style={styles.label}>
                  Last name
                  <input
                    style={styles.input}
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </label>
                <label style={styles.label}>
                  Email
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="you@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
              </>
            )}

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key={error}
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={styles.error}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileHover={loading ? {} : { y: -1, scale: 1.01 }}
              whileTap={loading ? {} : { scale: 0.99 }}
              style={{
                ...styles.primary,
                ...(loading ? styles.primaryDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="login-spin" style={{ animation: "spin 0.9s linear infinite" }} />
                  Please wait…
                </>
              ) : (
                "Continue"
              )}
            </motion.button>
          </form>

          {isDev && (
            <p style={styles.devHint}>
              Dev: API base <code style={styles.code}>{getApiBase() || "(proxied → see package.json)"}</code>
              · optional <code style={styles.code}>?devBypass=student</code>
            </p>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "72vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 16px 36px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  },
  mesh: {
    pointerEvents: "none",
    position: "absolute",
    inset: "-24% -35% auto -35%",
    height: "58%",
    background:
      "radial-gradient(ellipse 58% 48% at 50% 0%, rgba(56,189,248,0.14), transparent 62%), radial-gradient(ellipse 42% 36% at 85% 18%, rgba(99,102,241,0.12), transparent 55%)",
    zIndex: 0,
  },
  meshLower: {
    pointerEvents: "none",
    position: "absolute",
    inset: "auto -40% -30% -40%",
    height: "45%",
    background: "radial-gradient(ellipse 50% 45% at 30% 100%, rgba(14,165,233,0.08), transparent 55%)",
    zIndex: 0,
  },
  cardFrame: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "440px",
    padding: "2px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.5), rgba(99,102,241,0.38), rgba(14,165,233,0.28))",
    boxShadow:
      "0 32px 72px rgba(2,6,23,0.58), 0 0 0 1px rgba(148,163,184,0.12), 0 0 80px rgba(37,99,235,0.12)",
  },
  card: {
    width: "100%",
    background: "linear-gradient(168deg, rgba(30,41,59,0.99) 0%, rgba(15,23,42,0.995) 52%, rgba(8,15,35,0.98) 100%)",
    borderRadius: "20px",
    padding: "30px 28px 26px",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
  },
  cardIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(56,189,248,0.22), rgba(15,23,42,0.92))",
    border: "1px solid rgba(56,189,248,0.4)",
    color: "#7dd3fc",
    boxShadow: "0 12px 28px rgba(2,6,23,0.35)",
  },
  kicker: {
    margin: "0 0 8px",
    fontSize: "11px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#7dd3fc",
    fontWeight: 700,
  },
  title: {
    margin: "0 0 10px",
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "#f8fafc",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "0 0 20px",
    fontSize: "0.95rem",
    lineHeight: 1.55,
    color: "#94a3b8",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    margin: "0 0 18px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#cbd5e1",
    background: "rgba(2,6,23,0.45)",
    border: "1px solid rgba(71,85,105,0.45)",
    borderRadius: "999px",
    padding: "5px 10px",
  },
  form: {
    margin: 0,
    padding: 0,
  },
  segment: {
    display: "flex",
    padding: "5px",
    gap: "5px",
    background: "rgba(2,6,23,0.65)",
    borderRadius: "12px",
    marginBottom: "22px",
    border: "1px solid rgba(51,65,85,0.55)",
  },
  segmentBtn: {
    flex: 1,
    padding: "11px 12px",
    border: "none",
    borderRadius: "9px",
    background: "transparent",
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  segmentBtnActive: {
    background: "linear-gradient(180deg, rgba(30,58,138,0.55), rgba(15,23,42,0.95))",
    color: "#f1f5f9",
    boxShadow: "0 0 20px rgba(56,189,248,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
    border: "1px solid rgba(56,189,248,0.35)",
  },
  label: {
    display: "block",
    marginBottom: "15px",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#cbd5e1",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  input: {
    display: "block",
    width: "100%",
    marginTop: "8px",
    padding: "13px 14px",
    boxSizing: "border-box",
    background: "rgba(2,6,23,0.72)",
    color: "#f8fafc",
    border: "1px solid rgba(71,85,105,0.55)",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
  },
  error: {
    margin: "0 0 16px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, rgba(127,29,29,0.35), rgba(15,23,42,0.55))",
    border: "1px solid rgba(248,113,113,0.4)",
    color: "#fecaca",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  primary: {
    width: "100%",
    marginTop: "4px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "13px",
    background: "linear-gradient(92deg, #0ea5e9 0%, #2563eb 48%, #4f46e5 100%)",
    color: "#fff",
    fontWeight: 800,
    fontSize: "0.98rem",
    letterSpacing: "0.03em",
    cursor: "pointer",
    boxShadow: "0 16px 36px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.14)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  primaryDisabled: {
    opacity: 0.72,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  devHint: {
    margin: "18px 0 0",
    fontSize: "11px",
    lineHeight: 1.5,
    color: "#64748b",
    textAlign: "center",
  },
  code: {
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "6px",
    background: "rgba(2,6,23,0.55)",
    border: "1px solid rgba(51,65,85,0.5)",
    color: "#94a3b8",
  },
};
