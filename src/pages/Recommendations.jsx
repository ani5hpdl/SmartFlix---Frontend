import { useEffect, useMemo, useState } from "react";
import { Clapperboard, HeartHandshake, Loader2, Sparkles, Timer, UsersRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllMovies } from "../services/api";
import MovieCard from "../components/MovieCard";

const moods = [
  { id: "happy", label: "Happy", genres: ["comedy", "family", "animation", "music"] },
  { id: "sad", label: "Sad", genres: ["drama", "romance"] },
  { id: "low", label: "Mood Off", genres: ["comedy", "adventure", "fantasy"] },
  { id: "romantic", label: "Romantic", genres: ["romance", "drama"] },
  { id: "horror", label: "Horror Mood", genres: ["horror", "thriller", "mystery"] },
  { id: "excited", label: "Need Energy", genres: ["action", "adventure", "science fiction", "sci-fi"] },
];

const companyGroups = [
  { id: "alone", label: "No one (Alone)", boostGenres: ["drama", "mystery", "thriller", "documentary"] },
  { id: "family", label: "Family", boostGenres: ["family", "animation", "adventure", "comedy"] },
  { id: "siblings", label: "Brothers / Sisters", boostGenres: ["action", "comedy", "fantasy"] },
  { id: "friends", label: "Friends", boostGenres: ["comedy", "action", "horror"] },
  { id: "partner", label: "Girlfriend / Boyfriend", boostGenres: ["romance", "drama", "comedy"] },
];

const viewingIntent = [
  { id: "any", label: "Anything" },
  { id: "movie", label: "Movie Night" },
  { id: "series", label: "Series Binge" },
];

const runtimeChoices = [
  { id: "any", label: "Any Length" },
  { id: "short", label: "Short (< 110m)" },
  { id: "medium", label: "Standard (110-140m)" },
  { id: "long", label: "Long (140m+)" },
];

const parseGenres = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/[,|/]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseDurationMinutes = (value) => {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export default function Recommendations() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("any");
  const [selectedRuntime, setSelectedRuntime] = useState("any");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await getAllMovies();
        if (response?.data?.success) {
          setAllMovies(response.data.data || []);
          return;
        }
        toast.error("Could not load movies for recommendations");
      } catch {
        toast.error("Could not load movies for recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const recommendations = useMemo(() => {
    if (!selectedMood || !selectedCompany) return [];

    const mood = moods.find((item) => item.id === selectedMood);
    const company = companyGroups.find((item) => item.id === selectedCompany);
    if (!mood || !company) return [];

    return allMovies
      .map((movie) => {
        const genres = parseGenres(movie.genres);
        const movieType = String(movie.type || "").toLowerCase();
        const runtime = parseDurationMinutes(movie.duration);

        if (selectedIntent === "movie" && movieType === "series") return null;
        if (selectedIntent === "series" && movieType !== "series") return null;

        if (selectedRuntime === "short" && runtime >= 110) return null;
        if (selectedRuntime === "medium" && (runtime < 110 || runtime > 140)) return null;
        if (selectedRuntime === "long" && runtime < 140) return null;

        if (company.id === "family" && genres.some((genre) => ["horror", "thriller"].includes(genre))) {
          return null;
        }

        let score = Number(movie.rating || 0);

        for (const genre of genres) {
          if (mood.genres.includes(genre)) score += 2.4;
          if (company.boostGenres.includes(genre)) score += 1.6;
        }

        if (company.id === "partner" && genres.includes("romance")) score += 2;
        if (company.id === "friends" && genres.includes("comedy")) score += 1.5;
        if (company.id === "alone" && genres.includes("mystery")) score += 1.2;

        return { ...movie, _score: score };
      })
      .filter(Boolean)
      .sort((a, b) => b._score - a._score)
      .slice(0, 24);
  }, [allMovies, selectedMood, selectedCompany, selectedIntent, selectedRuntime]);

  const answeredCount = [selectedMood, selectedCompany].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white px-4 md:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">Recommend Me</h1>
              <p className="text-slate-400 text-sm">Answer a few quick questions and get tailored picks.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0f1422] p-5 md:p-6 space-y-6">
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Question Progress</span>
              <span>{answeredCount}/2 required</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                style={{ width: `${(answeredCount / 2) * 100}%` }}
              />
            </div>
          </div>

          <QuestionGroup
            step="01"
            title="How are you feeling now?"
            options={moods}
            selected={selectedMood}
            onSelect={setSelectedMood}
            icon={<HeartHandshake size={16} />}
          />

          <QuestionGroup
            step="02"
            title="Who is watching with you?"
            options={companyGroups}
            selected={selectedCompany}
            onSelect={setSelectedCompany}
            icon={<UsersRound size={16} />}
          />

          <QuestionGroup
            step="03"
            title="What do you want to watch?"
            options={viewingIntent}
            selected={selectedIntent}
            onSelect={setSelectedIntent}
            icon={<Clapperboard size={16} />}
          />

          <QuestionGroup
            step="04"
            title="Preferred runtime?"
            options={runtimeChoices}
            selected={selectedRuntime}
            onSelect={setSelectedRuntime}
            icon={<Timer size={16} />}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold">
              Your Recommendations
            </h2>
            <p className="text-sm text-slate-400">
              {answeredCount < 2
                ? "Select mood and company to see recommendations"
                : `${recommendations.length} matches`}
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 py-16 text-center text-slate-300">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              Loading movies...
            </div>
          ) : answeredCount < 2 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/30 py-16 px-6 text-center text-slate-300">
              Pick your mood and who is with you to unlock personalized results.
            </div>
          ) : recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900/30 py-16 px-6 text-center text-slate-300">
              No close match found. Try changing your mood, company, or runtime choice.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function QuestionGroup({ step, title, options, selected, onSelect, icon }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/30 p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg border border-purple-500/40 bg-purple-600/20 flex items-center justify-center text-purple-200">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-purple-300">Step {step}</p>
          <h3 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => {
          const isActive = option.id === selected;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`group text-left px-4 py-3 rounded-xl text-sm border transition-all duration-200 ${
                isActive
                  ? "border-purple-400/70 bg-purple-600/20 text-purple-100 shadow-lg shadow-purple-900/20 scale-[1.02]"
                  : "border-white/10 bg-slate-900/40 text-slate-300 hover:bg-slate-800/70 hover:text-white hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{option.label}</span>
                <span
                  className={`w-3 h-3 rounded-full border ${
                    isActive
                      ? "bg-purple-400 border-purple-300"
                      : "border-slate-600 group-hover:border-slate-400"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
