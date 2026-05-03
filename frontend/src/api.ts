/**
 * API base URL.
 * - Set REACT_APP_API_URL in production (e.g. https://api.example.com).
 * - In local dev we call Express on the same hostname as the UI (port from
 *   REACT_APP_API_PORT or 5000). Hardcoding localhost breaks when you open the
 *   app as 127.0.0.1 or a LAN IP — the browser would call the wrong machine.
 */
export function getApiBase(): string {
  const fromEnv = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") {
    const hostname =
      typeof window !== "undefined" && window.location.hostname
        ? window.location.hostname
        : "localhost";
    const port = process.env.REACT_APP_API_PORT || "5000";
    return `http://${hostname}:${port}`;
  }
  return "";
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${normalized}` : normalized;
}
