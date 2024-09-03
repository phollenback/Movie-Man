import React from 'react';
import '../styles/Watchlist.css';

const Watchlist = ({ watchlist, onRemove }) => {
  return (
    <div className="watchlist-container">
      <h2>Watchlist</h2>
      {watchlist.length === 0 ? (
        <p>No movies added yet.</p>
      ) : (
        <div>
          {watchlist.map((movie, index) => (
            <div key={index} className="watchlist-item">
              <span className="watchlist-index">{index + 1}.</span>
              <span className="watchlist-title"><strong>Title:</strong> {movie.title}</span>
              <span className="watchlist-rating"><strong>Rating:</strong> {movie.rating}</span>
              <p className="watchlist-plot"><strong>Plot:</strong> {movie.plot}</p>
              <button
                className="remove-button"
                onClick={() => onRemove(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;