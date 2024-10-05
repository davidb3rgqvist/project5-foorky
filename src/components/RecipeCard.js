import React, { useState } from "react";
import styles from "../styles/RecipeCard.module.css";
import RecipeCardFront from "./RecipeCardFront";
import RecipeCardBack from "./RecipeCardBack";

const RecipeCard = ({ recipe }) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div className={`${styles.RecipeCard} ${flipped ? styles.flipped : ""}`} onClick={handleFlip}>
      {flipped ? <RecipeCardBack recipe={recipe} /> : <RecipeCardFront recipe={recipe} />}
    </div>
  );
};

export default RecipeCard;
