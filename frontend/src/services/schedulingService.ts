import { appointments, slots, tutors, waitlist } from "../data/mockData";
import type { Appointment, BookingInput, Slot, Tutor, WaitlistEntry } from "../types/scheduling";

export function getTutorsForCourse(courseNum: string): Tutor[] {
  if (!courseNum) return tutors;
  return tutors.filter((tutor) => tutor.courseNums.includes(courseNum));
}

export function getSlotsForTutor(tutorId: string): Slot[] {
  if (!tutorId) return slots;
  return slots.filter((slot) => slot.tutorId === tutorId);
}

export function formatBookingMessage({ courseNum, tutorId, slotId }: BookingInput): string {
  const tutor = tutors.find((item) => item.id === tutorId);
  const slot = slots.find((item) => item.id === slotId);

  if (!courseNum || !tutor || !slot) {
    return "Complete course, tutor, and time selection to confirm the session.";
  }

  if (!tutor.courseNums.includes(courseNum)) {
    return `${tutor.name} does not currently cover ${courseNum}. Choose a matching tutor to continue.`;
  }

  if (slot.tutorId !== tutor.id) {
    return "That time slot is no longer available for the selected tutor. Pick another open slot.";
  }

  return `Booked ${courseNum} with ${tutor.name} at ${slot.start}. Conflict risk: 0%.`;
}

export function getTutorUpcomingSessions(): Appointment[] {
  return appointments.filter((appointment) => appointment.status === "Scheduled");
}

export function getAdminWaitlist(): WaitlistEntry[] {
  return [...waitlist].sort((a, b) => b.priority - a.priority);
}
