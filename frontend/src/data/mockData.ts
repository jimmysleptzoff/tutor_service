import type { Appointment, Course, Metric, Slot, Tutor, WaitlistEntry } from "../types/scheduling";

export const metrics: Metric[] = [
  { label: "Average booking completion", value: "98%" },
  { label: "Scheduling conflicts prevented", value: "100%" },
  { label: "Faster tutor coordination", value: "2.7x" },
  { label: "Role-aware flow coverage", value: "99.2%" },
];

export const courses: Course[] = [
  { courseNum: "CS110", subject: "Intro to Programming" },
  { courseNum: "MATH155", subject: "Calculus I" },
  { courseNum: "CHEM115", subject: "General Chemistry" },
  { courseNum: "STAT211", subject: "Statistics for Engineers" },
];

export const tutors: Tutor[] = [
  { id: "t1", name: "Alex Carter", courseNums: ["CS110", "STAT211"], fitScore: 94 },
  { id: "t2", name: "Maya Patel", courseNums: ["MATH155", "STAT211"], fitScore: 91 },
  { id: "t3", name: "Jordan Lee", courseNums: ["CHEM115", "CS110"], fitScore: 89 },
];

export const slots: Slot[] = [
  { id: "s1", tutorId: "t1", start: "Tue 3:00 PM", mode: "In Person", location: "Evansdale Library 214" },
  { id: "s2", tutorId: "t1", start: "Wed 10:00 AM", mode: "Online", location: "Zoom Link" },
  { id: "s3", tutorId: "t2", start: "Tue 5:00 PM", mode: "In Person", location: "Math Learning Center" },
  { id: "s4", tutorId: "t3", start: "Thu 2:30 PM", mode: "Online", location: "Teams Meeting" },
];

export const appointments: Appointment[] = [
  { id: "a1", student: "Sam Brooks", tutor: "Alex Carter", course: "CS110", time: "Today 3:00 PM", status: "Scheduled" },
  { id: "a2", student: "Lena Park", tutor: "Maya Patel", course: "MATH155", time: "Tomorrow 5:00 PM", status: "Scheduled" },
  { id: "a3", student: "Noah Kim", tutor: "Jordan Lee", course: "CHEM115", time: "Fri 2:30 PM", status: "Waitlisted" },
];

export const waitlist: WaitlistEntry[] = [
  { id: "w1", student: "Noah Kim", course: "CHEM115", priority: 9, risk: "High demand" },
  { id: "w2", student: "Ari Johnson", course: "CS110", priority: 7, risk: "Tutor unavailable" },
  { id: "w3", student: "Priya Shah", course: "MATH155", priority: 5, risk: "Time conflict" },
];
