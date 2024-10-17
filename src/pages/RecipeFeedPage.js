import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import TopBar from "../components/TopBar";
import FilterSearchCard from "../components/FilterSearchCard";
import { Spinner, Row, Col, Alert } from "react-bootstrap";
import styles from "../styles/RecipeFeedPage.module.css";

const RecipeFeedPage = () => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const observerRef = useRef();

  const handleSearch = (query, filters) => {
    setFilters(filters);
    applyFilters(query, filters);
  };

  const applyFilters = (query, filters) => {
    let filteredRecipes = [...allRecipes];

    if (query) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.difficulty === filters.difficulty,
      );
    }

    if (filters.cookTime === "quick") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.cook_time <= 30,
      );
    } else if (filters.cookTime === "long") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.cook_time >= 60,
      );
    }

    if (filters.sortBy === "az") {
      filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "latest") {
      filteredRecipes.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
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

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [loading, hasMore]);

  const handleDeleteRecipe = (recipeId) => {
    setRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.id !== recipeId),
    );

    setAlertMessage("Recipe deleted successfully!");
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  return (
    <>
      <TopBar />
      <div className={styles.FilterContainer}>
        <FilterSearchCard
          handleSearch={handleSearch}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      {/* Alert Section */}
      {alertMessage && (
        <Alert
          variant="success"
          onClose={() => setAlertMessage(null)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      <Row className={styles.FeedLayout}>
        <Col xs={12}>
          <div className={styles.RecipeFeed}>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDelete={handleDeleteRecipe}
                />
              ))
            ) : (
              <p></p>
            )}
            <div ref={observerRef} className={styles.loaderContainer}>
              {loading && (
                <Spinner animation="border" role="status">
                  <span className="sr-only"></span>
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
