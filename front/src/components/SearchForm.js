import React, { useState } from 'react';
import '../styles/SearchForm.css';

const SearchForm = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form-container">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search..."
        className="search-input"
      />
      <button
        type="submit"
        className="search-button"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;