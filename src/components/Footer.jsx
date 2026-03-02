import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0e17]">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <p className="text-slate-400">(c) 2026 SmartFlix. All rights reserved.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
          <Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
