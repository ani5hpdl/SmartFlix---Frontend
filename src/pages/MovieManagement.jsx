import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LayoutDashboard,
  Upload,
  Plus,
  Search,
  ChevronDown,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  X,
  Filter,
  RefreshCw,
  PlayCircle
} from 'lucide-react';
import { getMoviesWithFilters } from '../services/api';
import { toast } from 'react-hot-toast';
import { useVirtualizer } from "@tanstack/react-virtual";

export default function MovieLibrary() {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  const [filters, setFilters] = useState({
    genres: [],
    yearFrom: '1990',
    yearTo: '2026',
    rating: 0,
    runtime: '',
    status: 'all'
  });

  const [stats, setStats] = useState([
    { label: 'Total Movies', value: '2,450', icon: Film, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
    { label: 'Active Streams', value: '12.5k', icon: PlayCircle, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10' },
    { label: 'Avg Rating', value: '7.8', icon: Star, color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-500/10' },
    { label: 'Pending Review', value: '14', icon: Clock, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10' },
  ]);

  const genreOptions = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "Thriller", "War", "Western"
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Published', label: 'Published' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Archived', label: 'Archived' }
  ];

  const toggleSelectMovie = (id) => {
    setSelectedMovies(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleGenre = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'published': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'draft': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'archived': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filterMovies = async () => {
    try {
      setLoading(true);
      const data = {
        genres: filters.genres.join(","),
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        minRating: filters.rating,
        maxRating: 10,
        status: filters.status !== 'all' ? filters.status : undefined
      };
      const response = await getMoviesWithFilters(data);
      if (response.data.success) {
        setMovies(response.data.data);
        toast.success("Movies loaded successfully");
      } else {
        toast.error("Failed to fetch movies");
      }
    } catch (error) {
      toast.error(error.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterMovies();
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        filterMovies();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: movies.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 10,
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header stats={stats} />

        {/* Content Area */}
        <section className="flex-1 overflow-auto">
          <div className="px-8 py-6">
            {/* Search and Filters Bar */}
            <div className="flex items-center gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, director, or cast..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Genre Filter */}
              <GenreDropdown
                selectedGenres={filters.genres}
                onToggleGenre={toggleGenre}
                show={showGenreDropdown}
                setShow={setShowGenreDropdown}
                genreOptions={genreOptions}
              />

              {/* Status Filter */}
              <StatusDropdown
                selectedStatus={filters.status}
                onSelectStatus={(status) => setFilters(prev => ({ ...prev, status }))}
                show={showStatusDropdown}
                setShow={setShowStatusDropdown}
                statusOptions={statusOptions}
              />

              {/* Download Button */}
              <button className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200 group">
                <Download className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              </button>

              {/* Advanced Filters */}
              <button className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200 group relative">
                <SlidersHorizontal className="w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors" />
                {filters.genres.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-[10px] flex items-center justify-center font-semibold animate-pulse">
                    {filters.genres.length}
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={filterMovies}
                disabled={loading}
                className="p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200 group disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 group-hover:text-slate-200 transition-colors ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Active Filters */}
            {(filters.genres.length > 0 || filters.status !== 'all') && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Filters:</span>
                {filters.genres.map(genre => (
                  <FilterChip key={genre} label={genre} onRemove={() => toggleGenre(genre)} />
                ))}
                {filters.status !== 'all' && (
                  <FilterChip
                    label={`Status: ${filters.status}`}
                    onRemove={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                  />
                )}
                <button
                  onClick={() => setFilters({ genres: [], yearFrom: '1990', yearTo: '2026', rating: 0, runtime: '', status: 'all' })}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedMovies.length > 0 && (
              <div className="mb-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm text-blue-300 font-medium">
                  {selectedMovies.length} movie{selectedMovies.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 font-medium">
                    Export
                  </button>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 font-medium">
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedMovies([])}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-all duration-200 font-medium"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Table Container */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
                <div className="grid grid-cols-[48px_2fr_1fr_120px_100px_120px_80px] items-center px-5 py-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMovies(movies.map(m => m.id));
                      } else {
                        setSelectedMovies([]);
                      }
                    }}
                    checked={selectedMovies.length === movies.length && movies.length > 0}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                  />
                  {['Title', 'Status', 'Rating', 'Year', 'Runtime', ''].map(h => (
                    <div key={h} className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Body */}
              {loading ? (
                <TableSkeleton rows={8} />
              ) : movies.length === 0 ? (
                <EmptyState />
              ) : (
                <div ref={parentRef} className="max-h-[520px] overflow-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                  <div
                    style={{
                      height: rowVirtualizer.getTotalSize(),
                      position: "relative",
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map(row => {
                      const movie = movies[row.index];
                      return (
                        <MovieRow
                          key={movie.id}
                          movie={movie}
                          selected={selectedMovies.includes(movie.id)}
                          onToggleSelect={() => toggleSelectMovie(movie.id)}
                          getStatusColor={getStatusColor}
                          virtualRow={row}
                          measureElement={rowVirtualizer.measureElement}
                          activeMenu={activeMenu === movie.id}
                          setActiveMenu={setActiveMenu}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {!loading && movies.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Showing <span className="text-white font-semibold">1–10</span> of{" "}
                    <span className="text-white font-semibold">248</span> results
                  </p>

                  <div className="flex items-center gap-1">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                          n === 1
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <span className="px-2 text-slate-500">…</span>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                      12
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Sidebar Component
function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight">StreamAdmin</p>
            <p className="text-xs text-slate-400 mt-0.5">Management Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavItem icon={LayoutDashboard} label="Dashboard" />
        <NavItem icon={Film} label="Movies" active />
        <NavItem icon={Users} label="Users" />
        <NavItem icon={MessageSquare} label="Reviews" />
        <NavItem icon={BarChart3} label="Analytics" />
        <NavItem icon={Settings} label="Settings" />
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
            AM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Alex Morgan</p>
            <p className="text-xs text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Header Component
function Header({ stats }) {
  return (
    <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Movie Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curate, manage, and monitor your movie catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50 text-sm font-medium text-slate-200 flex items-center gap-2 transition-all duration-200 shadow-lg">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-sm font-semibold text-white flex items-center gap-2 transition-all duration-200 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105">
            <Plus className="w-4 h-4" />
            Add Movie
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" 
                 style={{ backgroundImage: `linear-gradient(135deg, ${stat.color})` }}></div>
            
            <div className="relative flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {stat.label}
              </p>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center opacity-80`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <p className="relative text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </header>
  );
}

// Navigation Item
function NavItem({ icon: Icon, label, active = false }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// Movie Row Component
function MovieRow({ movie, selected, onToggleSelect, getStatusColor, virtualRow, measureElement, activeMenu, setActiveMenu }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu, setActiveMenu]);

  return (
    <div
      ref={measureElement}
      data-index={virtualRow.index}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
      }}
      className="grid grid-cols-[48px_2fr_1fr_120px_100px_120px_80px] items-center px-5 py-4 border-b border-slate-700/30 hover:bg-slate-800/40 group transition-all duration-200"
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
      />

      <div className="flex items-center gap-4">
        <div className="relative w-11 h-16 rounded-lg overflow-hidden shadow-lg ring-1 ring-slate-700/50 group-hover:ring-blue-500/50 transition-all duration-200">
          <img
            src={movie.imageUrl || '/api/placeholder/44/64'}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => e.target.src = '/api/placeholder/44/64'}
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {movie.title}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{movie.genres || 'N/A'}</p>
        </div>
      </div>

      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(movie.status)} w-fit`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
        {movie.ageRating || 'N/A'}
      </span>

      <div className="flex items-center gap-1.5">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span className="font-semibold text-white">{movie.totalRating || '0.0'}</span>
        <span className="text-xs text-slate-500">({movie.languages || '0'})</span>
      </div>

      <span className="text-slate-300 font-medium">{movie.year || 'N/A'}</span>
      <span className="text-slate-300 font-medium">{movie.duration || 'N/A'}</span>

      <div className="flex justify-end relative" ref={menuRef}>
        <button
          onClick={() => setActiveMenu(activeMenu ? null : movie.id)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {activeMenu && <ActionMenu />}
      </div>
    </div>
  );
}

// Action Menu
function ActionMenu() {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
      <button className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3">
        <Eye className="w-4 h-4" />
        View Details
      </button>
      <button className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3">
        <Edit className="w-4 h-4" />
        Edit Movie
      </button>
      <button className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all flex items-center gap-3">
        <Download className="w-4 h-4" />
        Export Data
      </button>
      <div className="border-t border-slate-700/50"></div>
      <button className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center gap-3">
        <Trash2 className="w-4 h-4" />
        Delete Movie
      </button>
    </div>
  );
}

// Genre Dropdown
function GenreDropdown({ selectedGenres, onToggleGenre, show, setShow, genreOptions }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show, setShow]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShow(!show)}
        className="px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 text-sm font-medium text-slate-300 flex items-center gap-2 transition-all duration-200 relative"
      >
        <Filter className="w-4 h-4" />
        Genres
        {selectedGenres.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-lg animate-pulse">
            {selectedGenres.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      {show && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-auto">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {genreOptions.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all group"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => onToggleGenre(genre)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{genre}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Dropdown
function StatusDropdown({ selectedStatus, onSelectStatus, show, setShow, statusOptions }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [show, setShow]);

  const currentLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Status';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShow(!show)}
        className="px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 text-sm font-medium text-slate-300 flex items-center gap-2 transition-all duration-200"
      >
        {currentLabel}
        <ChevronDown className={`w-4 h-4 transition-transform ${show ? 'rotate-180' : ''}`} />
      </button>
      {show && (
        <div className="absolute top-full mt-2 left-0 w-48 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelectStatus(option.value);
                setShow(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-all ${
                selectedStatus === option.value
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Filter Chip
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm text-blue-300 text-xs rounded-lg border border-blue-500/30 font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-blue-200 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// Table Skeleton
function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[48px_2fr_1fr_120px_100px_120px_80px] items-center px-5 py-4 border-b border-slate-700/30"
        >
          <div className="w-4 h-4 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-11 h-16 bg-slate-700/50 rounded-lg animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
          <div className="w-20 h-7 bg-slate-700/50 rounded-lg animate-pulse"></div>
          <div className="w-16 h-4 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="w-12 h-4 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-slate-700/50 rounded animate-pulse"></div>
          <div className="w-8 h-4 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Film className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No movies found</h3>
      <p className="text-sm text-slate-400 max-w-sm">
        Try adjusting your filters or add a new movie to start building your catalog.
      </p>
      <button className="mt-6 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105">
        Add Your First Movie
      </button>
    </div>
  );
}