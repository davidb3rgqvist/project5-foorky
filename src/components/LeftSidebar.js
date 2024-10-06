import React, { useState } from 'react';

const LeftSidebar = ({ handleFilter, handleSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div className="sidebar-left">
      <h3>Filter</h3>
      <button onClick={() => handleFilter("easy")}>Easy Recipes</button>
      <button onClick={() => handleFilter("medium")}>Medium Recipes</button>
      <button onClick={() => handleFilter("hard")}>Hard Recipes</button>

      <h3>Search</h3>
      <input 
        type="text" 
        placeholder="Search recipes..." 
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default LeftSidebar;
