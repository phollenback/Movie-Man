import React from 'react';
import '../styles/MovieCard.css';

const MovieCard = ({ movie, layout = 'grid', onAddToWatchlist }) => {
  const isList = layout === 'list';
  return (
    <div className={`movie-card ${isList ? 'movie-card--list' : ''}`}>
      {movie.poster && movie.poster !== 'N/A' ? (
        <img src={movie.poster} alt={movie.title} className="movie-poster" />
      ) : (
        <div className="movie-poster movie-poster-placeholder">No Image</div>
      )}
      <div className="movie-card-body">
        <h2 className="movie-card-title">{movie.title || 'N/A'}</h2>
        <p className="movie-card-meta">
          {movie.year || 'N/A'} · {movie.director || 'N/A'} · {movie.rating || 'N/A'}
        </p>
        {!isList && (
          <p className="movie-card-plot">
            {movie.plot && movie.plot !== 'N/A' ? movie.plot : <span className="movie-card-no-plot">No plot available.</span>}
          </p>
        )}
        {onAddToWatchlist && (
          <button className={isList ? 'add-button-inline' : 'add-button-large'} onClick={onAddToWatchlist}>
            Add to Watchlist
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieCard;