import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Mail,
  MessageSquare,
  Shield,
  Star,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getMe, getReviewsByUser } from "../services/api";

function decodeTokenFallback() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload?.userId ?? payload?.id,
      role: payload?.role || "user",
    };
  } catch {
    return null;
  }
}

function initialsFromName(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMe();
        if (!response?.data?.success) throw new Error("Could not load profile");

        const userData = response.data.data;
        setProfile(userData);

        try {
          const reviewsRes = await getReviewsByUser(userData.id);
          if (reviewsRes?.data?.success) {
            setReviews(reviewsRes.data.data || []);
          }
        } catch {
          setReviews([]);
        }
      } catch (error) {
        const fallback = decodeTokenFallback();
        if (fallback) {
          setProfile({
            id: fallback.id,
            role: fallback.role,
            name: "User",
            email: "Email from getMe",
            isEmailVerified: false,
            isActive: true,
          });
        } else {
          toast.error(error?.response?.data?.message || "Please login again");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const contribution = useMemo(() => {
    if (!reviews.length) {
      return {
        totalReviews: 0,
        averageRating: "0.0",
        spoilerCount: 0,
        uniqueMovies: 0,
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    const spoilerCount = reviews.filter((review) => review.is_spoiler).length;
    const uniqueMovies = new Set(reviews.map((review) => review?.movie?.id || review.movie_id)).size;

    return {
      totalReviews,
      averageRating: (totalRating / totalReviews).toFixed(1),
      spoilerCount,
      uniqueMovies,
    };
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#110d22] via-[#0f1524] to-[#0b0f16] p-6 md:p-8 shadow-2xl shadow-black/35">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl font-bold">
              {initialsFromName(profile?.name)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {profile?.name || "User Profile"}
              </h1>
              <p className="text-slate-300 mt-1">{profile?.email || "No email found"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 border border-purple-400/30 text-purple-300">
                  {profile?.role || "user"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs border ${
                    profile?.isActive
                      ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
                      : "bg-red-500/15 border-red-400/30 text-red-300"
                  }`}
                >
                  {profile?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Reviews Written</p>
            <p className="text-2xl font-semibold mt-2 text-purple-300">{contribution.totalReviews}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Avg Rating Given</p>
            <p className="text-2xl font-semibold mt-2 text-amber-300">{contribution.averageRating}/5</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Movies Reviewed</p>
            <p className="text-2xl font-semibold mt-2 text-indigo-300">{contribution.uniqueMovies}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Spoiler Reviews</p>
            <p className="text-2xl font-semibold mt-2 text-rose-300">{contribution.spoilerCount}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-5">
            <h2 className="text-lg font-semibold mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-300">
                <User size={16} className="text-purple-400" />
                User ID: {profile?.id ?? "N/A"}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Mail size={16} className="text-purple-400" />
                {profile?.email || "No email"}
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Shield size={16} className="text-purple-400" />
                Role: {profile?.role || "user"}
              </p>
              {profile?.createdAt && (
                <p className="flex items-center gap-2 text-slate-300">
                  <CalendarDays size={16} className="text-purple-400" />
                  Joined: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b0f16] p-5">
            <h2 className="text-lg font-semibold mb-4">Verification</h2>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <BadgeCheck size={16} className={profile?.isEmailVerified ? "text-emerald-400" : "text-amber-400"} />
                <span className={profile?.isEmailVerified ? "text-emerald-300" : "text-amber-300"}>
                  {profile?.isEmailVerified ? "Email verified" : "Email not verified"}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <MessageSquare size={16} className="text-purple-400" />
                You have contributed {contribution.totalReviews} reviews.
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                Your average rating style: {contribution.averageRating}/5
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0b0f16] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Review Contributions</h2>
            <span className="text-sm text-slate-400">{reviews.length} total</span>
          </div>

          <div className="mt-4 space-y-3">
            {!reviews.length ? (
              <p className="text-sm text-slate-400">No review contributions yet.</p>
            ) : (
              reviews.slice(0, 6).map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-100">
                      {review?.movie?.title || "Unknown movie"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-amber-300 text-sm">
                      <Star size={14} className="fill-amber-300" />
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                    {review.review_text || "No comment provided."}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(review.createdAt).toLocaleString()}</span>
                    {review.is_spoiler && (
                      <span className="px-2 py-0.5 rounded bg-red-500/15 border border-red-400/30 text-red-300">
                        Spoiler
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
