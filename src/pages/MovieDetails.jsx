import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock3,
  Eye,
  Globe2,
  Play,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { addReview, getMovieById, getMoviesWithFilters, updateReviewById } from "../services/api";

function parseTokenUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.userId ?? payload?.id ?? null;
  } catch {
    return null;
  }
}

function getInitials(name = "U") {
  const parts = String(name).trim().split(" ");
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: "",
    is_spoiler: false,
  });
  const reviewPanelRef = useRef(null);

  const fetchMovieDetails = useCallback(async () => {
    try {
      const response = await getMovieById(id);
      if (response?.data?.success) {
        setMovie(response.data.data);
      } else {
        toast.error("Movie not found");
        setMovie(null);
      }
    } catch {
      toast.error("Failed to load movie details");
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const checkWatchlistStatus = useCallback(() => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setIsInWatchlist(watchlist.includes(Number(id)));
  }, [id]);

  const fetchSuggestedMovies = useCallback(
    async (currentMovie) => {
      if (!currentMovie) return;
      const mainGenre = currentMovie?.genres?.split(",")?.[0]?.trim();
      if (!mainGenre) return;

      try {
        const response = await getMoviesWithFilters({
          genres: mainGenre,
          yearFrom: "",
          yearTo: "",
          minRating: 6,
          maxRating: 10,
        });

        if (response?.data?.success) {
          const pool = (response.data.data || []).filter((m) => m.id !== Number(id));
          const randomized = [...pool].sort(() => Math.random() - 0.5).slice(0, 7);
          setSuggestedMovies(randomized);
        }
      } catch {
        setSuggestedMovies([]);
      }
    },
    [id]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    fetchMovieDetails();
    checkWatchlistStatus();
  }, [fetchMovieDetails, checkWatchlistStatus]);

  useEffect(() => {
    if (movie) fetchSuggestedMovies(movie);
  }, [movie, fetchSuggestedMovies]);

  const toggleWatchlist = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const movieId = Number(id);
    const updated = watchlist.includes(movieId)
      ? watchlist.filter((item) => item !== movieId)
      : [...watchlist, movieId];

    localStorage.setItem("watchlist", JSON.stringify(updated));
    setIsInWatchlist((prev) => !prev);
    toast.success(isInWatchlist ? "Removed from watchlist" : "Added to watchlist");
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    const isUser = parseTokenUserId();

    if (!isUser) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!reviewForm.rating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const payload = {
        rating: Number(reviewForm.rating),
        review_text: reviewForm.review_text.trim(),
        is_spoiler: reviewForm.is_spoiler,
      };

      const response = myExistingReview
        ? await updateReviewById(myExistingReview.id, payload)
        : await addReview({
            ...payload,
            movie_id: Number(id),
          });

      if (response?.data?.success) {
        toast.success(myExistingReview ? "Review updated" : "Review submitted");
        if (!myExistingReview) {
          setReviewForm({ rating: 5, review_text: "", is_spoiler: false });
        }
        fetchMovieDetails();
      } else {
        toast.error(
          response?.data?.message ||
            (myExistingReview ? "Failed to update review" : "Failed to submit review")
        );
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("You already reviewed this movie. Edit your review below.");
        fetchMovieDetails();
        reviewPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        toast.error(
          error?.response?.data?.message ||
            (myExistingReview ? "Failed to update review" : "Failed to submit review")
        );
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const genres = useMemo(
    () => String(movie?.genres || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    [movie?.genres]
  );

  const languages = useMemo(
    () => String(movie?.languages || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    [movie?.languages]
  );

  const reviews = useMemo(() => movie?.reviews || [], [movie?.reviews]);
  const currentUserId = parseTokenUserId();
  const myExistingReview = useMemo(
    () => reviews.find((review) => Number(review?.user?.id) === Number(currentUserId)),
    [reviews, currentUserId]
  );
  const averageReviewRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const toggleSpoilerReveal = (reviewId) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  useEffect(() => {
    if (!myExistingReview) return;
    setReviewForm({
      rating: Number(myExistingReview.rating || 5),
      review_text: myExistingReview.review_text || "",
      is_spoiler: Boolean(myExistingReview.is_spoiler),
    });
  }, [myExistingReview]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080e19] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin mx-auto" />
          <p className="text-slate-300">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#080e19] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Movie not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080e19] text-slate-100">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/40 via-[#080e19]/85 to-[#080e19]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_40%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
            <div>
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                <img
                  src={movie.imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Movie score</p>
                  <p className="mt-1 text-xl font-semibold text-cyan-300">{movie.rating || "0.0"}/10</p>
                </div>
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">User score</p>
                  <p className="mt-1 text-xl font-semibold text-amber-300">{averageReviewRating}/5</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
                  <Sparkles size={13} />
                  Featured
                </span>
                {movie.ageRating && (
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-900/80 border border-white/10">
                    {movie.ageRating}
                  </span>
                )}
                {movie.year && (
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-900/80 border border-white/10">
                    {movie.year}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
                  {movie.title}
                </h1>
                <p className="mt-3 text-slate-300 max-w-3xl leading-relaxed">
                  {movie.synopsis || "No synopsis available."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] text-slate-400">Duration</p>
                  <p className="mt-1 text-sm font-medium flex items-center gap-2">
                    <Clock3 size={14} className="text-cyan-300" />
                    {movie.duration || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] text-slate-400">Release</p>
                  <p className="mt-1 text-sm font-medium flex items-center gap-2">
                    <Calendar size={14} className="text-cyan-300" />
                    {movie.releaseDate || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] text-slate-400">Votes</p>
                  <p className="mt-1 text-sm font-medium flex items-center gap-2">
                    <Eye size={14} className="text-cyan-300" />
                    {movie.votes || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0f1628]/80 border border-white/10 p-3">
                  <p className="text-[11px] text-slate-400">Language</p>
                  <p className="mt-1 text-sm font-medium flex items-center gap-2">
                    <Globe2 size={14} className="text-cyan-300" />
                    {languages[0] || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-3 py-1 rounded-full bg-slate-900/70 border border-white/10 text-slate-200"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition">
                  <Play size={16} fill="currentColor" />
                  Watch now
                </button>
                <button
                  onClick={toggleWatchlist}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border transition ${
                    isInWatchlist
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-200"
                      : "bg-slate-900/70 border-white/10 hover:bg-slate-800/80"
                  }`}
                >
                  {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
                  {isInWatchlist ? "In watchlist" : "Add to watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <div className="rounded-2xl bg-[#0f1628]/80 border border-white/10 p-5">
            <h2 className="text-xl font-semibold">Creative Team</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase">Director</p>
                <p className="mt-1">{movie.director || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase">Writers</p>
                <p className="mt-1">{movie.writers || "Unknown"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase">Revenue</p>
                <p className="mt-1">{movie.revenue || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0f1628]/80 border border-white/10 p-5">
            <h2 className="text-xl font-semibold">Languages</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.length ? (
                languages.map((language) => (
                  <span
                    key={language}
                    className="text-xs px-3 py-1 rounded-full bg-slate-900/70 border border-white/10"
                  >
                    {language}
                  </span>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No language info.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <div ref={reviewPanelRef} className="xl:sticky xl:top-6 h-fit rounded-2xl bg-[#0f1628]/80 border border-white/10 p-5">
            <h2 className="text-xl font-semibold">Write a Review</h2>
            <p className="text-slate-400 text-sm mt-1">Rate this movie and share feedback.</p>
            {myExistingReview && (
              <div className="mt-4 rounded-lg border border-amber-300/30 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-200">
                  You already reviewed this movie. Submitting now will overwrite your previous review.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((prev) => ({ ...prev, rating: Number(event.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-cyan-400/60"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Bad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Your review</label>
                <textarea
                  value={reviewForm.review_text}
                  onChange={(event) =>
                    setReviewForm((prev) => ({ ...prev, review_text: event.target.value }))
                  }
                  rows={5}
                  placeholder="What did you like or dislike?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-cyan-400/60"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={reviewForm.is_spoiler}
                  onChange={(event) =>
                    setReviewForm((prev) => ({ ...prev, is_spoiler: event.target.checked }))
                  }
                />
                Contains spoiler
              </label>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full px-4 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition disabled:opacity-60"
              >
                {isSubmittingReview
                  ? myExistingReview
                    ? "Updating..."
                    : "Submitting..."
                  : myExistingReview
                  ? "Update Review"
                  : "Submit Review"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-[#0f1628]/80 border border-white/10 p-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold">Audience Reviews</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {reviews.length} reviews - Avg {averageReviewRating}/5
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {!reviews.length ? (
                <p className="text-sm text-slate-400">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-cyan-500/20 text-cyan-200 flex items-center justify-center text-xs font-semibold">
                          {getInitials(review?.user?.name || "User")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {review?.user?.name || "Anonymous User"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-amber-300 text-sm">
                        <Star size={14} fill="currentColor" />
                        {review.rating}/5
                      </span>
                    </div>

                    {review.is_spoiler && !revealedSpoilers[review.id] ? (
                      <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
                        <p className="text-xs font-medium text-red-300 uppercase tracking-wide">
                          Spoiler Warning
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          This review contains spoilers. Reveal only if you want details.
                        </p>
                        <button
                          onClick={() => toggleSpoilerReveal(review.id)}
                          className="mt-3 text-sm px-3 py-1.5 rounded-md bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition"
                        >
                          Reveal spoiler
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mt-3 text-sm text-slate-200 leading-relaxed">
                          {review.review_text || "No comment provided."}
                        </p>
                        {review.is_spoiler && (
                          <button
                            onClick={() => toggleSpoilerReveal(review.id)}
                            className="mt-3 inline-block text-xs px-2 py-1 rounded-md bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/25 transition"
                          >
                            Hide spoiler
                          </button>
                        )}
                      </>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {!!suggestedMovies.length && (
        <section className="border-t border-white/10 bg-[#0b1324]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold">You Might Also Like</h2>
                <p className="text-slate-400 text-sm mt-1">More titles from a similar genre.</p>
              </div>
              <button
                onClick={() => navigate("/dash")}
                className="text-sm px-3 py-2 rounded-lg bg-slate-900/70 border border-white/10 hover:bg-slate-800/80 transition"
              >
                Browse all
              </button>
            </div>

            <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {suggestedMovies.map((suggestedMovie) => (
                <button
                  key={suggestedMovie.id}
                  onClick={() => navigate(`/movie/${suggestedMovie.id}`)}
                  className="text-left rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 hover:border-cyan-400/50 hover:-translate-y-0.5 transition"
                >
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={suggestedMovie.imageUrl}
                      alt={suggestedMovie.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{suggestedMovie.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {suggestedMovie.year || "-"} | {suggestedMovie.duration || "-"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
