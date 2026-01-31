import React, { useState } from 'react';
import '../styles/SearchForm.css';

const SearchForm = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(keyword);
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
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
      <button
        type="button"
        className="search-button search-button-clear"
        onClick={handleClear}
      >
        Clear
      </button>
    </form>
  );
};

export default SearchForm;