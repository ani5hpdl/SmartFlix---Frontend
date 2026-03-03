import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, Search, Star, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { deleteReviewById, getAllReviewsAdmin } from "../services/api";
import AdminNavbar from "../components/AdminNavbar";

const ITEMS_PER_PAGE = 10;

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState("all");
  const [spoilerFilter, setSpoilerFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getAllReviewsAdmin();
      if (response?.data?.success) {
        setReviews(response.data.data || []);
      } else {
        toast.error("Failed to fetch reviews");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review?.review_text?.toLowerCase().includes(query) ||
        review?.user?.name?.toLowerCase().includes(query) ||
        review?.user?.email?.toLowerCase().includes(query) ||
        review?.movie?.title?.toLowerCase().includes(query);

      const matchesRating =
        minRating === "all" || Number(review.rating) >= Number(minRating);

      const matchesSpoiler =
        spoilerFilter === "all" ||
        (spoilerFilter === "spoiler" && review.is_spoiler) ||
        (spoilerFilter === "non-spoiler" && !review.is_spoiler);

      return matchesSearch && matchesRating && matchesSpoiler;
    });
  }, [reviews, search, minRating, spoilerFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, minRating, spoilerFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedReviews = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredReviews.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReviews, safePage]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      setDeletingId(reviewId);
      const response = await deleteReviewById(reviewId);

      if (response?.data?.success) {
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
        toast.success("Review deleted");
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto space-y-6 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Review Management</h1>
            <p className="text-slate-400 mt-1">
              Admin dashboard to moderate user reviews on movies.
            </p>
          </div>
          <button
            onClick={fetchReviews}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by movie, user or review text..."
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500"
            >
              <option value="all">Any rating</option>
              <option value="5">5 stars</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
              <option value="1">1+ stars</option>
            </select>
            <select
              value={spoilerFilter}
              onChange={(event) => setSpoilerFilter(event.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 outline-none focus:border-purple-500"
            >
              <option value="all">All types</option>
              <option value="spoiler">Spoiler</option>
              <option value="non-spoiler">No spoiler</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr] gap-4 px-5 py-3 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <span>Review</span>
            <span>User</span>
            <span>Movie</span>
            <span>Meta</span>
            <span>Action</span>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-slate-400">Loading reviews...</div>
          ) : paginatedReviews.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400">
              No reviews found for current filters.
            </div>
          ) : (
            paginatedReviews.map((review) => (
              <div
                key={review.id}
                className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.6fr] gap-4 px-5 py-4 border-b border-slate-800/70"
              >
                <div>
                  <p className="text-sm text-slate-100 line-clamp-2">
                    {review.review_text || "No comment"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{review?.user?.name || "Unknown user"}</p>
                  <p className="text-xs text-slate-400">{review?.user?.email || "-"}</p>
                </div>
                <div className="text-sm text-slate-200">
                  {review?.movie?.title || "Unknown movie"}
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-amber-400">
                    <Star size={13} fill="currentColor" /> {review.rating}/5
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 ${
                      review.is_spoiler ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    <AlertTriangle size={13} />
                    {review.is_spoiler ? "Spoiler" : "Clean"}
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600/20 text-red-300 hover:bg-red-600/30 transition disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {deletingId === review.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400 inline-flex items-center gap-2">
            <MessageSquare size={15} />
            {filteredReviews.length} total reviews
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-slate-300">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
