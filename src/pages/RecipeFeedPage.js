import React, { useEffect, useState } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { Spinner, Row, Col } from "react-bootstrap";
import styles from "../styles/RecipeFeedPage.module.css";

const RecipeFeedPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        let endpoint = "/recipes/";
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
          endpoint += `?${queryParams.join("&")}`;
        }

        const { data } = await axios.get(endpoint);
        setRecipes(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [filter, searchQuery]);

  const handleDelete = (recipeId) => {
    // Logic to delete a recipe
    console.log(`Delete recipe with id: ${recipeId}`);
  };

  const handleAddComment = (comment) => {
    // Logic to add a comment
    console.log(`Add comment: ${comment}`);
  };

  const handleEditComment = (commentId, content) => {
    // Logic to edit a comment
    console.log(`Edit comment ${commentId}: ${content}`);
  };

  return (
    <Row className={styles.FeedLayout}>
      <Col xs={12} md={3} className="d-none d-md-block">
        <LeftSidebar handleFilter={setFilter} handleSearch={setSearchQuery} />
      </Col>

      <Col xs={12} md={6}>
        <div className={styles.RecipeFeed}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          ) : recipes.length > 0 ? (
            recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onUpdate={(recipeId) => console.log(`Update recipe with id: ${recipeId}`)}
                onDelete={handleDelete}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
              />
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
      </Col>

      <Col xs={12} md={3} className="d-none d-md-block">
        <RightSidebar />
      </Col>
    </Row>
  );
};

export default RecipeFeedPage;
