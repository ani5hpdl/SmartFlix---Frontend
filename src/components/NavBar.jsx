import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Film, LogOut, Menu, User, X } from 'lucide-react';

function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Explore", path: "/explore" },
    { label: "Recommend Me", path: "/recommendations" },
    { label: "Watchlist", path: "/watchlist" },
    { label: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
      isActive
        ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
        : "text-gray-300 hover:text-white hover:bg-white/5 border border-transparent"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0e17]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between gap-3">
        <button
          className="md:hidden w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <button
          className="flex items-center gap-2 shrink-0"
          onClick={() => navigate("/dashboard")}
          aria-label="Go to dashboard"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Film size={18} className="text-purple-300" />
          </div>
          <span className="font-semibold tracking-wide text-white hidden sm:inline">SmartFlix</span>
        </button>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center">
            <Bell size={18} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-lg border border-purple-400/30 bg-purple-600/20 hover:bg-purple-600/30 transition-colors flex items-center justify-center"
            aria-label="Go to profile"
          >
            <User size={18} className="text-purple-200" />
          </button>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-3 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav className="md:hidden border-t border-white/10 px-4 pb-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkClass}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-slate-200"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
