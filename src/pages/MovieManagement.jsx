import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import { createPortal } from 'react-dom';
import {
  Film, Upload, Plus, Search, ChevronDown, Download,
  ChevronLeft, ChevronRight, Star, Clock, MoreVertical, Eye,
  Edit, Trash2, X, Filter, RefreshCw, PlayCircle, TrendingUp,
  Grid3X3, List, BookOpen
} from 'lucide-react';
import { deleteAllMovies, getAllMovies, importMovies } from '../services/api';
import { toast } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES  — only things Tailwind physically cannot do:
   @import, @keyframes, ::webkit-scrollbar, CSS child selectors
───────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; font-family: 'Outfit', sans-serif; }

    /* custom scrollbar */
    .sb::-webkit-scrollbar        { width: 3px; height: 3px; }
    .sb::-webkit-scrollbar-track  { background: transparent; }
    .sb::-webkit-scrollbar-thumb  { background: rgba(139,92,246,.25); border-radius: 9px; }

    /* shimmer skeleton */
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .shimmer {
      background: linear-gradient(90deg,#1a1130 25%,#261848 50%,#1a1130 75%);
      background-size: 200% 100%;
      animation: shimmer 1.6s infinite;
      border-radius: 6px;
    }

    /* staggered fade-up entrance */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    .fu-1 { animation: fadeUp .38s .00s cubic-bezier(.22,1,.36,1) both; }
    .fu-2 { animation: fadeUp .38s .07s cubic-bezier(.22,1,.36,1) both; }
    .fu-3 { animation: fadeUp .38s .14s cubic-bezier(.22,1,.36,1) both; }
    .fu-4 { animation: fadeUp .38s .21s cubic-bezier(.22,1,.36,1) both; }

    /* row hover — needs child selector, can't be done with Tailwind alone */
    .movie-row:hover                { background: rgba(139,92,246,.07); }
    .movie-row:hover .mv-title      { color: #a78bfa; }
    .movie-row .mv-actions          { opacity: 0; transition: opacity .15s; }
    .movie-row:hover .mv-actions    { opacity: 1; }

    /* active nav bar */
    .nav-pill.is-active { position: relative; }
    .nav-pill.is-active::before {
      content: '';
      position: absolute; left: 0; top: 20%; bottom: 20%;
      width: 3px; background: #8b5cf6; border-radius: 0 3px 3px 0;
    }

    /* poster glass highlight */
    .poster { position: relative; overflow: hidden; }
    .poster::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,.09) 0%, transparent 55%);
      pointer-events: none;
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────
   PORTAL DROPDOWN
   Renders directly into <body> so it's ALWAYS above every z-index.
   No need to fight stacking contexts on the table.
───────────────────────────────────────────────────────────── */
function PortalDropdown({ anchorRef, open, onClose, children, width = 'w-72' }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) onClose();
    };
    // slight delay so the trigger click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', h), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', h); };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed ${width} bg-[#1c1236] border border-violet-700/40 rounded-xl shadow-2xl shadow-black/70 overflow-hidden`}
      style={{ top: pos.top, left: pos.left, zIndex: 99999 }}
    >
      {children}
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
   CACHE HOOK
───────────────────────────────────────────────────────────── */
const CACHE_TTL = 5 * 60 * 1000;

function useMovieCache(fetchFn) {
  const cacheRef = useRef({ data: null, ts: null });
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading]     = useState(false);

  const loadCache = useCallback(async (force = false) => {
    const { data, ts } = cacheRef.current;
    if (!force && data && Date.now() - ts < CACHE_TTL) { setAllMovies(data); return data; }

    setLoading(true);
    try {
      const res  = await fetchFn();
      const raw  = res?.data?.movies ?? res?.data?.data ?? res?.data ?? res?.movies ?? res ?? [];
      const list = Array.isArray(raw) ? raw : [];
      if (!Array.isArray(raw)) console.warn('[cache] unexpected shape', res);
      cacheRef.current = { data: list, ts: Date.now() };
      setAllMovies(list);
      return list;
    } catch (e) {
      toast.error(e.message || 'Failed to load movies');
      return [];
    } finally { setLoading(false); }
  }, [fetchFn]);

  const invalidate     = useCallback(() => { cacheRef.current = { data: null, ts: null }; }, []);
  const updateItem     = useCallback((u) => {
    if (!cacheRef.current.data) return;
    const a = cacheRef.current.data.map(m => m.id === u.id ? u : m);
    cacheRef.current.data = a; setAllMovies(a);
  }, []);
  const deleteItem     = useCallback((id) => {
    if (!cacheRef.current.data) return;
    const a = cacheRef.current.data.filter(m => m.id !== id);
    cacheRef.current.data = a; setAllMovies(a);
  }, []);

  return { allMovies, loading, loadCache, invalidate, updateItem, deleteItem };
}

