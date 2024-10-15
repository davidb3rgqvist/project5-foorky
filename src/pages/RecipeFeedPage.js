import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import TopBar from "../components/TopBar";
import FilterSearchCard from "../components/FilterSearchCard";
import { Spinner, Row, Col } from "react-bootstrap";
import styles from "../styles/RecipeFeedPage.module.css";

const RecipeFeedPage = () => {
  const [allRecipes, setAllRecipes] = useState([]); // Store the full list of recipes
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const handleSearch = (query, filters) => {
    setSearchQuery(query);
    setFilters(filters);
    applyFilters(query, filters);
  };

  const applyFilters = (query, filters) => {
    let filteredRecipes = [...allRecipes];

    if (query) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.difficulty === filters.difficulty);
    }

    if (filters.cookTime === "quick") {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.cook_time <= 30);
    } else if (filters.cookTime === "long") {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.cook_time >= 60);
    }

    if (filters.sortBy === "az") {
      filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "latest") {
      filteredRecipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setRecipes(filteredRecipes);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/recipes/?page=${currentPage}`);
        setAllRecipes((prevRecipes) => [...prevRecipes, ...data.results]);
        setRecipes((prevRecipes) => [...prevRecipes, ...data.results]);
        setNextPage(data.next);
        setHasMore(!!data.next);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [currentPage]);

  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loading, hasMore]);

  return (
    <>
      <TopBar />
      <div className={styles.FilterContainer}>
        <FilterSearchCard handleSearch={handleSearch} filters={filters} setFilters={setFilters} />
      </div>
      <Row className={styles.FeedLayout}>
        <Col xs={12}>
          <div className={styles.RecipeFeed}>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))
            ) : (
              <p>No recipes found.</p>
            )}
            <div ref={observerRef} className={styles.loaderContainer}>
              {loading && (
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default RecipeFeedPage;
