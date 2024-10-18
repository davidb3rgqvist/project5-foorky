import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Alert } from "react-bootstrap";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/RecipeCard.module.css";
import buttonStyles from "../styles/Button.module.css";

const RecipeCard = ({ recipe, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(recipe.likes_count || 0);
  const [isLiked, setIsLiked] = useState(recipe.is_liked);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");
  const [comments, setComments] = useState([]);

  const currentUser = useCurrentUser();
  const history = useHistory();
  const cardRef = useRef(null);

  const handleFlip = () => setIsFlipped(!isFlipped);
  const preventFlip = (e) => e.stopPropagation();

  const showAlert = (message, variant) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

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

  const handleToggleLike = () => {
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

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

  useEffect(() => {
    if (recipe.id) {
      fetchComments();
    }
  }, [recipe.id, fetchComments]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && isFlipped) {
        setIsFlipped(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFlipped]);

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

  const handleEditComment = async (commentId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `/comments/${commentId}/`,
        { content: editCommentContent, recipe: recipe.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditCommentId(null);
      setEditCommentContent("");
      fetchComments();
      showAlert("Comment updated successfully!", "success");
    } catch (error) {
      console.error("Error editing comment:", error);
      showAlert("Failed to edit comment. Please try again.", "danger");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`/comments/${commentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
      showAlert("Comment deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showAlert("Failed to delete comment. Please try again.", "danger");
    }
  };

  const handleEdit = (recipe) => {
    history.push({
      pathname: "/create-recipe",
      state: { recipe },
    });
  };

  const confirmDelete = (event) => {
    preventFlip(event);
    setShowDeleteConfirm(true);
  };

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
    <div ref={cardRef} className={`${styles.cardContainer}`} onClick={handleFlip}>
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
                <div>
                  {/* Comments List */}
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className={styles.commentItem}>
                        {editCommentId === comment.id ? (
                          <>
                            <input
                              type="text"
                              value={editCommentContent}
                              onChange={(e) =>
                                setEditCommentContent(e.target.value)
                              }
                            />
                            <button
                              className={buttonStyles.commentButton}
                              onClick={() => handleEditComment(comment.id)}
                            >
                              Save
                            </button>
                            <button
                              className={buttonStyles.commentButton}
                              onClick={() => setEditCommentId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <p>{comment.content}</p>
                            <p className={styles.commentAuthor}>
                              <em>— Chef: {comment.owner}</em>
                            </p>
                          </>
                        )}

                        {currentUser?.username === comment.owner && (
                          <>
                            <button
                              className={buttonStyles.commentButton}
                              onClick={() => {
                                setEditCommentId(comment.id);
                                setEditCommentContent(comment.content);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={buttonStyles.commentButton}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <hr className={styles.commentDivider} />
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
                <div className={styles.addComment}>
                  <input
                    type="text"
                    value={newComment}
                    placeholder="Add a comment..."
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={preventFlip}
                  />
                  <button
                    className={buttonStyles.commentButton}
                    onClick={handleAddComment}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

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
                    onClick={() => handleEdit(recipe)}
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
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onAddComment: PropTypes.func,
};

export default RecipeCard;
