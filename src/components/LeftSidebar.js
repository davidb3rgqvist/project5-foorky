import React, { useState } from 'react';
import styles from '../styles/LeftSidebar.module.css';

const LeftSidebar = ({ handleFilter, handleSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <div className={styles.Sidebar}>
      <h3>Filter by Difficulty</h3>
      <button onClick={() => handleFilter("Easy")}>Easy</button>
      <button onClick={() => handleFilter("Medium")}>Medium</button>
      <button onClick={() => handleFilter("Hard")}>Hard</button>

      <h3>Filter by Cooking Time</h3>
      <button onClick={() => handleFilter("quick")}>Quick Recipes</button>
      <button onClick={() => handleFilter("long")}>Long Recipes</button>

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
