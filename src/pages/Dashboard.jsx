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
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
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
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
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
                <span className="px-4 py-1.5 bg-yellow-400/20 border border-yellow-400/40 rounded-full text-yellow-400 text-xs font-semibold tracking-wider">
                  FEATURED
                </span>
                <span className="text-gray-400 text-sm">{movie?.year}</span>
              </div>

              <h1 className="cinzel text-6xl font-bold leading-tight text-white drop-shadow-2xl">
                {movie?.title}
              </h1>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={18} />
                  <span className="text-yellow-400 font-semibold text-lg">{movie?.rating}</span>
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
                <button className="flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/30">
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
            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
            <Icon className="text-yellow-400" size={24} />
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
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
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
        <aside className="w-82 min-h-screen bg-gradient-to-b from-[#0f1419] to-[#0a0e17] border-r border-white/5 p-8 fixed left-0 top-0">
          <div className="flex items-center gap-3 mb-12">
            <Film className="text-yellow-400" size={32} />
            <h1 className="cinzel text-yellow-400 text-3xl font-bold tracking-wider">CINÉMA</h1>
          </div>

          <nav className="space-y-2">
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
                className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl font-medium transition-colors group
                ${active
                    ? "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 glow-effect"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon size={20} className={active ? "text-yellow-400" : ""} />
                <span className="tracking-wide">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-12 glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-yellow-400" size={20} />
              <h3 className="font-semibold text-sm">Trending Now</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Discover what's hot in cinema this week. Curated picks just for you.
            </p>
          </div>

          {/* TOP RATED – SIDEBAR */}
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
              <h2 className="cinzel text-lg font-bold">Top Rated</h2>
            </div>

            {topRatedMovies.map((movie, index) => (
              <div
                key={movie.id}
                className="glass-effect rounded-xl p-3 hover-lift cursor-pointer group"
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <div
                      className="w-16 h-24 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${movie.imageUrl})` }}
                    />
                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold leading-tight group-hover:text-yellow-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400">{movie.year}</p>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={12} />
                      <span className="text-xs font-semibold text-yellow-400">
                        {movie.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap"
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
              <button className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
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
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
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
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/30"
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