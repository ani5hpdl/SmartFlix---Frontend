import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  X,
  Share2,
  Download,
  Sparkles,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMovieById, getMoviesWithFilters } from "../services/api";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [suggestedMovies, setSuggestedMovies] = useState([]);

  useEffect(() => {
    fetchMovieDetails();
    checkWatchlistStatus();
  }, [id]);

  useEffect(() => {
    if (movie) {
      fetchSuggestedMovies();
    }
  }, [movie]);

  const fetchMovieDetails = async () => {
    try {
      const response = await getMovieById(id);
      if (response.data.success) {
        setMovie(response.data.data);
      } else {
        toast.error("Movie not found");
      }
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to load movie details");
      setIsLoading(false);
    }
  };

  const fetchSuggestedMovies = async () => {
    try {
      if (!movie) return;
      
      const currentGenres = movie.genres?.split(',').map(g => g.trim()) || [];
      const mainGenre = currentGenres[0];
      
      if (!mainGenre) return;

      const response = await getMoviesWithFilters({
        genres: mainGenre,
        yearFrom: "",
        yearTo: "",
        minRating: 6,
        maxRating: 10
      });

      if (response.data.success) {
        const filtered = response.data.data
          .filter(m => m.id !== parseInt(id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        
        setSuggestedMovies(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const checkWatchlistStatus = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setIsInWatchlist(watchlist.includes(parseInt(id, 10)));
  };

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const numericId = parseInt(id, 10);

    const updated = watchlist.includes(numericId)
      ? watchlist.filter((movieId) => movieId !== numericId)
      : [...watchlist, numericId];

    localStorage.setItem("watchlist", JSON.stringify(updated));
    setIsInWatchlist(!isInWatchlist);
    toast.success(
      isInWatchlist ? "Removed from watchlist" : "Added to watchlist"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm md:text-base">
            Loading movie details…
          </p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <X size={32} className="text-red-500" />
          </div>
          <p className="text-slate-300 text-lg font-medium">
            Movie not found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-slate-800 text-slate-50 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const genres = movie.genres?.split(",").map((g) => g.trim()) || [];
  const languages = movie.languages?.split(",").map((l) => l.trim()) || [];
  const ratingNum = parseFloat(movie.rating);
  const ratingPercent = (ratingNum / 10) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Top close button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
        aria-label="Close details"
      >
        <X size={20} />
      </button>

      {/* HERO */}
      <div className="relative">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.backdropUrl || movie.imageUrl})`,
              filter: "brightness(0.5)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-12 md:pb-20 lg:pt-28">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full max-w-xs mx-auto lg:mx-0 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-slate-800" />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#6366f1 ${ratingPercent}%, rgba(148,163,184,0.25) ${ratingPercent}%)`,
                    }}
                  />
                  <div className="absolute inset-1 rounded-full bg-slate-950 flex flex-col items-center justify-center text-xs">
                    <span className="text-lg font-semibold">
                      {movie.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">/10</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    User rating
                  </span>
                  <span className="text-sm text-slate-100">
                    {movie.votes} votes
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-indigo-300">
                  <Sparkles size={14} />
                  Featured
                </span>
                {movie.year && (
                  <span className="inline-flex rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
                    {movie.year}
                  </span>
                )}
                {movie.ageRating && (
                  <span className="inline-flex rounded-full bg-slate-900/80 px-3 py-1 text-slate-200">
                    {movie.ageRating}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-50">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-indigo-400" />
                    <span>{movie.duration}</span>
                  </div>
                  <span className="hidden sm:inline h-4 w-px bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <Eye size={16} className="text-indigo-400" />
                    <span>{movie.votes} votes</span>
                  </div>
                  <span className="hidden sm:inline h-4 w-px bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium text-amber-400">
                      {movie.rating}
                    </span>
                    <span className="text-slate-400 text-xs">/10</span>
                  </div>
                </div>
              </div>

              {!!genres.length && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Synopsis
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-slate-200 max-w-2xl">
                  {movie.synopsis || movie.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-slate-50 shadow-md shadow-indigo-500/30 hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition">
                  <Play size={18} fill="currentColor" />
                  <span>Watch now</span>
                </button>

                <button
                  onClick={toggleWatchlist}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    isInWatchlist
                      ? "border-indigo-400 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 focus-visible:ring-indigo-500"
                      : "border-slate-600 bg-slate-900/70 text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-500"
                  }`}
                >
                  {isInWatchlist ? <Check size={18} /> : <Plus size={18} />}
                  <span>{isInWatchlist ? "In watchlist" : "Add to list"}</span>
                </button>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
                  aria-label="Download"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <section className="border-t border-slate-900 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400">
                Details
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                {movie.title}
              </h2>
            </div>

            <div className="flex items-center gap-6 rounded-xl bg-slate-900/50 px-5 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Clock size={16} className="text-slate-400" />
                <span className="font-medium">{movie.duration}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-100">
                  {movie.rating}
                </span>
                <span className="text-xs text-slate-500">/10</span>
              </div>

              <div className="text-sm text-slate-400">
                {movie.votes} votes
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] uppercase tracking-widest text-slate-400">
                  Key people
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Main creative contributors.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900/60 px-5 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400">
                    Director
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-slate-100">
                    {movie.director || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 px-5 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400">
                    Writers
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-slate-100 leading-snug">
                    {movie.writers || "Unknown"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/60 px-5 py-4 backdrop-blur">
                  <p className="text-[11px] uppercase tracking-widest text-slate-400">
                    Revenue
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-slate-100">
                    {movie.revenue || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/60 p-6 backdrop-blur md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-50">
                  Technical details
                </h3>

                {movie.ageRating && (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-200">
                    {movie.ageRating}
                  </span>
                )}
              </div>

              <dl className="space-y-6 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[11px] uppercase tracking-widest text-slate-400">
                    Release date
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {movie.releaseDate}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[11px] uppercase tracking-widest text-slate-400">
                    Duration
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {movie.duration}
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
                    Languages
                  </dt>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-100"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[11px] uppercase tracking-widest text-slate-400">
                    Total votes
                  </dt>
                  <dd className="font-semibold text-slate-100">
                    {movie.votes}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[11px] uppercase tracking-widest text-slate-400">
                    User rating
                  </dt>
                  <dd className="flex items-center gap-2 font-semibold text-slate-100">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    {movie.rating}
                    <span className="text-xs text-slate-500">/10</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* SUGGESTIONS SECTION */}
      {suggestedMovies.length > 0 && (
        <section className="border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
                    You might also like
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Similar movies based on genre
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dash')}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  Browse all
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>s
              </div>
            </div>

            <div className="relative -mx-4 px-4">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {suggestedMovies.map((suggestedMovie) => {
                  const suggestedGenres = suggestedMovie.genres?.split(',').map(g => g.trim()) || [];
                  
                  return (
                    <div
                      key={suggestedMovie.id}
                      onClick={() => {
                        navigate(`/movie/${suggestedMovie.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="group flex-shrink-0 w-[200px] sm:w-[220px] cursor-pointer snap-start"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 mb-3">
                        <img
                          src={suggestedMovie.imageUrl}
                          alt={suggestedMovie.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-sm px-2 py-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold text-slate-50">
                            {suggestedMovie.rating}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 shadow-lg">
                            <Play size={16} fill="white" className="ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                          {suggestedMovie.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{suggestedMovie.year}</span>
                          <span>•</span>
                          <span>{suggestedMovie.duration}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {suggestedGenres.slice(0, 2).map((genre, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div
                  onClick={() => navigate('/dash')}
                  className="group flex-shrink-0 w-[200px] sm:w-[220px] cursor-pointer snap-start"
                >
                  <div className="flex aspect-[2/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-500/20 transition-colors">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-indigo-400 transition-colors">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">
                      Browse more
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:hidden">
              <button
                onClick={() => navigate('/dash')}
                className="w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 hover:bg-slate-700 transition-colors"
              >
                Browse all movies
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}