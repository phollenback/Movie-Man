import React from 'react';
import MovieCard from './MovieCard';
import '../styles/LogScreen.css';

function movieKey(movie) {
  return `${movie.title || ''}-${movie.year || ''}`;
}

const LogScreen = ({ watched, layout, onRemove, onReorder }) => {
  if (watched.length === 0) {
    return (
      <div className="log-screen log-screen--empty">
        <p>No movies logged yet. Search for a movie and tap &quot;Log&quot; when you&apos;ve watched it.</p>
      </div>
    );
  }

  return (
    <div className="log-screen">
      <p className="log-screen-hint">Use ↑↓ to move movies up or down in your list.</p>
      <div className={layout === 'grid' ? 'movie-grid' : 'movie-list'}>
        {watched.map((entry, index) => (
          <div key={entry.movieKey || movieKey(entry.movie)} className="log-entry">
            {onReorder && (
              <div className="log-reorder">
                <button
                  type="button"
                  className="log-reorder-btn"
                  onClick={() => onReorder(entry, 'up')}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="log-reorder-btn"
                  onClick={() => onReorder(entry, 'down')}
                  disabled={index === watched.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
            )}
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
              onClick={() => onRemove(entry)}
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
