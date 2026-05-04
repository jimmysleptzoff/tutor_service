/**
 * Minimal iCalendar (RFC 5545) export — wired from **Student** dashboard “Add to calendar (.ics)”.
 * --------------------------------------------------------------------------------------------
 * Good enough for Apple / Google / Outlook import demos. We assume **60-minute** events when the
 * list payload omits `lengthMinutes` (matches the backend INSERT default in `server.js`).
 */

function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function buildStudentSessionsIcs(
  sessions: Array<{
    appointmentId: number;
    startDateTime: string;
    courseNum: string;
    tutorName: string;
    status?: string;
    location?: string;
    mode?: string;
  }>,
  calName: string
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TutorService//Student//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
  ];

  const now = new Date();
  for (const a of sessions) {
    if (a.status === "cancelled") continue;
    const start = new Date(a.startDateTime);
    if (Number.isNaN(start.getTime())) continue;
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const loc = [a.mode, a.location].filter(Boolean).join(" · ");
    const desc = [`Course ${a.courseNum}`, `Tutor ${a.tutorName}`, loc && `Where ${loc}`]
      .filter(Boolean)
      .join("\\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:tutor-appt-${a.appointmentId}@tutor-service.local`);
    lines.push(`DTSTAMP:${toIcsUtc(now)}`);
    lines.push(`DTSTART:${toIcsUtc(start)}`);
    lines.push(`DTEND:${toIcsUtc(end)}`);
    lines.push(`SUMMARY:${escapeIcsText(`${a.courseNum} · ${a.tutorName}`)}`);
    if (desc) lines.push(`DESCRIPTION:${escapeIcsText(desc)}`);
    if (a.location) lines.push(`LOCATION:${escapeIcsText(a.location)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Trigger a file download in the browser (no server round-trip). */
export function downloadTextFile(contents: string, filename: string, mime: string): void {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
