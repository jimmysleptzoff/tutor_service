export type DemoRole = "student" | "tutor" | "admin";

export type Metric = {
  label: string;
  value: string;
};

export type Course = {
  courseNum: string;
  subject: string;
};

export type Tutor = {
  id: string;
  name: string;
  courseNums: string[];
  fitScore: number;
};

export type Slot = {
  id: string;
  tutorId: string;
  start: string;
  mode: string;
  location: string;
};

export type AppointmentStatus = "Scheduled" | "Waitlisted";

export type Appointment = {
  id: string;
  student: string;
  tutor: string;
  course: string;
  time: string;
  status: AppointmentStatus;
};

export type WaitlistEntry = {
  id: string;
  student: string;
  course: string;
  priority: number;
  risk: string;
};

export type BookingInput = {
  courseNum: string;
  tutorId: string;
  slotId: string;
};
