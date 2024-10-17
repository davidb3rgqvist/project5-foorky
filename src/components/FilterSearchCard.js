import React, { useState } from "react";
import { Card, Button, Form, FormControl, Collapse } from "react-bootstrap";
import styles from "../styles/FilterSearchCard.module.css";
import buttonStyles from "../styles/Button.module.css";

const FilterSearchCard = ({ handleSearch, filters, setFilters }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
    handleSearch("", {});
  };

  return (
    <Card className={styles.FilterSearchCard}>
      <Card.Body>
        {/* Filter Header with Expand Button */}
        <div className={styles.FilterHeader}>
          <Button
            className={buttonStyles.arrowButton}
            variant="white"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-controls="filter-options"
            aria-expanded={isExpanded}
          >
            Filter Recipes{" "}
            {isExpanded ? (
              <i className="fas fa-chevron-up"></i>
            ) : (
              <i className="fas fa-chevron-down"></i>
            )}
          </Button>
          <Button
            variant="white"
            onClick={handleClearFilters}
            className={buttonStyles.ClearButton}
          >
            Clear Filters
          </Button>
        </div>

        {/* Collapsible Filter Section */}
        <Collapse in={isExpanded}>
          <div id="filter-options">
            <Form onSubmit={handleSearchSubmit}>
              <Form.Group controlId="searchQuery">
                <FormControl
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={buttonStyles.toggle}
                />
              </Form.Group>

              <div className={styles.Filters}>
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

              <Button type="submit" className={buttonStyles.Button}>
                Apply
              </Button>
            </Form>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default FilterSearchCard;
