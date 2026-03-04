import axios from "axios";

router.post("/import", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ FETCH FROM EXTERNAL API FIRST
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/popular",
      {
        params: {
          api_key: process.env.TMDB_API_KEY
        }
      }
    );

    if (!response.data?.results?.length) {
      throw new Error("No movies received from API");
    }

    const movies = response.data.results;

    // 2️⃣ FORMAT DATA
    const formattedMovies = movies.map(movie => ({
      title: movie.title,
      year: movie.release_date
        ? parseInt(movie.release_date.split("-")[0])
        : null,
      rating: movie.vote_average,
      totalRating: movie.vote_average,
      votes: movie.vote_count?.toString(),
      ageRating: "UA",
      duration: null,
      genres: movie.genre_ids?.join(", "),
      director: null,
      writers: null,
      revenue: null,
      releaseDate: movie.release_date,
      languages: movie.original_language,
      synopsis: movie.overview,
      imageUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      backdropUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    }));

    // 3️⃣ TRUNCATE + INSERT (TRANSACTION)
    await Movie.destroy({
      where: {},
      truncate: true,
      restartIdentity: true,
      transaction
    });

    await Movie.bulkCreate(formattedMovies, { transaction });

    // 4️⃣ COMMIT
    await transaction.commit();

    res.json({
      message: "Movies fetched, table truncated, and data imported successfully",
      count: formattedMovies.length
    });
  } catch (error) {
    // 5️⃣ ROLLBACK (OLD DATA SAFE)
    await transaction.rollback();

    console.error(error);
    res.status(500).json({
      error: "Import failed. Existing data preserved."
    });
  }
});

export default router;
