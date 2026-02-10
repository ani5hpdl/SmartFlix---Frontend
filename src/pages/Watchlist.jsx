import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, X, Star, Clock, Trash2, Search, 
  ArrowLeft, Film, Award, ChevronDown,
  Grid3x3, LayoutList, Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMoviesWithFilters } from "../services/api";
import MovieCard from "../components/MovieCard";

export default function Watchlist() {
  const navigate = useNavigate();
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('added');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMovies, setSelectedMovies] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchWatchlistMovies();
  }, []);

  useEffect(() => {
    // Listen for watchlist updates from MovieCard
    const handleStorageChange = () => {
      fetchWatchlistMovies();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from same tab
    window.addEventListener('watchlistUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', handleStorageChange);
    };
  }, []);

  const fetchWatchlistMovies = async () => {
    try {
      setIsLoading(true);
      const watchlistIds = JSON.parse(localStorage.getItem("watchlist")) || [];
      
      if (watchlistIds.length === 0) {
        setWatchlistMovies([]);
        setIsLoading(false);
        return;
      }

      const response = await getMoviesWithFilters({
        genres: "",
        yearFrom: "",
        yearTo: "",
        minRating: 0,
        maxRating: 10
      });

      if (response.data.success) {
        const movies = response.data.data;
        const watchlist = movies.filter(movie => watchlistIds.includes(movie.id));
        setWatchlistMovies(watchlist);
      }
      
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load watchlist");
      setIsLoading(false);
    }
  };

  const removeSelected = () => {
    if (selectedMovies.size === 0) return;
    
    if (window.confirm(`Remove ${selectedMovies.size} selected ${selectedMovies.size === 1 ? 'movie' : 'movies'}?`)) {
      const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
      const updated = watchlist.filter(id => !selectedMovies.has(id));
      localStorage.setItem("watchlist", JSON.stringify(updated));
      
      setWatchlistMovies(prev => prev.filter(movie => !selectedMovies.has(movie.id)));
      setSelectedMovies(new Set());
      setIsSelectionMode(false);
      toast.success(`${selectedMovies.size} movies removed`);
      
      // Trigger update event
      window.dispatchEvent(new Event('watchlistUpdated'));
    }
  };

  const toggleSelectMovie = (movieId, e) => {
    e.stopPropagation();
    setSelectedMovies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedMovies.size === filteredMovies.length) {
      setSelectedMovies(new Set());
    } else {
      setSelectedMovies(new Set(filteredMovies.map(m => m.id)));
    }
  };

  const clearAllWatchlist = () => {
    if (window.confirm("Clear your entire watchlist? This cannot be undone.")) {
      localStorage.setItem("watchlist", JSON.stringify([]));
      setWatchlistMovies([]);
      setSelectedMovies(new Set());
      setIsSelectionMode(false);
      toast.success("Watchlist cleared");
      window.dispatchEvent(new Event('watchlistUpdated'));
    }
  };

  const allGenres = [...new Set(
    watchlistMovies.flatMap(movie => 
      movie.genres?.split(',').map(g => g.trim()) || []
    )
  )].sort();

  const filteredMovies = watchlistMovies
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = filterGenre === 'all' || movie.genres?.toLowerCase().includes(filterGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'year':
          return parseInt(b.year) - parseInt(a.year);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const stats = {
    total: watchlistMovies.length,
    avgRating: watchlistMovies.length > 0 
      ? (watchlistMovies.reduce((sum, m) => sum + parseFloat(m.rating), 0) / watchlistMovies.length).toFixed(1)
      : 0,
    totalMinutes: watchlistMovies.reduce((sum, m) => {
      const duration = parseInt(m.duration);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0),
    genres: allGenres.length
  };

  const totalHours = Math.floor(stats.totalMinutes / 60);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
            <Heart size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 animate-pulse" />
          </div>
          <p className="text-gray-400">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .cinzel {
          font-family: 'Cinzel', serif;
        }
        
        .glass-effect {
          background: linear-gradient(
            to bottom,
            rgba(11, 15, 22, 0.95),
            rgba(11, 15, 22, 0.88)
          );
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
        }

        .checkbox-wrapper {
          position: relative;
        }

        .checkbox {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .checkbox:checked {
          background: #8b5cf6;
          border-color: #8b5cf6;
        }

        .checkbox:checked::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .list-view-card {
          transition: all 0.3s ease;
        }

        .list-view-card:hover {
          background: rgba(139, 92, 246, 0.05);
          transform: translateX(4px);
        }
      `}</style>

      {/* HEADER */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <h1 className="cinzel text-2xl font-bold">My Watchlist</h1>
                <p className="text-gray-400 text-sm">
                  {watchlistMovies.length} {watchlistMovies.length === 1 ? 'movie' : 'movies'}
                  {selectedMovies.size > 0 && ` • ${selectedMovies.size} selected`}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              {isSelectionMode ? (
                <>
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium hidden sm:flex items-center gap-2"
                  >
                    <Check size={16} />
                    {selectedMovies.size === filteredMovies.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={removeSelected}
                    disabled={selectedMovies.size === 0}
                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 size={16} className="inline mr-2" />
                    Remove ({selectedMovies.size})
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectionMode(false);
                      setSelectedMovies(new Set());
                    }}
                    className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {watchlistMovies.length > 0 && (
                    <>
                      <button
                        onClick={() => setIsSelectionMode(true)}
                        className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium hidden sm:block"
                      >
                        Select
                      </button>
                      <button
                        onClick={clearAllWatchlist}
                        className="px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 py-12">
        {watchlistMovies.length === 0 ? (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="w-32 h-32 rounded-full bg-purple-500/10 flex items-center justify-center mb-8">
              <Heart size={64} className="text-purple-500" strokeWidth={1.5} />
            </div>
            <h2 className="cinzel text-4xl font-bold mb-4">
              Your Watchlist is Empty
            </h2>
            <p className="text-gray-400 text-lg max-w-md mb-8">
              Start building your collection. Save movies you want to watch and keep track of your favorites.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold transition-colors"
            >
              Discover Movies
            </button>
          </div>
        ) : (
          <>
            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="stat-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Film size={20} className="text-purple-400" />
                  <span className="text-gray-400 text-sm">Total Movies</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>

              <div className="stat-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Star size={20} className="text-yellow-400" />
                  <span className="text-gray-400 text-sm">Avg Rating</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.avgRating}/10</p>
              </div>

              <div className="stat-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={20} className="text-blue-400" />
                  <span className="text-gray-400 text-sm">Watch Time</span>
                </div>
                <p className="text-3xl font-bold text-white">{totalHours}h+</p>
              </div>

              <div className="stat-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={20} className="text-green-400" />
                  <span className="text-gray-400 text-sm">Genres</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.genres}</p>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="glass-effect rounded-xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search your watchlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="flex-1 lg:flex-none px-4 py-3 rounded-lg bg-white/5 text-white focus:outline-none cursor-pointer min-w-[140px]"
                  >
                    <option value="all" className="bg-black">All Genres</option>
                    {allGenres.map(genre => (
                      <option key={genre} value={genre} className="bg-black">{genre}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 lg:flex-none px-4 py-3 rounded-lg bg-white/5 text-white focus:outline-none cursor-pointer min-w-[140px]"
                  >
                    <option value="added" className="bg-black">Recently Added</option>
                    <option value="rating" className="bg-black">Top Rated</option>
                    <option value="year" className="bg-black">Release Year</option>
                    <option value="title" className="bg-black">Alphabetical</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-white/5'
                      }`}
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-white/5'
                      }`}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS INFO */}
            {(searchQuery || filterGenre !== 'all') && (
              <div className="mb-6">
                <p className="text-gray-400">
                  Showing <span className="text-purple-400 font-semibold">{filteredMovies.length}</span> of {watchlistMovies.length} movies
                </p>
              </div>
            )}

            {/* MOVIES */}
            {filteredMovies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No movies match your filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMovies.map((movie) => (
                  <div key={movie.id} className="relative">
                    {isSelectionMode && (
                      <div className="absolute top-2 left-2 z-20 checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedMovies.has(movie.id)}
                          onChange={(e) => toggleSelectMovie(movie.id, e)}
                        />
                      </div>
                    )}
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="space-y-4">
                {filteredMovies.map((movie) => {
                  const genres = movie.genres?.split(',').map(g => g.trim()) || [];
                  return (
                    <div
                      key={movie.id}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                      className="list-view-card glass-effect rounded-xl p-6 flex gap-6 cursor-pointer"
                    >
                      {isSelectionMode && (
                        <div className="flex items-center checkbox-wrapper">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedMovies.has(movie.id)}
                            onChange={(e) => toggleSelectMovie(movie.id, e)}
                          />
                        </div>
                      )}
                      
                      {/* Poster */}
                      <div className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden">
                        <img
                          src={movie.imageUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-2 truncate">{movie.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span>{movie.duration}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-semibold">{movie.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {genres.slice(0, 4).map((genre, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-lg bg-white/5 text-sm text-gray-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {movie.synopsis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}