import React from 'react';
import MovieCard from './MovieCard';
import '../styles/LogScreen.css';

function movieKey(movie) {
  return `${movie.title || ''}-${movie.year || ''}`;
}

const LogScreen = ({ watched, layout, onRemove }) => {
  if (watched.length === 0) {
    return (
      <div className="log-screen log-screen--empty">
        <p>No movies logged yet. Search for a movie and tap &quot;Log&quot; when you&apos;ve watched it.</p>
      </div>
    );
  }

  return (
    <div className="log-screen">
      <div className={layout === 'grid' ? 'movie-grid' : 'movie-list'}>
        {watched.map((entry, index) => (
          <div key={movieKey(entry.movie)} className="log-entry">
            <div className="log-entry-main">
              <MovieCard movie={entry.movie} layout={layout} />
              {(entry.comment || entry.userRating) && (
                <div className="log-entry-meta">
                  {entry.userRating != null && (
                    <span className="log-entry-rating">Your rating: {entry.userRating}/5</span>
                  )}
                  {entry.comment && <p className="log-entry-comment">{entry.comment}</p>}
                </div>
              )}
            </div>
            <button
              type="button"
              className="log-remove-button"
              onClick={() => onRemove(index)}
              aria-label="Remove from log"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogScreen;
