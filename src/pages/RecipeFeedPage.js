import React, { useEffect, useState } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import styles from "../styles/RecipeFeedPage.module.css";
import { Spinner } from "react-bootstrap";

const RecipeFeedPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data } = await axios.get("/recipes/");
        setRecipes(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className={styles.RecipeFeed}>
      {loading ? (
        <div className={styles.loaderContainer}>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : recipes.length > 0 ? (
        recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
};

export default RecipeFeedPage;
