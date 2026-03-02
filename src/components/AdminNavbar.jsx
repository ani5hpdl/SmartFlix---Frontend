import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Clapperboard, LogOut, MessageSquareText, ShieldUser, Users, LayoutDashboard } from "lucide-react";

const adminLinks = [
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Movies", path: "/admin/movies", icon: Clapperboard },
  { label: "Reviews", path: "/admin/reviews", icon: MessageSquareText },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-violet-900/35 bg-[#0b0818]/90 backdrop-blur-xl">
      <div className="mx-auto w-full px-5 md:px-7 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-left"
          aria-label="Go to admin users"
        >
          <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center">
            <ShieldUser size={18} className="text-violet-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-200 leading-none">Admin Panel</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mt-1">Management</p>
          </div>
        </button>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-2 rounded-lg border border-transparent text-sm inline-flex items-center gap-2 transition-colors text-slate-300 hover:bg-violet-900/25 hover:text-white"
          >
            <LayoutDashboard size={15} />
            User Dashboard
          </button>
          {adminLinks.map(({ label, path, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg border text-sm inline-flex items-center gap-2 transition-colors ${
                  isActive
                    ? "border-violet-500/45 bg-violet-600/20 text-violet-200"
                    : "border-transparent text-slate-300 hover:bg-violet-900/25 hover:text-white"
                }`
              }
            >
              {icon ? (React.createElement(icon, { size: 15 })) : null}
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="h-9 px-3 rounded-lg border border-violet-800/40 bg-violet-900/20 hover:bg-violet-900/35 text-slate-200 text-sm inline-flex items-center gap-2"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
