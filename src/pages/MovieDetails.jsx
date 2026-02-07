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
  Film,
  Sparkles,
  Award,
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMovieById } from "../services/api";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    checkWatchlistStatus();
  }, [id]);

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
  const languages =
    movie.languages?.split(",").map((l) => l.trim()) || [];
  const ratingNum = parseFloat(movie.rating);
  const ratingPercent = (ratingNum / 10) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
        {/* Backdrop */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.backdropUrl || movie.imageUrl})`,
              filter: "brightness(0.35)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-12 md:pb-20 lg:pt-28">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Poster + rating */}
            <div className="w-full max-w-xs mx-auto lg:mx-0 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Rating badge */}
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

            {/* Details */}
            <div className="flex-1 space-y-6">
              {/* Meta chips */}
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

              {/* Title */}
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
                    <Star
                      size={16}
                      className="text-amber-400 fill-amber-400"
                    />
                    <span className="font-medium text-amber-400">
                      {movie.rating}
                    </span>
                    <span className="text-slate-400 text-xs">/10</span>
                  </div>
                </div>
              </div>

              {/* Genres */}
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

              {/* Synopsis */}
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Synopsis
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-slate-200 max-w-2xl">
                  {movie.synopsis || movie.description}
                </p>
              </div>

              {/* Actions */}
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
  <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
    {/* Top row: title + quick stats pill */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          Details
        </p>
        <h2 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
          {movie.title} · Info
        </h2>
      </div>
      <div className="inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-slate-400" />
          <span>{movie.duration}</span>
        </div>
        <span className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <Star className="text-amber-400 fill-amber-400" size={14} />
          <span className="font-semibold">{movie.rating}</span>
          <span className="text-slate-500 text-[11px]">/10</span>
        </div>
        <span className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-slate-400" />
          <span>{movie.votes} votes</span>
        </div>
      </div>
    </div>

    {/* Main layout: left = people, right = meta */}
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)] gap-8 lg:gap-12">
      {/* LEFT: People / credits */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Key people
          </h3>
          <p className="text-xs text-slate-400">
            The main creative voices behind this title.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/80 px-4 py-3 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-indigo-300">
                <Film size={18} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Director
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {movie.director || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-900/80 px-4 py-3 border border-slate-800">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-indigo-300">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Writers
                </p>
                <p className="text-sm font-medium text-slate-100 leading-snug">
                  {movie.writers || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/80 px-4 py-3 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-emerald-300">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Revenue
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {movie.revenue || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Meta / technical panel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
        {/* small label row */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-50">
            Technical details
          </h3>
          {movie.ageRating && (
            <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200">
              {movie.ageRating}
            </span>
          )}
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-800/80 pb-4">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Release date
            </span>
            <span className="text-slate-100 font-medium">
              {movie.releaseDate}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-800/80 pb-4">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Duration
            </span>
            <span className="text-slate-100 font-medium">
              {movie.duration}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 border-b border-slate-800/80 pb-4">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Languages
            </span>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-100"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-800/80 pb-4">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Total votes
            </span>
            <span className="text-slate-100 font-medium">
              {movie.votes} votes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <span className="text-xs uppercase tracking-wide text-slate-500">
              User rating
            </span>
            <div className="flex items-center gap-2">
              <Star
                className="text-amber-400 fill-amber-400"
                size={16}
              />
              <span className="text-slate-100 font-semibold">
                {movie.rating}
              </span>
              <span className="text-slate-500 text-xs">/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


    </div>
  );
}
