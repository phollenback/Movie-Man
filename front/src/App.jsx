import React, { useState } from 'react';
import axios from 'axios';
import Movie from './models/Movie';
import MovieCard from './components/MovieCard';
import SearchForm from './components/SearchForm';
import Watchlist from './components/Watchlist';
import './styles/App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const MOVIES_PER_PAGE = 2;

  const searchKey = async (keyword, page = 1) => {
    try {
      setSearchError('');
      setLoading(true);
      const response = await axios.get(`http://www.omdbapi.com/?apikey=c03606c4&s=${encodeURIComponent(keyword)}&page=${page}`);
      const data = response.data;

      if (data.Response === 'True') {
        // Fetch full details for each movie in parallel
        const detailPromises = data.Search.map(async (item) => {
          const detailRes = await axios.get(`http://www.omdbapi.com/?apikey=c03606c4&i=${item.imdbID}`);
          const detail = detailRes.data;
          return new Movie(
            detail.Title,
            detail.Year,
            detail.Director || 'N/A',
            detail.Plot || 'N/A',
            (detail.Ratings && detail.Ratings.length > 0 ? detail.Ratings[0].Value : (detail.imdbRating && detail.imdbRating !== 'N/A' ? detail.imdbRating : 'N/A')),
            detail.Poster
          );
        });
        const moviesList = await Promise.all(detailPromises);
        setMovies(moviesList);
        setClientPage(1); // Reset client page on new search
      } else {
        setMovies([]);
        setSearchError(data.Error || 'No results found.');
        setClientPage(1);
      }
      setLoading(false);
    } catch (error) {
      setMovies([]);
      setSearchError('Error fetching movie data.');
      setClientPage(1);
      setLoading(false);
      console.error('Error fetching movie data:', error);
    }
  };

  // Client-side pagination controls
  const handleClientPageChange = (page) => {
    setClientPage(page);
  };

  const paginatedMovies = movies.slice((clientPage - 1) * MOVIES_PER_PAGE, clientPage * MOVIES_PER_PAGE);
  const totalClientPages = Math.ceil(movies.length / MOVIES_PER_PAGE);

  const addToWatchlist = (movie) => {
    setWatchlist((prev) => [...prev, movie]);
  };

  const removeFromWatchlist = (index) => {
    const updatedWatchlist = watchlist.filter((_, i) => i !== index);
    setWatchlist(updatedWatchlist);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Movie Man</h1>
          <nav className="repo-nav">
            <span className="repo-badge">{process.env.REACT_APP_GIT_REPO || 'phollenback/Movie-Man'}</span>
            <span className="branch-badge">{process.env.REACT_APP_GIT_BRANCH || 'main'}</span>
          </nav>
        </div>
        <span className="deploy-badge">✓ CI/CD</span>
      </header>
      <div className="movies-container grid-movies">
        {searchError && <div className="error-message">{searchError}</div>}
        <div className="movie-grid">
          {paginatedMovies.map((movie) => (
            <MovieCard key={movie.title + movie.year} movie={movie} onAddToWatchlist={() => addToWatchlist(movie)} />
          ))}
        </div>
        {/* Pagination at the bottom */}
        {totalClientPages > 1 && (
          <div className="pagination pagination-bottom">
            {Array.from({ length: totalClientPages }, (_, i) => (
              <button
                key={i + 1}
                className={clientPage === i + 1 ? 'active' : ''}
                onClick={() => handleClientPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-add-container">
        <SearchForm onSearch={searchKey} />
        {loading && (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      <Watchlist watchlist={watchlist} onRemove={removeFromWatchlist} />
    </div>
  );
}

export default App;
