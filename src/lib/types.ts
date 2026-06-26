export type Role = "student" | "admin" | null;

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  photo?: string; // base64 data URL; empty/undefined => placeholder avatar
  bio: string;
  experienceYears: number;
  email: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  date: string; // ISO date (yyyy-mm-dd)
  status: "present" | "absent" | "late" | "leave";
  note?: string;
}

export interface Review {
  id: string;
  teacherId: string;
  studentName: string;
  studentEmail: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date
  anonymous: boolean;
}

export interface User {
  name: string;
  email: string;
  role: Role;
}

export interface XpEntry {
  id: string;
  studentEmail: string;
  studentName: string;
  points: number;
  reason: string;
  date: string; // ISO date
}

export interface VisitEntry {
  id: string;
  studentEmail: string;
  date: string; // ISO date
}

/** KYC registration — a student signs up by uploading their SMC college ID card. */
export interface Registration {
  id: string;
  name: string;
  email: string;
  idCardPhoto: string; // base64 data URL
  status: "pending" | "approved" | "rejected";
  submittedAt: string; // ISO date
  reviewedAt?: string;
  rejectReason?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole: "student" | "admin";
  content: string;
  createdAt: string; // ISO timestamp
}
