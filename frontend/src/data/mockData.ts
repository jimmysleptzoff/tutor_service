import type { Metric, Slot, Tutor } from "../types/scheduling";

export const metrics: Metric[] = [
  { label: "Average booking completion", value: "98%" },
  { label: "Scheduling conflicts prevented", value: "100%" },
  { label: "Faster tutor coordination", value: "2.7x" },
  { label: "Role-aware flow coverage", value: "99.2%" },
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
