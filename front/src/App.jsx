// Movie-Man – search, watchlist, log
import React, { useState, useEffect, useCallback } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import axios from 'axios';
import Movie from './models/Movie';
import MovieCard from './components/MovieCard';
import SearchForm from './components/SearchForm';
import Watchlist from './components/Watchlist';
import LogScreen from './components/LogScreen';
import LogMovieForm from './components/LogMovieForm';
import AuthButton from './components/AuthButton';
import { loginRequest } from './authConfig';
import * as api from './api/moviemanApi';
import './styles/App.css';

function movieKey(movie) {
  return `${movie.title || ''}-${movie.year || ''}`;
}

function App() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts[0];
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('search');
  const [loggingMovie, setLoggingMovie] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  const getToken = useCallback(async () => {
    if (!account) throw new Error('No account');
    const result = await instance.acquireTokenSilent({ ...loginRequest, account });
    return result.idToken || result.accessToken;
  }, [instance, account]);

  useEffect(() => {
    if (!isAuthenticated || !account) return;
    let cancelled = false;
    setDataLoading(true);
    Promise.all([api.fetchWatchlist(getToken), api.fetchWatched(getToken)])
      .then(([wl, wd]) => {
        if (!cancelled) {
          setWatchlist(wl);
          setWatched(wd);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load watchlist/watched:', err);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, account, getToken]);

  const moviesPerPage = viewMode === 'list' ? 12 : 8;

  const searchKey = async (keyword, page = 1) => {
    try {
      setSearchError('');
      setLoading(true);
      const apiKey = process.env.REACT_APP_OMDB_API_KEY || '';
      const response = await axios.get(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(keyword)}&page=${page}`);
      const data = response.data;

      if (data.Response === 'True') {
        const detailPromises = data.Search.map(async (item) => {
          const detailRes = await axios.get(`https://www.omdbapi.com/?apikey=${apiKey}&i=${item.imdbID}`);
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
        setClientPage(1);
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

  const handleClientPageChange = (page) => {
    setClientPage(page);
  };

  const paginatedMovies = movies.slice((clientPage - 1) * moviesPerPage, clientPage * moviesPerPage);
  const totalClientPages = Math.ceil(movies.length / moviesPerPage);

  const addToWatchlist = async (movie) => {
    if (watchlist.some((m) => movieKey(m) === movieKey(movie))) return;
    try {
      await api.addToWatchlist(movie, getToken);
      setWatchlist((prev) => [...prev, movie]);
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const removeFromWatchlist = async (movie) => {
    try {
      await api.removeFromWatchlist(movieKey(movie), getToken);
      setWatchlist((prev) => prev.filter((m) => movieKey(m) !== movieKey(movie)));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const logMovie = async (movie, logData = {}) => {
    if (watched.some((e) => movieKey(e.movie) === movieKey(movie))) return;
    try {
      await api.addToWatched({ movie, comment: logData.comment, userRating: logData.userRating }, getToken);
      setWatched((prev) => [{ movie, comment: logData.comment, userRating: logData.userRating }, ...prev]);
      setWatchlist((prev) => prev.filter((m) => movieKey(m) !== movieKey(movie)));
      setLoggingMovie(null);
    } catch (err) {
      console.error('Failed to log movie:', err);
    }
  };

  const handleLogSubmit = (logData) => {
    if (loggingMovie) logMovie(loggingMovie, logData);
  };

  const removeFromLog = async (entry) => {
    try {
      const mk = entry.movieKey || movieKey(entry.movie);
      await api.removeFromWatched(mk, getToken);
      setWatched((prev) => prev.filter((e) => (e.movieKey || movieKey(e.movie)) !== mk));
    } catch (err) {
      console.error('Failed to remove from log:', err);
    }
  };

  const reorderLog = async (entry, direction) => {
    const mk = entry.movieKey || movieKey(entry.movie);
    const idx = watched.findIndex((e) => (e.movieKey || movieKey(e.movie)) === mk);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= watched.length) return;
    const next = [...watched];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setWatched(next);
    try {
      await api.reorderWatched(mk, direction, getToken);
    } catch (err) {
      setWatched(watched);
      console.error('Failed to reorder log:', err);
    }
  };

  const isWatched = (movie) => watched.some((e) => movieKey(e.movie) === movieKey(movie));
  const isInWatchlist = (movie) => watchlist.some((m) => movieKey(m) === movieKey(movie));

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-left">
          <h1>Movie Man</h1><i>by Digital Rev.</i>
          {isAuthenticated && (
            <nav className="main-nav">
              <button
                type="button"
                className={activeTab === 'search' ? 'active' : ''}
                onClick={() => setActiveTab('search')}
              >
                Search
              </button>
              <button
                type="button"
                className={activeTab === 'watchlist' ? 'active' : ''}
                onClick={() => setActiveTab('watchlist')}
              >
                Watchlist {watchlist.length > 0 && `(${watchlist.length})`}
              </button>
              <button
                type="button"
                className={activeTab === 'log' ? 'active' : ''}
                onClick={() => setActiveTab('log')}
              >
                Log {watched.length > 0 && ` (${watched.length})`}
              </button>
            </nav>
          )}
        </div>
        <div className="app-header-right">
          <AuthButton />
        </div>
      </header>

      <div className="app-main">
        {isAuthenticated ? (
        <div className="movies-container">
          {dataLoading && (
            <div className="loading-spinner-container">
              <div className="loading-spinner" />
            </div>
          )}
          <div className="movies-toolbar">
            <span className="view-toggle">
              <button
                type="button"
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
              >
                Grid
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
              >
                List
              </button>
            </span>
          </div>

          {activeTab === 'search' && (
            <>
              <div className="search-inline">
                <SearchForm onSearch={searchKey} />
              </div>
              {loading && (
                <div className="loading-spinner-container">
                  <div className="loading-spinner" />
                </div>
              )}
              {searchError && <div className="error-message">{searchError}</div>}
              <div className={viewMode === 'grid' ? 'movie-grid' : 'movie-list'}>
                {paginatedMovies.map((movie) => (
                  <MovieCard
                    key={movieKey(movie)}
                    movie={movie}
                    layout={viewMode}
                    onAddToWatchlist={!isInWatchlist(movie) ? () => addToWatchlist(movie) : null}
                    onLog={!isWatched(movie) ? () => setLoggingMovie(movie) : null}
                  />
                ))}
              </div>
              {totalClientPages > 1 && (
                <div className="pagination pagination-bottom">
                  {Array.from({ length: totalClientPages }, (_, i) => (
                    <button
                      key={i + 1}
                      type="button"
                      className={clientPage === i + 1 ? 'active' : ''}
                      onClick={() => handleClientPageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'watchlist' && (
            <Watchlist
              watchlist={watchlist}
              layout={viewMode}
              onRemove={removeFromWatchlist}
              onLog={(movie) => setLoggingMovie(movie)}
            />
          )}

          {activeTab === 'log' && (
            <LogScreen
              watched={watched}
              layout={viewMode}
              onRemove={removeFromLog}
              onReorder={reorderLog}
            />
          )}
        </div>
        ) : (
          <div className="auth-prompt">
            <p>Sign in with Microsoft to search movies, manage your watchlist, and log what you&apos;ve watched.</p>
            <p>Your watchlist and movie log are saved to your account and stay with you across sessions.</p>
          </div>
        )}
      </div>

      {loggingMovie && (
        <LogMovieForm
          movie={loggingMovie}
          onSubmit={handleLogSubmit}
          onCancel={() => setLoggingMovie(null)}
        />
      )}
    </div>
  );
}

export default App;
