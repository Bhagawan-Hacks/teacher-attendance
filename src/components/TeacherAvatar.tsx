import { UserRound } from "lucide-react";
import type { Teacher } from "../lib/types";

export function TeacherAvatar({
  teacher,
  size = "md",
  className = "",
}: {
  teacher: Teacher;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: "h-10 w-10 text-base",
    md: "h-14 w-14 text-lg",
    lg: "h-28 w-28 text-3xl",
  }[size];

  if (teacher.photo) {
    return (
      <img
        src={teacher.photo}
        alt={teacher.name}
        className={`${dims} rounded-full object-cover object-top ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dims} flex items-center justify-center rounded-full bg-sage-100 text-sage-600 ${className}`}
    >
      <UserRound size={size === "lg" ? 40 : size === "sm" ? 18 : 24} />
    </div>
  );
}
