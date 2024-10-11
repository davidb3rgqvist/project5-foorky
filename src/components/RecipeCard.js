import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/RecipeCard.module.css";

const RecipeCard = ({ recipe, onUpdate, onDelete, onAddComment }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(recipe.likes_count || 0);
  const [isLiked, setIsLiked] = useState(recipe.is_liked);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");

  const currentUser = useCurrentUser();
  const cardRef = useRef(null);

  const handleFlip = () => setIsFlipped(!isFlipped);
  const preventFlip = (e) => e.stopPropagation();

  // Close the flipped card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && isFlipped) {
        setIsFlipped(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped]);

  const handleLike = async (event) => {
    event.preventDefault();

    // Check if user is logged in
    if (!currentUser) {
      alert("You need to be logged in to like recipes!");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("You need to be logged in to like recipes!");
      return;
    }

    try {
      // Send POST request to the likes endpoint
      await axios.post("/likes/", { recipe_id: recipe.id }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Toggle like status and update like count
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    } catch (error) {
      console.error("Error updating like status:", error);
      alert("Failed to like the recipe. Please try again.");
    }
  };

  const handleAddComment = async (event) => {
    preventFlip(event);

    if (!currentUser) {
      alert("You need to be logged in to comment!");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (newComment.trim()) {
      try {
        const response = await axios.post(
          `/comments/`,
          { recipe: recipe.id, content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onAddComment(response.data);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
      }
    }
  };

  const confirmDelete = (event) => {
    preventFlip(event);
    setShowDeleteConfirm(true);
  };

  const handleDelete = (event) => {
    preventFlip(event);
    onDelete(recipe.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div ref={cardRef} className={`${styles.cardContainer}`} onClick={handleFlip}>
      <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ""}`}>
        {/* Front Side */}
        <div className={styles.cardFront}>
          <img src={recipe.image} alt={recipe.title} className={styles.cardImage} />
          <div className={styles.cardContent}>
            <h2 className={styles.recipeTitle}>{recipe.title}</h2>
            <p className={styles.shortDescription}>{recipe.short_description}</p>

            <div className={styles.cardFooter}>
              <p><i className="fas fa-clock"></i> {recipe.cook_time} mins</p>
              <p><i className="fas fa-tachometer-alt"></i> {recipe.difficulty}</p>
              <p><i className="fas fa-heart"></i> {likes}</p>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className={styles.cardBack}>
          <div className={styles.cardBackContent} onClick={preventFlip}>
            <h3 onClick={() => setShowIngredients(!showIngredients)}>
              {showIngredients ? "▾ Ingredients" : "▸ Ingredients"}
            </h3>
            {showIngredients && <p>{recipe.ingredients}</p>}

            <h3 onClick={() => setShowSteps(!showSteps)}>
              {showSteps ? "▾ Steps" : "▸ Steps"}
            </h3>
            {showSteps && <p>{recipe.steps}</p>}

            <h3 onClick={() => setShowComments(!showComments)}>
              {showComments ? "▾ Comments" : "▸ Comments"}
            </h3>
            {showComments && (
              <div className={styles.commentsSection}>
                {/* Add Comment */}
                <div className={styles.addComment}>
                  <input
                    type="text"
                    value={newComment}
                    placeholder="Add a comment..."
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={preventFlip}
                  />
                  <button onClick={handleAddComment}>Add</button>
                </div>
              </div>
            )}

            <div className={styles.actionsBack}>
              <button className={styles.likeButton} onClick={handleLike}>
                {isLiked ? 'Unlike' : 'Like'} ({likes})
              </button>
              {currentUser?.username === recipe.owner && (
                <>
                  <button className={styles.deleteButton} onClick={confirmDelete}>Delete</button>
                </>
              )}
            </div>

            <div className={styles.chefName}>
              <p>Created by: {recipe.owner}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.deleteConfirmModal} onClick={preventFlip}>
          <p>Are you sure you want to delete this recipe?</p>
          <button onClick={handleDelete}>Yes</button>
          <button onClick={() => setShowDeleteConfirm(false)}>No</button>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
