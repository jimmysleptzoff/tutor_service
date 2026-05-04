/**
 * API base URL + session user normalization (group project — read before GitHub push)
 * -----------------------------------------------------------------------------------
 * **Production / hosted builds:** set `REACT_APP_API_URL` (e.g. `https://api.example.com`). The CRA
 * `proxy` field is ignored in production builds — you need a real public API URL there.
 *
 * **Local dev (recommended for class demos):** leave `REACT_APP_API_URL` unset. We intentionally
 * use **same-origin** relative paths (`/users/...`) plus `frontend/package.json` → `"proxy"` so
 * requests hit `http://127.0.0.1:5001`. That fixes the classic bug where someone opens the UI via
 * **LAN IP :3000** but the client was hard-coded to **localhost:5001** (wrong machine from the browser’s POV).
 *
 * **`normalizeSessionUser`:** coerces MySQL-ish payloads into a safe, predictable object before we
 * stash JSON in `localStorage` (numeric `studentId`, lowercase `role`, whitelisted keys only).
 */
export function getApiBase(): string {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") {
    return "";
  }
  return "";
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${normalized}` : normalized;
}

const ROLES = ["student", "tutor", "admin"] as const;

/**
 * Coerce `/users/:id` JSON into a predictable shape for React + localStorage.
 * MySQL drivers sometimes return numeric columns as strings; role text casing can also vary.
 */
export function normalizeSessionUser(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const sid = Number(o.studentId);
  if (!Number.isFinite(sid)) return null;
  const role = String(o.role ?? "")
    .trim()
    .toLowerCase();
  if (!ROLES.includes(role as (typeof ROLES)[number])) return null;
  // Only whitelisted fields hit localStorage — avoids leaking unexpected columns if the schema grows.
  return {
    studentId: sid,
    firstName: String(o.firstName ?? ""),
    lastName: String(o.lastName ?? ""),
    email: String(o.email ?? ""),
    role,
  };
}
