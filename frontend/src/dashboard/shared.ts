/**
 * Cross-role dashboard utilities (Student, Tutor, Admin) — added during the final UI pass
 * -------------------------------------------------------------------------------
 * Why this file exists (for anyone reading the repo on GitHub):
 * - **Framer Motion:** one `variants` object per concern so stagger timing doesn’t drift page-to-page.
 * - **Copy:** `formatRelativeSessionTime` + `timeOfDayGreeting` keep hero + headers consistent.
 * - **Maintainability:** if a teammate tweaks easing for the video demo, they change it once here.
 */

import type { Variants } from "framer-motion";

/** Staggered page entrance — parent wraps the whole dashboard view. */
export const dashboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04, duration: 0.35 },
  },
};

/**
 * Single section/card entrance. Custom cubic-bezier reads slightly more “premium” than default
 * ease-out on large type blocks.
 */
export const dashboardItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Localized greeting from the device clock (no timezone math — purely decorative). */
export function timeOfDayGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Compact relative phrase vs `now` (e.g. "In 2d", "45 min ago").
 * Intentionally not full i18n / Intl.RelativeTimeFormat to keep bundle and behavior predictable.
 */
export function formatRelativeSessionTime(d: Date, now: Date): string {
  const ms = d.getTime() - now.getTime();
  const abs = Math.abs(ms);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  if (mins < 1) return ms >= 0 ? "Starting now" : "Just now";
  if (mins < 60) return ms >= 0 ? `In ${mins} min` : `${mins} min ago`;
  if (hours < 24) return ms >= 0 ? `In ${hours}h` : `${hours}h ago`;
  if (days < 7) return ms >= 0 ? `In ${days}d` : `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
