import React, { useState } from "react";
import styles from "../styles/RecipeCardBack.module.css";

const RecipeCardBack = ({ recipe }) => {
  const [ingredientsVisible, setIngredientsVisible] = useState(true);
  const [stepsVisible, setStepsVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  return (
    <div className={styles.RecipeCardBack}>
      <div className={styles.ToggleSection} onClick={() => setIngredientsVisible(!ingredientsVisible)}>
        <h3>Ingredients</h3>
        {ingredientsVisible && (
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <input type="checkbox" /> {ingredient}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.ToggleSection} onClick={() => setStepsVisible(!stepsVisible)}>
        <h3>Steps</h3>
        {stepsVisible && (
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </div>

      <div className={styles.ToggleSection} onClick={() => setCommentsVisible(!commentsVisible)}>
        <h3>Comments</h3>
        {commentsVisible && (
          <ul>
            {recipe.comments.map((comment, index) => (
              <li key={index}>{comment}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecipeCardBack;
