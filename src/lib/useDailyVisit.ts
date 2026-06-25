import { useEffect } from "react";
import { useAuth } from "./auth";
import { recordDailyVisit } from "./api";

/**
 * Awards daily-visit XP once per day for the logged-in student.
 */
export function useDailyVisit() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "student" && user.email) {
      const t = setTimeout(() => {
        recordDailyVisit(user.email, user.name).catch(() => {
          /* ignore errors — visit tracking is best-effort */
        });
      }, 600);
      return () => clearTimeout(t);
    }
  }, [user]);
}
