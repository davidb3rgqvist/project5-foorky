import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import TopBar from "../components/TopBar"; // Import the new TopBar component
import { Spinner, Row, Col } from "react-bootstrap";
import styles from "../styles/RecipeFeedPage.module.css";

const RecipeFeedPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  useEffect(() => {
    const fetchRecipes = async (page = 1) => {
      setLoading(true);
      try {
        let endpoint = `/recipes/?page=${page}`;
        let queryParams = [];

        if (filter.difficulty) {
          queryParams.push(`difficulty=${filter.difficulty}`);
        }
        if (filter.cookTime === "quick") {
          queryParams.push("cook_time__lte=30");
        } else if (filter.cookTime === "long") {
          queryParams.push("cook_time__gte=60");
        }
        if (searchQuery) {
          queryParams.push(`search=${searchQuery}`);
        }

        if (queryParams.length) {
          endpoint += `&${queryParams.join("&")}`;
        }

        const { data } = await axios.get(endpoint);
        
        setRecipes((prevRecipes) => [...prevRecipes, ...data.results]);
        setNextPage(data.next);
        setHasMore(!!data.next);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes(currentPage);
  }, [filter, searchQuery, currentPage]);

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

  const handleDelete = async (recipeId) => {
    try {
      await axios.delete(`/recipes/${recipeId}/`);
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
      console.log(`Deleted recipe with id: ${recipeId}`);
    } catch (error) {
      console.error("Error deleting the recipe:", error);
      alert("Failed to delete the recipe. Please try again.");
    }
  };

  return (
    <>
      {/* Add TopBar here */}
      <TopBar />
      
      <Row className={styles.FeedLayout}>
        <Col xs={12}>
          <div className={styles.RecipeFeed}>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onUpdate={(recipeId) => console.log(`Update recipe with id: ${recipeId}`)}
                  onDelete={handleDelete}
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
