import React from "react";
import styles from "../styles/RecipeCardFront.module.css";

const RecipeCardFront = ({ recipe }) => {
  return (
    <div className={styles.RecipeCardFront}>
      <img src={recipe.image_url} alt={recipe.title} className={styles.RecipeImage} />
      <div className={styles.RecipeInfo}>
        <h2>{recipe.title}</h2>
        <p>Likes: {recipe.likes_count}</p>
        <p>{recipe.short_description}</p>
        <p>Cook Time: {recipe.cook_time} mins</p>
        <p>Difficulty: {recipe.difficulty}</p>
      </div>
    </div>
  );
};

export default RecipeCardFront;
