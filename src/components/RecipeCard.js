import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/RecipeCard.module.css";
import buttonStyles from "../styles/Button.module.css";

const RecipeCard = ({ recipe, onDelete }) => {
  // State variables for handling card flip, likes, comments, and visibility toggles
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(recipe.likes_count || 0);
  const [isLiked, setIsLiked] = useState(recipe.is_liked);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");
  const [comments, setComments] = useState([]);

  const currentUser = useCurrentUser();
  const cardRef = useRef(null);

  // Function to toggle the card flip state
  const handleFlip = () => setIsFlipped(!isFlipped);
  
  // Prevent flip function to stop propagation on specific elements
  const preventFlip = (e) => e.stopPropagation();

  // Function to display alert messages with a timeout
  const showAlert = (message, variant) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Handle like functionality by making a POST request
  const handleLike = async () => {
    try {
      const response = await axios.post(
        "/likes/",
        { recipe: recipe.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        setLikes(likes + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error liking the recipe:", error);
      showAlert("Error liking the recipe. Please try again.", "danger");
    }
  };

  // Handle unlike functionality by making a DELETE request
  const handleUnlike = async () => {
    try {
      const response = await axios.delete(`/likes/${recipe.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.status === 204) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    } catch (error) {
      console.error("Error unliking the recipe:", error);
      showAlert("Error unliking the recipe. Please try again.", "danger");
    }
  };

  // Toggle the like or unlike state
  const handleToggleLike = (e) => {
    preventFlip(e);
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  // Fetch comments related to the recipe
  const fetchComments = useCallback(async () => {
    try {
      const { data } = await axios.get("/comments/");
      const filteredComments = data.results.filter(
        (comment) => comment.recipe === recipe.id
      );
      setComments(filteredComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      showAlert("Failed to fetch comments.", "danger");
    }
  }, [recipe.id]);

  // Load comments when the component mounts
  useEffect(() => {
    if (recipe.id) {
      fetchComments();
    }
  }, [recipe.id, fetchComments]);

  // Close the card when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && isFlipped) {
        setIsFlipped(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped]);

  // Handle adding a new comment
  const handleAddComment = async (event) => {
    preventFlip(event);

    if (!currentUser) {
      showAlert("You need to be logged in to comment.", "warning");
      return;
    }

    const token = localStorage.getItem("authToken");

    if (newComment.trim()) {
      try {
        await axios.post(
          `/comments/`,
          { recipe: recipe.id, content: newComment },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNewComment("");
        fetchComments();
        showAlert("Comment added successfully!", "success");
      } catch (error) {
        console.error("Error adding comment:", error);
        showAlert("Failed to add comment. Please try again.", "danger");
      }
    }
  };

  // Handle editing the recipe
  const handleEdit = (event) => {
    preventFlip(event);
    window.location.href = `/edit-recipe/${recipe.id}`;
  };

  // Confirm deletion of the recipe
  const confirmDelete = (event) => {
    preventFlip(event);
    setShowDeleteConfirm(true);
  };

  // Delete the recipe
  const handleDelete = async (event) => {
    preventFlip(event);

    try {
      await axios.delete(`/recipes/${recipe.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setShowDeleteConfirm(false);

      if (onDelete) {
        onDelete(recipe.id);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      showAlert("Failed to delete the recipe. Please try again.", "danger");
    }
  };

  return (
    <div
      ref={cardRef}
      className={styles.cardContainer}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleFlip();
      }}
    >
      {/* Alert Section */}
      {alertMessage && (
        <Alert variant={alertVariant} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ""}`}>
        {/* Front Side */}
        <div className={styles.cardFront}>
          <img
            src={recipe.image}
            alt={recipe.title}
            className={styles.cardImage}
          />
          <div className={styles.cardContent}>
            <h2 className={styles.recipeTitle}>{recipe.title}</h2>
            <p className={styles.shortDescription}>
              {recipe.short_description}
            </p>

            <div className={styles.cardFooter}>
              <p>
                <i className="fas fa-clock"></i> {recipe.cook_time} mins
              </p>
              <p>
                <i className="fas fa-tachometer-alt"></i> {recipe.difficulty}
              </p>
              <p>
                <i className="fas fa-heart"></i> {likes}
              </p>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className={styles.cardBack}>
          <div className={styles.cardBackContent}>
            {/* Toggle Ingredients */}
            <button
              className={styles.toggleButton}
              onClick={(e) => {
                preventFlip(e);
                setShowIngredients(!showIngredients);
              }}
            >
              {showIngredients ? "▾ Ingredients" : "▸ Ingredients"}
            </button>
            {showIngredients && <p>{recipe.ingredients}</p>}

            {/* Toggle Steps */}
            <button
              className={styles.toggleButton}
              onClick={(e) => {
                preventFlip(e);
                setShowSteps(!showSteps);
              }}
            >
              {showSteps ? "▾ Steps" : "▸ Steps"}
            </button>
            {showSteps && <p>{recipe.steps}</p>}

            {/* Toggle Comments */}
            <button
              className={styles.toggleButton}
              onClick={(e) => {
                preventFlip(e);
                setShowComments(!showComments);
              }}
            >
              {showComments ? "▾ Comments" : "▸ Comments"}
            </button>
            {showComments && (
              <div className={styles.commentsSection}>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <p>{comment.content}</p>
                      <p className={styles.commentAuthor}>
                        <em>— Chef: {comment.owner}</em>
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
                {/* Add Comment Section */}
                <div className={styles.addComment}>
                  <textarea
                    className={styles.commentInput}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onClick={preventFlip}
                  />
                  <button
                    className={buttonStyles.cardButton}
                    onClick={handleAddComment}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            )}

            {/* Like, Edit, and Delete Actions */}
            <div className={styles.actionsBack}>
              <button
                className={buttonStyles.cardButton}
                onClick={handleToggleLike}
              >
                {isLiked ? "Unlike" : "Like"}
              </button>
              {currentUser?.username === recipe.owner && (
                <>
                  <button
                    className={buttonStyles.cardButton}
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    className={buttonStyles.cardButton}
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* Display Recipe Owner */}
            <div className={styles.chefName}>
              <p>Created by: {recipe.owner}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.deleteConfirmModal}>
          <p>Are you sure you want to delete this recipe?</p>
          <button onClick={handleDelete}>Yes</button>
          <button onClick={() => setShowDeleteConfirm(false)}>No</button>
        </div>
      )}
    </div>
  );
};

// Prop Types for Type Checking
RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    short_description: PropTypes.string,
    cook_time: PropTypes.number,
    difficulty: PropTypes.string,
    ingredients: PropTypes.string,
    steps: PropTypes.string,
    image: PropTypes.string,
    likes_count: PropTypes.number,
    is_liked: PropTypes.bool,
    owner: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func,
};

export default RecipeCard;
