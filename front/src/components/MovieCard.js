import React from 'react';
import '../styles/MovieCard.css';

const MovieCard = ({ movie, onAddToWatchlist }) => {
  return (
    <div className="movie-card">
      <h2>{movie.title || 'N/A'}</h2>
      <p><strong>Year:</strong> {movie.year || 'N/A'}</p>
      <p><strong>Director:</strong> {movie.director || 'N/A'}</p>
      <p><strong>Rating:</strong> {movie.rating || 'N/A'}</p>
      <p>{movie.plot && movie.plot !== 'N/A' ? movie.plot : <span style={{ color: '#888' }}>No plot available.</span>}</p>
      {movie.poster && movie.poster !== 'N/A' ? (
        <img src={movie.poster} alt={movie.title} className="movie-poster" />
      ) : (
        <div className="movie-poster movie-poster-placeholder">No Image</div>
      )}
      {onAddToWatchlist && (
        <button className="add-button-large" onClick={onAddToWatchlist}>
          Add to Watchlist
        </button>
      )}
    </div>
  );
};

export default MovieCard;