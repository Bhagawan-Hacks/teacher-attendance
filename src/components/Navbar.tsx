import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active ? "text-sage-700" : "text-ink-700/70 hover:text-sage-600"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/80 bg-cream-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-700 text-cream-50">
            <GraduationCap size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-bold text-ink-900">EduMark</div>
            <div className="text-[11px] uppercase tracking-wider text-sage-500">Faculty Hub</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {navLink("/", "Teachers")}
          {navLink("/leaderboard", "Leaderboard")}
          {user?.role === "admin" && navLink("/admin", "Attendance")}
          {user && navLink("/profile", "My Activity")}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-sage-50 px-3 py-1.5 sm:flex">
                {user.role === "admin" ? (
                  <ShieldCheck size={15} className="text-sage-600" />
                ) : (
                  <UserRound size={15} className="text-sage-600" />
                )}
                <span className="text-sm font-medium text-sage-700">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex items-center gap-1.5 rounded-full border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-clay-400 hover:text-clay-500"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-sage-700 px-4 py-2 text-sm font-semibold text-cream-50 transition-colors hover:bg-sage-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
