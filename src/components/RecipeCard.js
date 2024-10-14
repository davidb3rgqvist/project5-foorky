import axios from "axios";
import { useHistory } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/RecipeCard.module.css";
import buttonStyles from "../styles/Button.module.css";


const RecipeCard = ({ recipe, onUpdate, onDelete, onAddComment }) => {
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
  const history = useHistory();

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
    // if (!currentUser) {
    //   alert("You need to be logged in to like recipes!");
    //   return;
    // }

    const token = localStorage.getItem("authToken");

    // if (!token) {
    //   alert("You need to be logged in to like recipes!");
    //   return;
    // }

    // try {
      if (!isLiked) {
        // Send POST request to the likes endpoint
        await axios.post("/likes/", { recipe: recipe.id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      else {
        await axios.delete(`/likes/${recipe.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    
      // Toggle like status and update like count
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    // } catch (error) {
    //   console.error("Error updating like status:", error);
    //   alert("Failed to like the recipe. Please try again.");
    // }
  };

  const [comments, setComments] = useState([]);
  const fetchComments = async () => {
    try {
      const { data } = await axios.get("/comments/");
      
      const filteredComments = data.results.filter(comment => comment.recipe === recipe.id);
      
      setComments(filteredComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };
  
  useEffect(() => {
    
  
    if (recipe.id) {
      fetchComments();
    }
  }, [recipe.id]);
  
  const handleAddComment = async (event) => {
    preventFlip(event);
  
    // if (!currentUser) {
    //   alert("You need to be logged in to comment!");
    //   return;
    // }
  
    const token = localStorage.getItem("authToken");
  
    if (newComment.trim()) {
      try {

        await axios.post(
          `/comments/`,
          { recipe: recipe.id, content: newComment },
          // { headers: { Authorization: `Bearer ${token}` } }
        );

        setNewComment("");
  
        fetchComments();
      } catch (error) {
        console.error("Error adding comment:", error);
        alert("Failed to add comment. Please try again.");
      }
    }
  };
  const handleEditComment = async (commentId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.put(
        `/comments/${commentId}/`,
        { content: editCommentContent , recipe: recipe.id },
        // { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditCommentId(null);
      setEditCommentContent("");
      fetchComments();
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`/comments/${commentId}/`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
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
                              onChange={(e) => setEditCommentContent(e.target.value)}
                            />
                            <button className={buttonStyles.commentButton} onClick={() => handleEditComment(comment.id)}>Save</button>
                            <button className={buttonStyles.commentButton} onClick={() => setEditCommentId(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <p>{comment.content}</p>
                            <p className={styles.commentAuthor}><em>— Chef: {comment.owner}</em></p>
                          </>
                        )}
                        
                        {currentUser?.username === comment.owner && (
                          <>
                            <button className={buttonStyles.commentButton} onClick={() => {setEditCommentId(comment.id); setEditCommentContent(comment.content);}}>Edit</button>
                            <button className={buttonStyles.commentButton} onClick={() => handleDeleteComment(comment.id)}>Delete</button>
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
                  <button className={buttonStyles.commentButton} onClick={handleAddComment}>Add</button>
                </div>
              </div>
            )}

            <div className={styles.actionsBack}>
              <button className={buttonStyles.cardButton} onClick={handleLike}>
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              {currentUser?.username === recipe.owner && (
                <>
                  <button className={buttonStyles.cardButton} onClick={() => handleEdit(recipe)}>Edit</button>
                  <button className={buttonStyles.cardButton} onClick={confirmDelete}>Delete</button>
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