import React, { useEffect, useState } from "react";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import styles from "../styles/RecipeFeedPage.module.css";

const RecipeFeedPage = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data } = await axios.get("/api/recipes/");
        setRecipes(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className={styles.RecipeFeed}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeFeedPage;
