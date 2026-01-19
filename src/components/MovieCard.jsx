import { useEffect, useState } from "react";
import { Star, Heart, Play } from "lucide-react";

const parseGenres = (genre) => {
  if (!genre) return [];
  return genre.split(/[,|/]/).map(g => g.trim()).filter(Boolean);
};

const MovieCard = ({ movie }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    setIsInWatchlist(watchlist.includes(movie.id));
  }, [movie.id]);

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    const updated = watchlist.includes(movie.id)
      ? watchlist.filter(id => id !== movie.id)
      : [...watchlist, movie.id];

    localStorage.setItem("watchlist", JSON.stringify(updated));
    setIsInWatchlist(!isInWatchlist);
  };

  return (
    <div className="bg-gray-900 w-65 rounded-lg overflow-hidden cursor-pointer
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20
                    group">

      {/* Poster */}
      <div className="relative aspect-[2.5/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}

        <img
          src={movie.imageUrl || "/movieimgplaceholder"}
          alt={movie.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300
            ${imageLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"}`}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded-md flex items-center gap-1 z-10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-white text-xs font-semibold">
            {movie.rating}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700
                             text-white text-xs font-semibold px-4 py-2 rounded-full">
            <Play className="w-4 h-4 fill-white" />
            View Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {movie.title}
          </h3>

          <button
            onClick={toggleWatchlist}
            className={`transition-opacity shrink-0 mt-0.5
                        w-7 h-7 rounded-full bg-gray-800 hover:bg-red-500
                        flex items-center justify-center
                        ${
                            isInWatchlist
                            ? "opacity-100 hover:bg-white"
                            : "opacity-0 sm:group-hover:opacity-100"
                        }`}
            >

            <Heart
              className={`w-4 h-4 ${
                isInWatchlist
                  ? "fill-red-500 text-red-500 hover:text-white"
                  : "text-white"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center text-xs text-gray-400 gap-2">
          <span>{movie.year}</span>
          <span className="opacity-40">•</span>
          <span>{movie.duration}in</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {parseGenres(movie.genres).slice(0, 3).map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-full text-[10px]
                         bg-gray-800 text-gray-300"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
