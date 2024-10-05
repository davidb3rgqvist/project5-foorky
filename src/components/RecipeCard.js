import React, { useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext"; // Import the context hook
import styles from "../styles/RecipeCard.module.css";

const RecipeCard = ({ recipe, onUpdate, onDelete, onAddComment, onEditComment }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [likes, setLikes] = useState(recipe.likes_count || 0);
  const [isLiked, setIsLiked] = useState(recipe.is_liked);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);
  const [showSteps, setShowSteps] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [focusMode, setFocusMode] = useState(false); // State to manage focus mode

  const currentUser = useCurrentUser();

  // Flip the card when the card itself (not interactive elements) is clicked
  const handleFlip = (e) => {
    if (!focusMode) { // Prevent flip in focus mode
      setIsFlipped(!isFlipped);
    }
  };

  // Prevent card flip on interactive elements
  const preventFlip = (e) => {
    e.stopPropagation();
  };

  const handleLike = (event) => {
    preventFlip(event);
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
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

  const handleAddComment = (event) => {
    preventFlip(event);
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleEditComment = (event, commentId, content) => {
    preventFlip(event);
    setEditingCommentId(commentId);
    setEditingContent(content);
  };

  const handleSaveComment = (event, commentId) => {
    preventFlip(event);
    onEditComment(commentId, editingContent);
    setEditingCommentId(null);
  };

  // Handle focus mode
  const enterFocusMode = (event) => {
    preventFlip(event);
    setFocusMode(true);
  };

  const exitFocusMode = (event) => {
    preventFlip(event);
    setFocusMode(false);
  };

  return (
    <div className={`${styles.cardContainer} ${focusMode ? styles.focusMode : ""}`} onClick={handleFlip}>
      <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ""}`}>
        {/* Front Side of the Card */}
        <div className={styles.cardFront}>
          <img src={recipe.image} alt={recipe.title} className={styles.cardImage} />
          <div className={styles.cardContent}>
            <h2 className={styles.recipeTitle}>{recipe.title}</h2>
            <p><strong>Cook Time:</strong> {recipe.cook_time} mins</p>
            <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
            <p className={styles.shortDescription}>{recipe.short_description}</p>
            {/* Show like count on the front without the like button */}
            <p><strong>Likes:</strong> {likes}</p>
          </div>
        </div>

        {/* Back Side of the Card */}
        <div className={styles.cardBack}>
          <div className={styles.cardBackContent} onClick={preventFlip}>
            {/* Toggleable Section: Ingredients */}
            <h3 onClick={() => setShowIngredients(!showIngredients)}>
              {showIngredients ? "▾ Ingredients" : "▸ Ingredients"}
            </h3>
            {showIngredients && <p>{recipe.ingredients}</p>}

            {/* Toggleable Section: Steps */}
            <h3 onClick={() => setShowSteps(!showSteps)}>
              {showSteps ? "▾ Steps" : "▸ Steps"}
            </h3>
            {showSteps && <p>{recipe.steps}</p>}

            {/* Toggleable Section: Comments */}
            <h3 onClick={() => setShowComments(!showComments)}>
              {showComments ? "▾ Comments" : "▸ Comments"}
            </h3>
            {showComments && (
              <div className={styles.commentsSection}>
                {/* Display comments */}
                {recipe.comments && recipe.comments.length > 0 ? (
                  recipe.comments.map((comment, index) => (
                    <div key={index} className={styles.comment}>
                      {editingCommentId === comment.id ? (
                        <>
                          <input
                            type="text"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onClick={preventFlip} // Prevent flipping when interacting with input
                          />
                          <button onClick={(event) => handleSaveComment(event, comment.id)}>
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <p><strong>{comment.owner}:</strong> {comment.content}</p>
                          {currentUser?.username === comment.owner && (
                            <button onClick={(event) => handleEditComment(event, comment.id, comment.content)}>
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}

                {/* Add new comment */}
                <div className={styles.addComment}>
                  <input
                    type="text"
                    value={newComment}
                    placeholder="Add a comment..."
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={preventFlip} // Prevent flip when adding a comment
                  />
                  <button onClick={handleAddComment}>Add</button>
                </div>
              </div>
            )}

            <div className={styles.actionsBack}>
              {/* Show like button on the backside */}
              <button className={styles.likeButton} onClick={handleLike}>
                {isLiked ? 'Unlike' : 'Like'} ({likes})
              </button>

              {/* Only show Update and Delete buttons if the current user is the owner */}
              {currentUser?.username === recipe.owner && (
                <>
                  <button className={styles.updateButton} onClick={(event) => onUpdate(recipe.id)}>
                    Update
                  </button>
                  <button className={styles.deleteButton} onClick={confirmDelete}>
                    Delete
                  </button>
                </>
              )}

              {/* Focus Mode Button */}
              {!focusMode ? (
                <button className={styles.focusButton} onClick={enterFocusMode}>
                  Enter Focus Mode
                </button>
              ) : (
                <button className={styles.exitFocusButton} onClick={exitFocusMode}>
                  Exit Focus Mode
                </button>
              )}
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
