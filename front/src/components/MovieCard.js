import React from 'react';
import '../styles/MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <h2>{movie.title}</h2>
      <p><strong>Year:</strong> {movie.year}</p>
      <p><strong>Director:</strong> {movie.director}</p>
      <p><strong>Rating:</strong> {movie.rating}</p>
      <p>{movie.plot}</p>
      {movie.poster && <img src={movie.poster} alt={movie.title} className="movie-poster" />}
    </div>
  );
};

export default MovieCard;