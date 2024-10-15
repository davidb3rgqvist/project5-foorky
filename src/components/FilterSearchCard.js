import React, { useState } from "react";
import { Card, Button, Form, FormControl } from "react-bootstrap";
import styles from "../styles/FilterSearchCard.module.css";

const FilterSearchCard = ({ handleSearch, filters, setFilters }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery, filters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <Card className={styles.FilterSearchCard}>
      <Card.Body>
        <Form onSubmit={handleSearchSubmit}>
          {/* Search Field */}
          <Form.Group controlId="searchQuery">
            <FormControl
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.SearchInput}
            />
          </Form.Group>

          {/* Filters */}
          <div className={styles.Filters}>
            {/* Difficulty Filter */}
            <Form.Group controlId="filterDifficulty">
              <Form.Label>Difficulty</Form.Label>
              <Form.Control
                as="select"
                name="difficulty"
                value={filters.difficulty || ""}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </Form.Control>
            </Form.Group>

            {/* Cook Time Filter */}
            <Form.Group controlId="filterCookTime">
              <Form.Label>Cook Time</Form.Label>
              <Form.Control
                as="select"
                name="cookTime"
                value={filters.cookTime || ""}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="quick">Under 30 mins</option>
                <option value="long">Over 1 hour</option>
              </Form.Control>
            </Form.Group>

            {/* Sort Filter */}
            <Form.Group controlId="filterSort">
              <Form.Label>Sort By</Form.Label>
              <Form.Control
                as="select"
                name="sortBy"
                value={filters.sortBy || ""}
                onChange={handleFilterChange}
              >
                <option value="">None</option>
                <option value="az">A-Z</option>
                <option value="latest">Latest Added</option>
              </Form.Control>
            </Form.Group>
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" className={styles.Button}>
            Apply
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FilterSearchCard;