/* ─────────────────────────────────────────────────────────────
   FILTER + PAGINATION HOOK
───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 15;

function useMovieTable(allMovies, filters, search) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = Array.isArray(allMovies) ? allMovies : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(m =>
        m.title?.toLowerCase().includes(q) ||
        m.director?.toLowerCase().includes(q) ||
        m.genres?.toLowerCase().includes(q)
      );
    }
    if (filters.genres.length)
      r = r.filter(m => filters.genres.some(g => m.genres?.toLowerCase().includes(g.toLowerCase())));
    if (filters.status !== 'all') r = r.filter(m => m.status === filters.status);
    if (filters.yearFrom) r = r.filter(m => Number(m.year) >= Number(filters.yearFrom));
    if (filters.yearTo)   r = r.filter(m => Number(m.year) <= Number(filters.yearTo));
    if (filters.rating)   r = r.filter(m => Number(m.totalRating) >= filters.rating);
    return [...r].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
    );
  }, [allMovies, filters, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = useMemo(() => filtered.slice((safePage-1)*PAGE_SIZE, safePage*PAGE_SIZE), [filtered, safePage]);
  const safeSetPage = useCallback(p => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

  return { movies: paginated, page: safePage, setPage: safeSetPage, totalPages, totalCount: filtered.length };
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE HELPER
───────────────────────────────────────────────────────────── */
const statusCls = (s) => {
  switch (s?.toLowerCase()) {
    case 'published': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'draft':     return 'bg-amber-500/15  text-amber-400  border border-amber-500/30';
    case 'archived':  return 'bg-slate-500/15  text-slate-400  border border-slate-500/30';
    default:          return 'bg-slate-500/15  text-slate-400  border border-slate-500/30';
  }
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function MovieLibrary() {
  const [selectedMovies, setSelected]     = useState([]);
  const [searchQuery,    setSearch]       = useState('');
  const [debSearch,      setDebSearch]    = useState('');
  const [genreOpen,      setGenreOpen]    = useState(false);
  const [statusOpen,     setStatusOpen]   = useState(false);
  const [activeMenu,     setActiveMenu]   = useState(null);
  const [viewMode,       setViewMode]     = useState('list');
  const [importing,      setImporting]    = useState(false);
  const [deletingAll,    setDeletingAll]  = useState(false);

  const genreAnchor  = useRef(null);
  const statusAnchor = useRef(null);

  const [filters, setFilters] = useState({
    genres: [], yearFrom: '1990', yearTo: '2026', rating: 0, status: 'all',
  });

  const GENRES = [
    'Action','Adventure','Animation','Comedy','Crime','Documentary',
    'Drama','Family','Fantasy','History','Horror','Music','Mystery',
    'Romance','Science Fiction','Thriller','War','Western',
  ];
  const STATUSES = [
    { value: 'all',       label: 'All Status' },
    { value: 'Published', label: 'Published'  },
    { value: 'Draft',     label: 'Draft'       },
    { value: 'Archived',  label: 'Archived'    },
  ];
  const fetchAllMovies = useCallback(async () => {
    const limit = 100;
    let page = 1;
    let totalPages = 1;
    const merged = [];

    do {
      const res = await getAllMovies({ page, limit });
      const batch = Array.isArray(res?.data?.data) ? res.data.data : [];
      merged.push(...batch);
      totalPages = Number(res?.data?.totalPages || 1);
      page += 1;
    } while (page <= totalPages);

    return { data: merged };
  }, []);

  const { allMovies, loading, loadCache, invalidate } = useMovieCache(fetchAllMovies);
  useEffect(() => { loadCache(); }, [loadCache]);
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { movies, page, setPage, totalPages, totalCount } =
    useMovieTable(allMovies, filters, debSearch);

  const toggleSelect = id  => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleGenre  = g   => setFilters(p => ({
    ...p,
    genres: p.genres.includes(g) ? p.genres.filter(x => x !== g) : [...p.genres, g],
  }));
  const clearFilters = ()  => setFilters({ genres: [], yearFrom: '1990', yearTo: '2026', rating: 0, status: 'all' });
  const handleRefresh= ()  => { invalidate(); loadCache(true); toast.success('Library refreshed'); };
  const handleImport = useCallback(async () => {
    if (importing) return;
    setImporting(true);
    try {
      const response = await importMovies();
      invalidate();
      await loadCache(true);
      toast.success(response?.data?.message || 'Movies imported successfully');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to import movies');
    } finally {
      setImporting(false);
    }
  }, [importing, invalidate, loadCache]);
  const handleDeleteAll = useCallback(async () => {
    if (deletingAll) return;
    const confirmed = window.confirm('This will permanently delete all movies from the library. Continue?');
    if (!confirmed) return;

    setDeletingAll(true);
    try {
      const response = await deleteAllMovies();
      invalidate();
      await loadCache(true);
      toast.success(response?.data?.message || 'All movies deleted successfully');
      setSelected([]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete all movies');
    } finally {
      setDeletingAll(false);
    }
  }, [deletingAll, invalidate, loadCache]);

  const totalCached    = allMovies.length;
  const avgRating      = totalCached
    ? (allMovies.reduce((s, m) => s + Number(m.totalRating || 0), 0) / totalCached).toFixed(1)
    : '—';
  const publishedCount = allMovies.filter(m => m.status === 'Published').length;
  const activeFilters  = filters.genres.length + (filters.status !== 'all' ? 1 : 0);

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen bg-[#09061a] text-slate-200">
        <AdminNavbar />

        {/* Scrollable body */}
        <main className="sb px-5 md:px-7 py-6">
          <div className="mx-auto w-full max-w-[1500px]">

              {/* Page heading */}
              <div className="fu-1 flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-7 rounded-full bg-violet-500" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Movie Library</h1>
                  </div>
                  <p className="text-[12px] text-slate-600 mt-1 ml-4">
                    {totalCached > 0 ? `${totalCached.toLocaleString()} titles in catalog` : 'Loading catalog…'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1030] border border-violet-800/40 rounded-lg text-[12px] text-slate-300 font-medium hover:bg-violet-900/30 hover:border-violet-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={13} /> {importing ? 'Importing...' : 'Import'}
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[12px] text-red-300 font-medium hover:bg-red-500/20 hover:border-red-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} /> {deletingAll ? 'Deleting...' : 'Delete All'}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-[12px] text-white font-semibold shadow-lg shadow-violet-900/40 hover:-translate-y-px transition-all">
                    <Plus size={13} /> Add Movie
                  </button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Film,       label: 'Total Titles',     value: totalCached || '—',   sub: 'in library',     ic: 'text-violet-400',  bg: 'bg-violet-500/10',  d: 'fu-1' },
                  { icon: Star,       label: 'Avg Rating',       value: avgRating,             sub: 'across catalog', ic: 'text-amber-400',   bg: 'bg-amber-500/10',   d: 'fu-2' },
                  { icon: PlayCircle, label: 'Published',        value: publishedCount || '—', sub: 'live now',       ic: 'text-emerald-400', bg: 'bg-emerald-500/10', d: 'fu-3' },
                  { icon: TrendingUp, label: 'Filtered Results', value: totalCount,            sub: 'current view',   ic: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', d: 'fu-4' },
                ].map(({ icon, label, value, sub, ic, bg, d }) => (
                  <div
                    key={label}
                    className={`${d} group flex items-center gap-4 p-4 rounded-xl bg-[#120d24] border border-violet-900/30 hover:border-violet-700/50 transition-all cursor-default`}
                  >
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {React.createElement(icon, { size: 18, className: ic })}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl font-bold text-white leading-none">{value}</div>
                      <div className="text-[11px] text-slate-600 mt-1 truncate">{label} · {sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Toolbar ── */}
              <div className="fu-2 flex items-center gap-2.5 mb-3">

                {/* Search */}
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search titles, directors, genres…"
                    className="w-full bg-[#120d24] border border-violet-900/40 rounded-lg pl-9 pr-9 py-2.5 text-[13px] text-slate-200 placeholder-slate-700 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* ── Genre button + portal dropdown ── */}
                <div ref={genreAnchor}>
                  <button
                    onClick={() => { setGenreOpen(p => !p); setStatusOpen(false); }}
                    className={[
                      'flex items-center gap-2 px-3.5 py-2.5 border rounded-lg text-[12px] font-medium transition-all',
                      filters.genres.length
                        ? 'bg-violet-900/30 border-violet-500/50 text-violet-300'
                        : 'bg-[#120d24] border-violet-900/40 text-slate-400 hover:border-violet-600/40 hover:text-slate-300',
                    ].join(' ')}
                  >
                    <Filter size={13} />
                    Genres
                    {filters.genres.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {filters.genres.length}
                      </span>
                    )}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${genreOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                <PortalDropdown
                  anchorRef={genreAnchor}
                  open={genreOpen}
                  onClose={() => setGenreOpen(false)}
                  width="w-72"
                >
                  <div className="max-h-72 overflow-y-auto sb p-2 grid grid-cols-2 gap-0.5">
                    {GENRES.map(g => (
                      <label
                        key={g}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-violet-900/30 transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.genres.includes(g)}
                          onChange={() => toggleGenre(g)}
                          className="w-3.5 h-3.5 accent-violet-500 cursor-pointer flex-shrink-0"
                        />
                        <span className={`text-[12px] transition-colors ${filters.genres.includes(g) ? 'text-violet-300 font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>
                </PortalDropdown>

                {/* ── Status button + portal dropdown ── */}
                <div ref={statusAnchor}>
                  <button
                    onClick={() => { setStatusOpen(p => !p); setGenreOpen(false); }}
                    className={[
                      'flex items-center gap-2 px-3.5 py-2.5 border rounded-lg text-[12px] font-medium transition-all',
                      filters.status !== 'all'
                        ? 'bg-violet-900/30 border-violet-500/50 text-violet-300'
                        : 'bg-[#120d24] border-violet-900/40 text-slate-400 hover:border-violet-600/40 hover:text-slate-300',
                    ].join(' ')}
                  >
                    {STATUSES.find(o => o.value === filters.status)?.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${statusOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                <PortalDropdown
                  anchorRef={statusAnchor}
                  open={statusOpen}
                  onClose={() => setStatusOpen(false)}
                  width="w-44"
                >
                  {STATUSES.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setFilters(p => ({ ...p, status: opt.value })); setStatusOpen(false); }}
                      className={[
                        'w-full px-4 py-2.5 text-left text-[12px] transition-colors',
                        filters.status === opt.value
                          ? 'bg-violet-600/20 text-violet-300 font-semibold'
                          : 'text-slate-400 hover:bg-violet-900/30 hover:text-slate-200',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </PortalDropdown>

                {/* Divider */}
                <div className="w-px h-7 bg-violet-900/40 flex-shrink-0" />

                {/* View toggle */}
                <div className="flex bg-[#120d24] border border-violet-900/40 rounded-lg p-1 gap-0.5">
                  {[['list', List], ['grid', Grid3X3]].map(([mode, icon]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === mode
                          ? 'bg-violet-600/40 text-violet-300'
                          : 'text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      {React.createElement(icon, { size: 13 })}
                    </button>
                  ))}
                </div>

                <button className="p-2.5 bg-[#120d24] border border-violet-900/40 rounded-lg text-slate-500 hover:text-slate-200 hover:border-violet-600/40 transition-all">
                  <Download size={14} />
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2.5 bg-[#120d24] border border-violet-900/40 rounded-lg text-slate-500 hover:text-slate-200 hover:border-violet-600/40 transition-all disabled:opacity-40"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>

                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-violet-900/20 border border-violet-600/30 rounded-lg text-[11px] text-violet-400 font-medium hover:bg-violet-900/40 transition-all"
                  >
                    <X size={11} /> Clear {activeFilters}
                  </button>
                )}
              </div>

              {/* Active filter chips */}
              {(filters.genres.length > 0 || filters.status !== 'all') && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.genres.map(g => (
                    <span key={g} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-900/30 border border-violet-600/30 rounded-full text-[11px] text-violet-300 font-medium">
                      {g}
                      <button onClick={() => toggleGenre(g)} className="text-violet-500 hover:text-violet-200 transition-colors">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-900/30 border border-violet-600/30 rounded-full text-[11px] text-violet-300 font-medium">
                      {filters.status}
                      <button
                        onClick={() => setFilters(p => ({ ...p, status: 'all' }))}
                        className="text-violet-500 hover:text-violet-200 transition-colors"
                      >
                        <X size={9} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Bulk actions */}
              {selectedMovies.length > 0 && (
                <div className="flex items-center justify-between bg-violet-900/20 border border-violet-600/30 rounded-xl px-5 py-3 mb-4">
                  <span className="text-[13px] text-violet-300 font-medium">
                    {selectedMovies.length} title{selectedMovies.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3.5 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-300 text-[12px] font-semibold hover:bg-violet-600/30 transition-all">
                      Export
                    </button>
                    <button className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/25 rounded-lg text-red-400 text-[12px] font-semibold hover:bg-red-500/20 transition-all">
                      Delete
                    </button>
                    <button
                      onClick={() => setSelected([])}
                      className="px-3.5 py-1.5 bg-[#1a1232] border border-violet-900/40 rounded-lg text-slate-400 text-[12px] hover:bg-violet-900/20 transition-all"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* ── TABLE / GRID ── */}
              <div className="fu-3 bg-[#0d0921] border border-violet-900/30 rounded-2xl overflow-hidden">

                {viewMode === 'list' ? (
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-[40px_2.5fr_110px_100px_80px_110px_56px] items-center px-5 py-3 bg-[#120d24] border-b border-violet-900/25">
                      <input
                        type="checkbox"
                        checked={movies.length > 0 && movies.every(m => selectedMovies.includes(m.id))}
                        onChange={e => setSelected(e.target.checked ? movies.map(m => m.id) : [])}
                        className="w-3.5 h-3.5 accent-violet-500 cursor-pointer"
                      />
                      {['Title','Status','Rating','Year','Runtime',''].map(h => (
                        <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                          {h}
                        </span>
                      ))}
                    </div>

                    {loading
                      ? <TableSkeleton />
                      : movies.length === 0
                        ? <EmptyState />
                        : movies.map((movie, i) => (
                            <MovieRow
                              key={movie.id}
                              movie={movie}
                              index={i}
                              selected={selectedMovies.includes(movie.id)}
                              onToggleSelect={() => toggleSelect(movie.id)}
                              activeMenu={activeMenu === movie.id}
                              setActiveMenu={setActiveMenu}
                            />
                          ))
                    }
                  </>
                ) : (
                  loading
                    ? <GridSkeleton />
                    : movies.length === 0
                      ? <EmptyState />
                      : (
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-4 p-5">
                            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                          </div>
                        )
                )}

                {!loading && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={setPage}
                  />
                )}
              </div>

          </div>
        </main>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOVIE ROW
───────────────────────────────────────────────────────────── */
function MovieRow({ movie, selected, onToggleSelect, activeMenu, setActiveMenu }) {
  const menuAnchor = useRef(null);
  const genres     = (movie.genres || '').split(',').slice(0, 2);

  // close menu on outside click
  useEffect(() => {
    if (!activeMenu) return;
    const h = e => { if (menuAnchor.current && !menuAnchor.current.contains(e.target)) setActiveMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [activeMenu, setActiveMenu]);

  return (
    <div className="movie-row grid grid-cols-[40px_2.5fr_110px_100px_80px_110px_56px] items-center px-5 py-3 border-b border-violet-900/15 transition-colors duration-150">

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        className="w-3.5 h-3.5 accent-violet-500 cursor-pointer"
      />

      {/* Title + poster */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="poster w-8 h-12 rounded-md flex-shrink-0 ring-1 ring-violet-900/50 overflow-hidden">
          <img
            src={movie.imageUrl || '/api/placeholder/32/48'}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = '/api/placeholder/32/48'; }}
          />
        </div>
        <div className="min-w-0">
          <p className="mv-title text-[13px] font-semibold text-slate-200 truncate transition-colors duration-150">
            {movie.title}
          </p>
          <div className="flex gap-1 mt-1">
            {genres.map(g => (
              <span key={g} className="text-[9px] px-1.5 py-0.5 bg-violet-900/40 text-violet-400 rounded font-medium">
                {g.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <span className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full ${statusCls(movie.status)}`}>
          {movie.status || 'Unknown'}
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-white">{movie.totalRating || '—'}</span>
        <span className="text-[10px] text-slate-600">/10</span>
      </div>

      {/* Year */}
      <span className="text-[12px] text-slate-500">{movie.year || '—'}</span>

      {/* Runtime */}
      <div className="flex items-center gap-1.5">
        <Clock size={10} className="text-slate-600" />
        <span className="text-[12px] text-slate-500">{movie.duration || '—'}</span>
      </div>

      {/* Action menu button — portal used so menu is never clipped */}
      <div className="flex justify-end" ref={menuAnchor}>
        <button
          onClick={() => setActiveMenu(activeMenu ? null : movie.id)}
          className="mv-actions p-1.5 text-slate-600 hover:text-slate-300 hover:bg-violet-900/30 rounded-lg"
        >
          <MoreVertical size={14} />
        </button>

        {activeMenu && (
          <RowMenu anchorRef={menuAnchor} onClose={() => setActiveMenu(null)} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROW ACTION MENU — rendered in a portal so it's never clipped
───────────────────────────────────────────────────────────── */
function RowMenu({ anchorRef, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    // align right edge of menu with right edge of button
    setPos({ top: r.bottom + window.scrollY + 4, left: r.right + window.scrollX - 176 });
  }, [anchorRef]);

  useEffect(() => {
    const t = setTimeout(() => {
      const h = () => onClose();
      document.addEventListener('mousedown', h);
      return () => document.removeEventListener('mousedown', h);
    }, 10);
    return () => clearTimeout(t);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed w-44 bg-[#1c1236] border border-violet-700/40 rounded-xl shadow-2xl shadow-black/70 overflow-hidden"
      style={{ top: pos.top, left: pos.left, zIndex: 99999 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {[
        { icon: Eye,      label: 'View Details', cls: 'text-slate-300 hover:bg-violet-900/30 hover:text-white' },
        { icon: Edit,     label: 'Edit Movie',   cls: 'text-slate-300 hover:bg-violet-900/30 hover:text-white' },
        { icon: Download, label: 'Export Data',  cls: 'text-slate-300 hover:bg-violet-900/30 hover:text-white' },
      ].map(({ icon, label, cls }) => (
        <button key={label} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] transition-colors ${cls}`}>
          {React.createElement(icon, { size: 13 })} {label}
        </button>
      ))}
      <div className="h-px bg-violet-900/40 mx-2" />
      <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
        <Trash2 size={13} /> Delete Movie
      </button>
    </div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────
   MOVIE CARD (grid view)
───────────────────────────────────────────────────────────── */
function MovieCard({ movie }) {
  return (
    <div className="group bg-[#120d24] border border-violet-900/30 rounded-xl overflow-hidden hover:border-violet-600/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        <img
          src={movie.imageUrl || '/api/placeholder/148/222'}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = '/api/placeholder/148/222'; }}
        />
        <div className="absolute top-2 right-2">
          <span className={`text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full backdrop-blur-sm ${statusCls(movie.status)}`}>
            {movie.status || '—'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-8 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center gap-1">
            <Star size={9} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-white">{movie.totalRating || '—'}</span>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-violet-300 transition-colors">
          {movie.title}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">{movie.year} · {movie.duration || '—'}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, totalCount, onPageChange }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, totalCount);

  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3)
      return [1, '…', ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  })();

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-violet-900/25 bg-[#120d24]/50">
      <span className="text-[12px] text-slate-600">
        Showing <strong className="text-slate-400">{from}–{to}</strong> of{' '}
        <strong className="text-slate-400">{totalCount}</strong>
      </span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-violet-900/30 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1.5 text-slate-600 text-[12px] select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={[
                'min-w-[28px] h-7 px-2 text-[12px] rounded-lg font-medium transition-all',
                p === page
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50'
                  : 'text-slate-500 hover:bg-violet-900/30 hover:text-slate-300',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 text-slate-600 hover:text-slate-300 hover:bg-violet-900/30 rounded-lg transition-all disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETONS
───────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[40px_2.5fr_110px_100px_80px_110px_56px] items-center px-5 py-3 border-b border-violet-900/15">
          <div className="shimmer w-3.5 h-3.5" />
          <div className="flex items-center gap-3">
            <div className="shimmer w-8 h-12 flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="shimmer h-3 w-32" />
              <div className="shimmer h-2 w-20" />
            </div>
          </div>
          <div className="shimmer h-5 w-16 rounded-full" />
          <div className="shimmer h-3 w-10" />
          <div className="shimmer h-3 w-8" />
          <div className="shimmer h-3 w-12" />
          <div />
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-4 p-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i}>
          <div className="shimmer rounded-xl mb-2" style={{ aspectRatio: '2/3' }} />
          <div className="shimmer h-3 w-4/5 mb-1.5" />
          <div className="shimmer h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="py-16 flex flex-col items-center text-center px-6">
      <div className="w-14 h-14 bg-violet-900/20 border border-violet-800/30 rounded-2xl flex items-center justify-center mb-4">
        <BookOpen size={20} className="text-violet-500 opacity-70" />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-300 mb-2">No titles found</h3>
      <p className="text-[12px] text-slate-600 max-w-xs leading-relaxed mb-5">
        Try adjusting your search or filters, or add a new movie to start building your catalog.
      </p>
      <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-[12px] text-white font-semibold transition-all hover:-translate-y-px">
        <Plus size={13} /> Add First Movie
      </button>
    </div>
  );
}
