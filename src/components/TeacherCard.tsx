import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, CalendarCheck } from "lucide-react";
import type { Teacher, Review, AttendanceRecord } from "../lib/types";
import { Stars } from "./Stars";
import { TeacherAvatar } from "./TeacherAvatar";
import { avgRating, presentDayCount } from "../lib/api";

export function TeacherCard({
  teacher,
  reviews = [],
  attendance = [],
  index = 0,
}: {
  teacher: Teacher;
  reviews?: Review[];
  attendance?: AttendanceRecord[];
  index?: number;
}) {
  const teacherReviews = reviews.filter((r) => r.teacherId === teacher.id);
  const rating = avgRating(teacherReviews);
  const presentDays = presentDayCount(
    attendance.filter((a) => a.teacherId === teacher.id),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="h-full"
    >
      <Link
        to={`/teacher/${teacher.id}`}
        className="group flex h-full flex-col rounded-2xl border border-cream-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-sage-700/5"
      >
        {/* Avatar + rating row */}
        <div className="flex items-center justify-between gap-3">
          <TeacherAvatar teacher={teacher} size="lg" className="shrink-0" />
          {rating > 0 ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-baseline gap-1">
                <span className="font-num text-2xl font-semibold text-clay-500">{rating.toFixed(1)}</span>
                <span className="text-xs text-ink-700/45">/5</span>
              </div>
              <Stars value={rating} size={13} />
            </div>
          ) : (
            <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-ink-700/45">
              No ratings yet
            </span>
          )}
        </div>

        {/* Name + subject */}
        <h3 className="mt-4 font-serif text-xl font-600 leading-tight text-ink-900">
          {teacher.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-sage-600">
          <BookOpen size={14} />
          {teacher.subject}
        </div>

        {/* Bio */}
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-700/75">
          {teacher.bio}
        </p>

        {/* Stats footer */}
        <div className="mt-4 flex items-center gap-4 border-t border-cream-100 pt-3 text-xs font-medium text-sage-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} />
            {teacher.experienceYears} yrs
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck size={13} />
            {presentDays} days present
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
