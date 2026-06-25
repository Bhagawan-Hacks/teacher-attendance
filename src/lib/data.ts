import type { Teacher, AttendanceRecord } from "./types";

// Teachers start WITHOUT photos — admin uploads them.
export const seedTeachers: Teacher[] = [
  {
    id: "t1",
    name: "Deepak Poudel",
    subject: "OOP in Java",
    photo: "",
    bio: "Deepak Poudel teaches Object-Oriented Programming in Java with a hands-on, project-driven approach. His classes focus on clean design, real-world problem solving, and building strong programming fundamentals.",
    experienceYears: 10,
    email: "deepak.poudel@smc.edu",
  },
  {
    id: "t2",
    name: "Biseswor Prasad Bhatt",
    subject: "Math II",
    photo: "",
    bio: "Biseswor Prasad Bhatt guides students through advanced mathematics with patience and clarity. His Math II course builds on calculus and linear algebra, making complex concepts approachable for every student.",
    experienceYears: 14,
    email: "biseswor.bhatt@smc.edu",
  },
  {
    id: "t3",
    name: "Sujan Shrestha",
    subject: "Microprocessor",
    photo: "",
    bio: "Sujan Shrestha brings the inner workings of computers to life in his Microprocessor course. From architecture to assembly, he helps students understand how hardware and software truly connect.",
    experienceYears: 8,
    email: "sujan.shrestha@smc.edu",
  },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

export const seedAttendance: AttendanceRecord[] = [
  { id: "a1", teacherId: "t1", date: daysAgo(0), status: "present" },
  { id: "a2", teacherId: "t2", date: daysAgo(0), status: "present" },
  { id: "a3", teacherId: "t3", date: daysAgo(0), status: "late", note: "Arrived 15 min late." },

  { id: "a5", teacherId: "t1", date: daysAgo(1), status: "present" },
  { id: "a6", teacherId: "t2", date: daysAgo(1), status: "present" },
  { id: "a7", teacherId: "t3", date: daysAgo(1), status: "present" },

  { id: "a9", teacherId: "t1", date: daysAgo(2), status: "late", note: "Traffic delay." },
  { id: "a10", teacherId: "t2", date: daysAgo(2), status: "present" },
  { id: "a11", teacherId: "t3", date: daysAgo(2), status: "present" },

  { id: "a13", teacherId: "t1", date: daysAgo(3), status: "present" },
  { id: "a14", teacherId: "t2", date: daysAgo(3), status: "absent" },
  { id: "a15", teacherId: "t3", date: daysAgo(3), status: "present" },

  { id: "a17", teacherId: "t1", date: daysAgo(4), status: "present" },
  { id: "a18", teacherId: "t2", date: daysAgo(4), status: "present" },
  { id: "a19", teacherId: "t3", date: daysAgo(4), status: "late", note: "Lab setup ran over." },
];
