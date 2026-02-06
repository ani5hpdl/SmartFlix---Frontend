import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Grid, Heart, Download, Users, Clock, Play,
  Star, TrendingUp, Film, Bell, User, 
  Sparkles, Globe, Tv, Calendar
} from "lucide-react";
import { getMoviesWithFilters } from "../services/api";
import { toast } from "react-hot-toast";
import MovieCard from '../components/MovieCard';

export default function UserDashboard() {
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genres: [], yearFrom: "", yearTo: "", rating: 0 });

  // ================= Helper Functions =================
  function filterMoviesByLanguage(movies, language) {
    return movies.filter(movie => {
      if (!movie.languages) return false;
      const languages = movie.languages.split(',').map(lang => lang.trim().toLowerCase());
      return languages.includes(language.toLowerCase());
    }).slice(0, 8);
  }

  function filterMoviesByType(movies, type) {
    return movies.filter(movie => movie.type?.toLowerCase() === type.toLowerCase());
  }

  function filterMoviesByGenre(movies, genre) {
    return movies.filter(movie => movie.genres?.toLowerCase().includes(genre.toLowerCase()));
  }

  function getNewReleases(movies) {
    const currentYear = new Date().getFullYear();
    return movies
      .filter(movie => parseInt(movie.year) >= currentYear - 1)
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, 8);
  }

  // ================= Memoized Filters =================
  const englishMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'english'), [allMovies]);
  const frenchMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'french'), [allMovies]);
  const spanishMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'spanish'), [allMovies]);
  const hindiMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'hindi'), [allMovies]);
  const germanMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'german'), [allMovies]);
  const japaneseMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'japanese'), [allMovies]);
  const koreanMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'korean'), [allMovies]);
  const mandarinMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'mandarin'), [allMovies]);
  const italianMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'italian'), [allMovies]);
  const teluguMovies = useMemo(() => filterMoviesByLanguage(allMovies, 'telugu'), [allMovies]);

  // Featured sections - just get first movie from each category
  const featuredMovie = useMemo(() => allMovies.filter(movie => parseFloat(movie.rating) > 8).slice(0, 1), [allMovies]);
  const actionFeatured = useMemo(() => filterMoviesByGenre(allMovies, 'action').slice(0, 1), [allMovies]);
  const dramaFeatured = useMemo(() => filterMoviesByGenre(allMovies, 'drama').slice(0, 1), [allMovies]);

  const topRatedMovies = useMemo(() => {
    return [...allMovies].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 5);
  }, [allMovies]);

  const popularSeries = useMemo(() => {
    const series = filterMoviesByType(allMovies, 'series');
    return series.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 8);
  }, [allMovies]);

  const newReleases = useMemo(() => getNewReleases(allMovies), [allMovies]);

  const trendingNow = useMemo(() => {
    return allMovies
      .filter(movie => parseFloat(movie.rating) > 7.5)
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))
      .slice(0, 8);
  }, [allMovies]);

  // ================= Fetch Movies =================
  const filterMovies = async () => {
    try {
      const data = {
        genres: filters.genres.join(","),
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        minRating: filters.rating,
        maxRating: 10
      };
      const response = await getMoviesWithFilters(data);
      if (response.data.success) {
        setAllMovies(response.data.data);
        setIsLoading(false);
        toast.success("Movies Fetched Successfully");
      } else {
        toast.error("Server Error!!");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(filterMovies, 200); // debounce
    return () => clearTimeout(timer);
  }, [filters]);

  // ================= Featured Section Component =================
  const FeaturedSection = React.memo(({ movies, title, height = "550px" }) => {
    if (!movies || movies.length === 0) {
      return (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full" />
            <h2 className="cinzel text-2xl font-bold">{title}</h2>
          </div>
          <div className="glass-effect rounded-xl p-8 text-center" style={{ height }}>
            <p className="text-gray-400">No movies available</p>
          </div>
        </section>
      );
    }

    const movie = movies[0]; // Just show first movie

    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full" />
          <h2 className="cinzel text-2xl font-bold">{title}</h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden" style={{ height }}>
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie?.backdropUrl || movie?.imageUrl || ''})`,
              backgroundColor: '#1a1a1a',
            }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-16 z-20">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-purple-600/20 border border-purple-600/40 rounded-full text-purple-600 text-xs font-semibold tracking-wider">
                  FEATURED
                </span>
                <span className="text-gray-400 text-sm">{movie?.year}</span>
              </div>

              <h1 className="cinzel text-6xl font-bold leading-tight text-white drop-shadow-2xl">
                {movie?.title}
              </h1>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-600 fill-yellow-600" size={18} />
                  <span className="text-yellow-600 font-semibold text-lg">{movie?.rating}</span>
                  <span className="text-gray-400">/10</span>
                </div>
                {movie?.duration && <span className="text-gray-300">{movie.duration}</span>}
                {movie?.ageRating && <span className="px-3 py-1 bg-white/10 rounded-lg text-gray-300">{movie.ageRating}</span>}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed max-w-xl line-clamp-3">
                {movie?.synopsis || movie?.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {movie?.genres?.split(',').slice(0, 3).map((genre, i) => (
                  <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">
                    {genre.trim()}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:text-black font-semibold rounded-xl hover:bg-purple-700 text-white transition-colors shadow-lg shadow-purple-600/30">
                  <Play size={20} fill="currentColor" />
                  Play Now
                </button>
                <button className="flex items-center gap-3 px-8 py-4 glass-effect text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                  <Heart size={20} />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  });

  FeaturedSection.displayName = 'FeaturedSection';

  // ================= Movie Section Component =================
  const MovieSection = ({ movies, title, icon: Icon, isLoading }) => {
    if (!movies && !isLoading) return null;

    return (
      <section className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full" />
            <Icon className="text-purple-600" size={24} />
            <h2 className="cinzel text-2xl font-bold">{title}</h2>
            {movies && <span className="text-gray-500 text-sm ml-2">({movies.length} movies)</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <p className="text-gray-400">Loading movies...</p>
          </div>
        ) : movies && movies.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-xl p-8 text-center">
            <p className="text-gray-400">No movies found in this category</p>
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px; /* Offset for sticky header */
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .hover-lift {
          transition: transform 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
        }
        
        .glow-effect {
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="flex">
        {/* ENHANCED SIDEBAR */}
<aside className="
  w-80
  h-screen
  bg-[#0b0f16]
  border-r border-white/5
  fixed left-0 top-0
  px-6 py-8
  overflow-y-auto sidebar-scroll
">

  {/* LOGO */}
  <div className="flex items-center gap-3 mb-12 shrink-0">
    <div className="w-10 h-10 rounded-xl bg-purple-600/15 flex items-center justify-center">
      <Film className="text-purple-500" size={22} />
    </div>
    <h1 className="cinzel text-purple-500 text-2xl font-bold tracking-widest">
      SMART-FLIX
    </h1>
  </div>

    {/* NAVIGATION */}
  <nav className="space-y-1">
    {[
      { label: "Discover", icon: Home, active: true },
      { label: "Browse", icon: Grid },
      { label: "My List", icon: Heart },
      { label: "Downloads", icon: Download },
      { label: "Community", icon: Users },
      { label: "History", icon: Clock },
    ].map(({ label, icon: Icon, active }) => (
      <button
        key={label}
        className={`
          group flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm font-medium transition
          ${active
            ? "bg-purple-600/10 text-purple-500"
            : "text-gray-400 hover:bg-white/5 hover:text-white"}
        `}
      >
        <Icon
          size={18}
          className={active ? "text-purple-500" : "text-gray-500 group-hover:text-white"}
        />
        <span className="tracking-wide">{label}</span>

        {/* Active Indicator */}
        {active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
        )}
      </button>
    ))}
  </nav>

  {/* TRENDING CARD */}
  <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] p-5">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp size={16} className="text-purple-500" />
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
        Trending
      </h3>
    </div>
    <p className="text-xs text-gray-400 leading-relaxed">
      Weekly curated cinema picks tailored to your taste.
    </p>
  </div>

  {/* TOP RATED – SCROLLABLE */}
  <div className="mt-10 flex-1 overflow-y-auto pr-1">
    <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0b0f16] py-2 z-10">
      <h2 className="cinzel text-sm font-bold tracking-widest text-gray-200">
        Top Rated
      </h2>
      <span className="text-xs text-gray-500">All time</span>
    </div>

    <div className="space-y-3 pb-6">
      {topRatedMovies.map((movie, index) => (
        <div
          key={movie.id}
          className="group flex gap-3 rounded-xl p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition cursor-pointer"
        >
          {/* Poster */}
          <div className="relative shrink-0">
            <div
              className="w-14 h-20 rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${movie.imageUrl})` }}
            />
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-black">
              {index + 1}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold leading-snug group-hover:text-purple-500 transition">
                {movie.title}
              </h3>
              <p className="text-xs text-gray-500">{movie.year}</p>
            </div>

            {/* ⭐ RATING */}
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={12} className="fill-yellow-400" />
              <span className="text-xs font-semibold">
                {movie.rating}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

