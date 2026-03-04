import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock3,
  Film,
  Grid3X3,
  Heart,
  LayoutList,
  Search,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMoviesWithFilters } from "../services/api";

const readWatchlistIds = () => {
  const parsed = JSON.parse(localStorage.getItem("watchlist") || "[]");
  return Array.isArray(parsed) ? parsed : [];
};

export default function Watchlist() {
  const navigate = useNavigate();

  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [sortBy, setSortBy] = useState("added");
  const [viewMode, setViewMode] = useState("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState(new Set());

  const fetchWatchlistMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      const watchlistIds = readWatchlistIds();

      if (watchlistIds.length === 0) {
        setWatchlistMovies([]);
        return;
      }

      const response = await getMoviesWithFilters({
        genres: "",
        yearFrom: "",
        yearTo: "",
        minRating: 0,
        maxRating: 10,
      });

      if (!response?.data?.success) {
        throw new Error("Unable to fetch watchlist movies");
      }

      const movies = response.data.data || [];
      const orderedMap = new Map(movies.map((movie) => [movie.id, movie]));
      const orderedWatchlistMovies = watchlistIds
        .map((movieId) => orderedMap.get(movieId))
        .filter(Boolean);

      setWatchlistMovies(orderedWatchlistMovies);
    } catch {
      toast.error("Failed to load watchlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlistMovies();
  }, [fetchWatchlistMovies]);

  useEffect(() => {
    const refresh = () => fetchWatchlistMovies();
    window.addEventListener("storage", refresh);
    window.addEventListener("watchlistUpdated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("watchlistUpdated", refresh);
    };
  }, [fetchWatchlistMovies]);

  const allGenres = useMemo(() => {
    return [
      ...new Set(
        watchlistMovies.flatMap((movie) =>
          String(movie.genres || "")
            .split(",")
            .map((genre) => genre.trim())
            .filter(Boolean)
        )
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [watchlistMovies]);

  const filteredMovies = useMemo(() => {
    return watchlistMovies
      .filter((movie) => {
        const title = String(movie.title || "").toLowerCase();
        const matchesSearch = title.includes(searchQuery.toLowerCase());
        const matchesGenre =
          filterGenre === "all" ||
          String(movie.genres || "").toLowerCase().includes(filterGenre.toLowerCase());
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
        if (sortBy === "year") return Number(b.year || 0) - Number(a.year || 0);
        if (sortBy === "title") return String(a.title || "").localeCompare(String(b.title || ""));
        return 0;
      });
  }, [watchlistMovies, searchQuery, filterGenre, sortBy]);

  const stats = useMemo(() => {
    const total = watchlistMovies.length;
    const averageRating = total
      ? (watchlistMovies.reduce((sum, movie) => sum + Number(movie.rating || 0), 0) / total).toFixed(1)
      : "0.0";
    const totalMinutes = watchlistMovies.reduce((sum, movie) => {
      const numericDuration = Number.parseInt(String(movie.duration || ""), 10);
      return sum + (Number.isNaN(numericDuration) ? 0 : numericDuration);
    }, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    return { total, averageRating, totalHours, genres: allGenres.length };
  }, [watchlistMovies, allGenres.length]);

  const toggleSelectMovie = (movieId) => {
    setSelectedMovieIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedMovieIds(new Set());
  };

  const toggleSelectAllVisible = () => {
    if (selectedMovieIds.size === filteredMovies.length) {
      setSelectedMovieIds(new Set());
    } else {
      setSelectedMovieIds(new Set(filteredMovies.map((movie) => movie.id)));
    }
  };

  const persistWatchlistIds = (ids) => {
    localStorage.setItem("watchlist", JSON.stringify(ids));
    window.dispatchEvent(new Event("watchlistUpdated"));
  };

  const removeSelected = () => {
    if (selectedMovieIds.size === 0) return;
    if (!window.confirm(`Remove ${selectedMovieIds.size} selected item(s) from watchlist?`)) return;

    const remainingIds = readWatchlistIds().filter((id) => !selectedMovieIds.has(id));
    persistWatchlistIds(remainingIds);
    setWatchlistMovies((prev) => prev.filter((movie) => !selectedMovieIds.has(movie.id)));
    clearSelection();
    toast.success("Selected movies removed");
  };

  const clearWatchlist = () => {
    if (!window.confirm("Clear your entire watchlist?")) return;
    persistWatchlistIds([]);
    setWatchlistMovies([]);
    clearSelection();
    toast.success("Watchlist cleared");
  };

  const removeOne = (movieId) => {
    const remainingIds = readWatchlistIds().filter((id) => id !== movieId);
    persistWatchlistIds(remainingIds);
    setWatchlistMovies((prev) => prev.filter((movie) => movie.id !== movieId));
    setSelectedMovieIds((prev) => {
      const next = new Set(prev);
      next.delete(movieId);
      return next;
    });
    toast.success("Removed from watchlist");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0e17]/85 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">My Watchlist</h1>
              <p className="text-sm text-slate-400">
                {watchlistMovies.length} movies saved
                {selectedMovieIds.size > 0 ? ` | ${selectedMovieIds.size} selected` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectionMode ? (
              <>
                <button
                  onClick={toggleSelectAllVisible}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                >
                  {selectedMovieIds.size === filteredMovies.length ? "Deselect All" : "Select All"}
                </button>
                <button
                  onClick={removeSelected}
                  disabled={selectedMovieIds.size === 0}
                  className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 text-sm disabled:opacity-50"
                >
                  Remove Selected
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              watchlistMovies.length > 0 && (
                <>
                  <button
                    onClick={() => setSelectionMode(true)}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                  >
                    Select
                  </button>
                  <button
                    onClick={clearWatchlist}
                    className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 text-sm"
                  >
                    Clear All
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {watchlistMovies.length === 0 ? (
          <section className="min-h-[60vh] rounded-3xl border border-white/10 bg-gradient-to-br from-[#100e1f] to-[#0b0f16] flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center mb-5">
              <Heart size={36} className="text-purple-400" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Your watchlist is empty</h2>
            <p className="text-slate-400 mt-3 max-w-md">
              Save titles from movie pages and build your personal watch collection.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition font-semibold"
            >
              Browse Movies
            </button>
          </section>
        ) : (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Film size={17} className="text-purple-300" />} label="Saved Movies" value={stats.total} />
              <StatCard icon={<Star size={17} className="text-amber-300" />} label="Average Rating" value={`${stats.averageRating}/10`} />
              <StatCard icon={<Clock3 size={17} className="text-indigo-300" />} label="Watch Time" value={`${stats.totalHours}h+`} />
              <StatCard icon={<Trophy size={17} className="text-emerald-300" />} label="Genres Covered" value={stats.genres} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0b0f16] p-4 md:p-5">
              <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search within watchlist..."
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-purple-500/70 outline-none"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <select
                    value={filterGenre}
                    onChange={(event) => setFilterGenre(event.target.value)}
                    className="px-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-purple-500/70 outline-none min-w-[150px]"
                  >
                    <option value="all">All Genres</option>
                    {allGenres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="px-3 py-2.5 rounded-lg bg-slate-900 border border-white/10 focus:border-purple-500/70 outline-none min-w-[150px]"
                  >
                    <option value="added">Recently Added</option>
                    <option value="rating">Top Rated</option>
                    <option value="year">Release Year</option>
                    <option value="title">Alphabetical</option>
                  </select>

                  <div className="p-1 rounded-lg bg-slate-900 border border-white/10 flex items-center">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`w-9 h-9 rounded-md flex items-center justify-center ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`w-9 h-9 rounded-md flex items-center justify-center ${viewMode === "list" ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <LayoutList size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {filteredMovies.length === 0 ? (
              <section className="rounded-2xl border border-white/10 bg-[#0b0f16] py-16 text-center text-slate-400">
                No movies match the current filters.
              </section>
            ) : viewMode === "grid" ? (
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMovies.map((movie) => {
                  const selected = selectedMovieIds.has(movie.id);
                  return (
                    <article
                      key={movie.id}
                      className="rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 hover:border-purple-500/50 transition"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
                        <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                        {selectionMode && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleSelectMovie(movie.id);
                            }}
                            className={`absolute top-2 left-2 w-6 h-6 rounded-md border flex items-center justify-center ${
                              selected ? "bg-purple-600 border-purple-500" : "bg-black/50 border-white/30"
                            }`}
                          >
                            {selected && <Check size={14} />}
                          </button>
                        )}
                      </div>

                      <div className="p-3 space-y-1">
                        <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
                        <p className="text-xs text-slate-400">
                          {movie.year || "-"} | {movie.duration || "-"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-amber-300 text-xs">
                            <Star size={12} className="fill-amber-300" />
                            {movie.rating || "0"}
                          </span>
                          {!selectionMode && (
                            <button
                              onClick={() => removeOne(movie.id)}
                              className="text-xs text-red-300 hover:text-red-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="space-y-3">
                {filteredMovies.map((movie) => {
                  const selected = selectedMovieIds.has(movie.id);
                  const genres = String(movie.genres || "")
                    .split(",")
                    .map((genre) => genre.trim())
                    .filter(Boolean);

                  return (
                    <article
                      key={movie.id}
                      className="rounded-xl border border-white/10 bg-[#0b0f16] p-4 hover:bg-[#111624] transition"
                    >
                      <div className="flex gap-4">
                        {selectionMode && (
                          <button
                            onClick={() => toggleSelectMovie(movie.id)}
                            className={`w-6 h-6 mt-1 rounded-md border flex items-center justify-center ${
                              selected ? "bg-purple-600 border-purple-500" : "bg-transparent border-white/30"
                            }`}
                          >
                            {selected && <Check size={14} />}
                          </button>
                        )}

                        <img
                          onClick={() => navigate(`/movie/${movie.id}`)}
                          src={movie.imageUrl}
                          alt={movie.title}
                          className="w-20 h-28 rounded-lg object-cover cursor-pointer"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold leading-tight">{movie.title}</h3>
                              <p className="text-sm text-slate-400 mt-1">
                                {movie.year || "-"} | {movie.duration || "-"}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-amber-300 text-sm">
                              <Star size={14} className="fill-amber-300" />
                              {movie.rating || "0"}/10
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {genres.slice(0, 4).map((genre) => (
                              <span key={genre} className="px-2 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-slate-300">
                                {genre}
                              </span>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-slate-400 line-clamp-1">
                              {movie.synopsis || "No synopsis available."}
                            </p>
                            {!selectionMode && (
                              <button
                                onClick={() => removeOne(movie.id)}
                                className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200 ml-3"
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-transparent p-4">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-400/20">
        {icon}
      </div>
      <p className="text-xs text-slate-400 mt-3 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </article>
  );
}

