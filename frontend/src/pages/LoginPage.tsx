import { useState, type CSSProperties } from "react";
import { apiUrl, getApiBase } from "../api";

function networkErrorMessage(): string {
  const base = getApiBase();
  const where = base
    ? `Can't reach the API at ${base}.`
    : "Can't reach the API (same origin as this page).";
  return `${where} From the project root run \`npm run api\` or \`cd backend && node server.js\`, confirm it prints a listening message, then refresh. If you use a custom API URL, set REACT_APP_API_URL.`;
}

function apiErrorMessage(body: unknown, fallback: string): string {
  if (body == null) return fallback;
  if (typeof body === "string" && body.trim()) return body.trim();
  if (typeof body !== "object") return fallback;
  const o = body as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
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
          setError("No account found for that ID. Try Sign Up or check the role.");
        } else {
          setError(
            apiErrorMessage(errBody, `Login failed (HTTP ${res.status}).`)
          );
        }
        return;
      }

      const data = (await readJsonBody(res)) as Record<string, unknown> | null;
      if (!data || typeof data !== "object") {
        setError("Unexpected response from server. Try again.");
        return;
      }

      if (data.role !== role) {
        setError("That ID exists, but the role doesn't match. Pick the correct role above.");
        return;
      }

      setUser(data);
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
        setError(
          apiErrorMessage(data, `Sign up failed (HTTP ${res.status}).`)
        );
        return;
      }

      if (!data || typeof data !== "object") {
        setError("Unexpected response after sign up. Try logging in.");
        return;
      }

      setUser(data);
    } catch {
      setError(networkErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap} className="login-page">
      <div style={styles.card}>
        <p style={styles.kicker}>Tutor Scheduler</p>
        <h1 style={styles.title}>
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "Use your student ID and pick your role."
            : "Register once, then you can sign in anytime."}
        </p>

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
              />
            </label>
            <label style={styles.label}>
              Last name
              <input
                style={styles.input}
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
              />
            </label>
          </>
        )}

        {error ? <p style={styles.error}>{error}</p> : null}

        <button
          type="button"
          style={{
            ...styles.primary,
            ...(loading ? styles.primaryDisabled : {}),
          }}
          disabled={loading}
          onClick={mode === "login" ? handleLogin : handleSignup}
        >
          {loading ? "Please wait…" : "Continue"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "linear-gradient(165deg, #1e293b 0%, #0f172a 100%)",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "28px 26px 26px",
    boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#94a3b8",
    fontWeight: 600,
  },
  title: {
    margin: "0 0 8px",
    fontSize: "1.45rem",
    fontWeight: 700,
    color: "#f8fafc",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "0 0 22px",
    fontSize: "0.9rem",
    lineHeight: 1.45,
    color: "#94a3b8",
  },
  segment: {
    display: "flex",
    padding: "4px",
    gap: "4px",
    background: "#020617",
    borderRadius: "10px",
    marginBottom: "20px",
    border: "1px solid #1e293b",
  },
  segmentBtn: {
    flex: 1,
    padding: "10px 12px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  segmentBtnActive: {
    background: "#1e293b",
    color: "#f1f5f9",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  label: {
    display: "block",
    marginBottom: "14px",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#cbd5e1",
    letterSpacing: "0.02em",
  },
  input: {
    display: "block",
    width: "100%",
    marginTop: "6px",
    padding: "11px 12px",
    boxSizing: "border-box",
    background: "#020617",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
  },
  error: {
    margin: "0 0 14px",
    padding: "10px 12px",
    borderRadius: "8px",
    background: "rgba(127,29,29,0.25)",
    border: "1px solid rgba(248,113,113,0.35)",
    color: "#fecaca",
    fontSize: "0.85rem",
    lineHeight: 1.45,
  },
  primary: {
    width: "100%",
    marginTop: "6px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
  },
  primaryDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
