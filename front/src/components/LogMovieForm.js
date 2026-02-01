import React, { useState } from 'react';
import '../styles/LogMovieForm.css';

const LogMovieForm = ({ movie, onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      comment: comment.trim() || undefined,
      userRating: userRating || undefined,
    });
  };

  return (
    <div className="log-form-overlay" onClick={onCancel}>
      <div className="log-form-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Log: {movie.title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="log-form-field">
            <label htmlFor="log-rating">Your rating (optional)</label>
            <div className="log-form-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`log-form-star ${userRating === n ? 'active' : ''}`}
                  onClick={() => setUserRating(userRating === n ? null : n)}
                  aria-pressed={userRating === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="log-form-field">
            <label htmlFor="log-comment">Comment (optional)</label>
            <textarea
              id="log-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note..."
              rows={3}
            />
          </div>
          <div className="log-form-actions">
            <button type="button" className="log-form-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="log-form-submit">
              Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogMovieForm;
