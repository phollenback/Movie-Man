import React from 'react';
import MovieCard from './MovieCard';
import '../styles/Watchlist.css';

function movieKey(movie) {
  return `${movie.title || ''}-${movie.year || ''}`;
}

const Watchlist = ({ watchlist, layout, onRemove, onLog }) => {
  if (watchlist.length === 0) {
    return (
      <div className="watchlist-empty">
        <p>Nothing on your watchlist. Search for movies and add them.</p>
      </div>
    );
  }

  return (
    <div className="watchlist-view">
      <div className={layout === 'grid' ? 'movie-grid' : 'movie-list'}>
        {watchlist.map((movie, index) => (
          <div key={movieKey(movie)} className="watchlist-entry">
            <MovieCard
              movie={movie}
              layout={layout}
              onAddToWatchlist={null}
              onLog={onLog ? () => onLog(movie) : null}
            />
            <div className="watchlist-actions">
              {onLog && (
                <button type="button" className="watchlist-log-button" onClick={() => onLog(movie)}>
                  Log
                </button>
              )}
              <button type="button" className="watchlist-remove-button" onClick={() => onRemove(movie)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
