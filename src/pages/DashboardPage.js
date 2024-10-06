import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import axios from "axios";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser(); // Access the current user context
  const [userRecipes, setUserRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch the user's profile information
        const { data: profile } = await axios.get(`/profiles/${currentUser.id}/`);
        setProfileData(profile);

        // Fetch the user's created recipes
        const { data: recipes } = await axios.get("/recipes/", {
          params: { owner: currentUser.id },
        });
        setUserRecipes(recipes.results);

        // Fetch the user's liked recipes
        const { data: likes } = await axios.get("/likes/");
        setLikedRecipes(likes.results);
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      {/* Profile Information */}
      <div className={styles.ProfileSection}>
        <h2>{currentUser.username}'s Dashboard</h2>
        <img
          src={profileData.image || "default-profile.jpg"}
          alt="Profile"
          className={styles.ProfileImage}
        />
        <p>Bio: {profileData.bio || "No bio available"}</p>
        <p>Total Likes on All Recipes: {profileData.total_likes || 0}</p>
        <p>Total Followers: {profileData.total_followers || 0}</p>
      </div>

      {/* User's Created Recipes */}
      <div className={styles.RecipesSection}>
        <h3>Your Created Recipes</h3>
        {userRecipes.length > 0 ? (
          userRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.RecipeCard}>
              <img src={recipe.image || "default-recipe.jpg"} alt={recipe.title} />
              <h4>{recipe.title}</h4>
              <p>{recipe.short_description}</p>
            </div>
          ))
        ) : (
          <p>You haven't created any recipes yet.</p>
        )}
      </div>

      {/* Liked Recipes */}
      <div className={styles.LikedRecipesSection}>
        <h3>Your Liked Recipes</h3>
        {likedRecipes.length > 0 ? (
          likedRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.RecipeCard}>
              <img src={recipe.image || "default-recipe.jpg"} alt={recipe.title} />
              <h4>{recipe.title}</h4>
              <p>{recipe.short_description}</p>
            </div>
          ))
        ) : (
          <p>You haven't liked any recipes yet.</p>
        )}
      </div>

      {/* Profile Management */}
      <div className={styles.ProfileManagement}>
        <h3>Manage Your Profile</h3>
        <button>Edit Profile</button>
        <button>Update Profile Image</button>
        <button>Delete Profile</button>
      </div>
    </div>
  );
};

export default DashboardPage;
