import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import toast from 'react-hot-toast';
import { getAllMovies, getMoviesWithFilters } from '../services/api';

// Main Component
const UserDashboard = () => {
  const [filters, setFilters] = useState({
    genres: [],
    yearFrom: '',
    yearTo: '',
    rating: 0,
    runtime: ''
  });
  const [allMovies,setAllMovies] = useState([]);

  const filterMovies = async() => {
    try {
      const data = {
        genres : filters.genres,
        year : filters.yearTo,
        minRating : filters.rating,
        maxRating : 10
      }
        const response = await getMoviesWithFilters(data);
        if(response.data.success){
          setAllMovies(response.data.data);
          return toast.success("Movie Fetched Sucessfully");
        }else{
          return toast.success("Server Error!!");
        }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // useEffect(()=>{
  //   fetchMovies();
  // },[]);

  useEffect(()=>{
    filterMovies();
  },[filters])

  const genreOptions = ['Action', 'Sci-fi', 'Comedy', 'Drama', 'Thriller', 'Romance'];

  const toggleGenre = (genres) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genres)
        ? prev.genres.filter(g => g !== genres)
        : [...prev.genres, genres]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar Filters */}
        <aside className="bg-gray-950 p-6 min-h-screen border-r border-gray-800 fixed left-0 top-0 h-screen w-90">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-bold">MovieFilter</h1>
          </div>

          <div className="space-y-6">
            {/* Filters Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
                <h2 className="font-semibold">Filters</h2>
              </div>
              <button className="text-xs text-gray-400 hover:text-white">Reset All</button>
            </div>

            {/* Genre Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3">GENRE</h3>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map(genres => (
                  <button
                    key={genres}
                    onClick={() => toggleGenre(genres)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filters.genres.includes(genres)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {genres}
                  </button>
                ))}
              </div>
            </div>

            {/* Release Year */}
            <div>
              <h3 className="text-sm font-semibold mb-3">RELEASE YEAR</h3>
              <div className="flex gap-2 mb-2">
                <button className="flex-1 px-3 py-1.5 bg-gray-800 rounded text-xs hover:bg-gray-700">
                  Exact
                </button>
                <button className="flex-1 px-3 py-1.5 bg-gray-700 rounded text-xs">
                  Range
                </button>
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">FROM</label>
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => setFilters({...filters, yearFrom: e.target.value})}
                    className="w-full bg-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">TO</label>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => setFilters({...filters, yearTo: e.target.value})}
                    className="w-full bg-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">RATING</h3>
                <span className="text-xs text-purple-600">{filters.rating}+</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Runtime */}
            <div>
              <h3 className="text-sm font-semibold mb-3">RUNTIME</h3>
              <div className="space-y-2">
                {['Under 90 min', '90 - 120 min', 'Over 120 min'].map((option, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="runtime"
                      checked={filters.runtime === option}
                      onChange={() => setFilters({...filters, runtime: option})}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>✓</span>
              Show 124 Results
            </button>
            <button className="w-full bg-transparent border border-gray-700 hover:border-gray-600 text-gray-300 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span>✕</span>
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8 ml-90 min-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for movies, actors, directors..."
                  className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700">
                🔔
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-900 rounded-lg"></div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Recommended Movies</h2>
              <p className="text-sm text-gray-400">Based on your filters</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{allMovies?.length} Movies Matches</span>
              <select className="bg-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option>Sort by: Popularity</option>
                <option>Sort by: Rating</option>
                <option>Sort by: Release Date</option>
              </select>
            </div>
          </div>

          {/* Movie Grid - Map your database data here */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allMovies && allMovies.length > 0 ? (
              allMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : (
              <p className="col-span-full text-center">
                No Movies Available Right Now!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;