</aside>



        {/* MAIN CONTENT */}
        <main className="ml-82 flex-1">
          {/* TOP HEADER */}
          <header className="glass-effect border-b border-white/5 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {[
                { label: "Trending", href: "#trending" },
                { label: "New Releases", href: "#new-releases" },
                { label: "English", href: "#english" },
                { label: "Action", href: "#action" },
                { label: "French", href: "#french" },
                { label: "Spanish", href: "#spanish" },
                { label: "German", href: "#german" },
                { label: "Mandarin", href: "#mandarin" },
                { label: "Italian", href: "#italian" },
                { label: "Explore All", href: "#explore-all" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-purple-600 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(item.href)?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4 ml-4">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0">
                <Bell size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-black" />
              </button>
            </div>
          </header>

          <div className="p-8">
            {/* HERO FEATURED */}
            <div id="featured">
              <FeaturedSection
                movies={featuredMovie}
                title="Featured Today"
                height="550px"
              />
            </div>

            {/* TRENDING NOW */}
            <div id="trending">
              <MovieSection
                movies={trendingNow}
                title="Trending Now"
                icon={Sparkles}
                isLoading={isLoading}
              />
            </div>

            {/* NEW RELEASES */}
            <div id="new-releases">
              <MovieSection
                movies={newReleases}
                title="New Releases"
                icon={Calendar}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 ENGLISH MOVIES */}
            <div id="english">
              <MovieSection
                movies={englishMovies}
                title="Top 10 English Movies"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* ACTION FEATURED */}
            <div id="action">
              <FeaturedSection
                movies={actionFeatured}
                title="Action Blockbusters"
                height="550px"
              />
            </div>

            {/* TOP 10 FRENCH MOVIES */}
            <div id="french">
              <MovieSection
                movies={frenchMovies}
                title="Top 10 French Cinema"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* POPULAR SERIES */}
            <div id="series">
              <MovieSection
                movies={popularSeries}
                title="Popular Series"
                icon={Tv}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 SPANISH MOVIES */}
            <div id="spanish">
              <MovieSection
                movies={spanishMovies}
                title="Top 10 Spanish Films"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 GERMAN MOVIES */}
            <div id="german">
              <MovieSection
                movies={germanMovies}
                title="Top 10 German Cinema"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* DRAMA FEATURED */}
            <div id="drama">
              <FeaturedSection
                movies={dramaFeatured}
                title="Award-Winning Dramas"
                height="550px"
              />
            </div>

            {/* TOP 10 JAPANESE MOVIES */}
            <div id="japanese">
              <MovieSection
                movies={japaneseMovies}
                title="Top 10 Japanese Cinema"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 KOREAN MOVIES */}
            <div id="korean">
              <MovieSection
                movies={koreanMovies}
                title="Top 10 Korean Films"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 HINDI MOVIES */}
            <div id="hindi">
              <MovieSection
                movies={hindiMovies}
                title="Top 10 Hindi Cinema"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 MANDARIN MOVIES */}
            <div id="mandarin">
              <MovieSection
                movies={mandarinMovies}
                title="Top 10 Mandarin Films"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 ITALIAN MOVIES */}
            <div id="italian">
              <MovieSection
                movies={italianMovies}
                title="Top 10 Italian Cinema"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* TOP 10 TELUGU MOVIES */}
            <div id="telugu">
              <MovieSection
                movies={teluguMovies}
                title="Top 10 Telugu Films"
                icon={Globe}
                isLoading={isLoading}
              />
            </div>

            {/* BROWSE ALL MOVIES */}
            <section id="explore-all" className="space-y-8 mt-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-purple-700 rounded-full" />
                  <h2 className="cinzel text-2xl font-bold">Explore All Cinema</h2>
                </div>
              </div>

              {/* Genre Filters */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {["All", "Action", "Drama", "Horror", "Comedy", "Thriller", "Sci-Fi", "Romance", "Mystery"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === "All") {
                        setFilters({ ...filters, genres: [] });
                      } else {
                        setFilters({ ...filters, genres: [cat] });
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors ${(cat === "All" && filters.genres.length === 0) || filters.genres.includes(cat)
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-black shadow-lg shadow-purple-600/30"
                        : "glass-effect text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Movie Grid */}
              <div className="grid grid-cols-4 gap-6">
                {allMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}