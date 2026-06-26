import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-cream-200 bg-cream-100/60">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-5 sm:px-8 lg:px-12 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-700 text-cream-50">
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-bold">BCA Faculty Hub</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-700/70">
            A calm, human space for students and faculty — celebrating great teaching,
            one review at a time.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-sage-700">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-700/70">
            <li><Link to="/" className="hover:text-sage-600">All Teachers</Link></li>
            <li><Link to="/leaderboard" className="hover:text-sage-600">Leaderboard</Link></li>
            <li><Link to="/login" className="hover:text-sage-600">Student Sign-in</Link></li>
            <li><Link to="/login" className="hover:text-sage-600">Admin Portal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-sage-700">Contact</h4>
          <div className="mt-3 flex items-center gap-2 text-sm text-ink-700/70">
            <Mail size={15} className="text-clay-400" />
            hello@bcafacultyhub.edu
          </div>
          <p className="mt-3 text-xs text-ink-700/50">
            © {new Date().getFullYear()} BCA Faculty Hub. Crafted with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
