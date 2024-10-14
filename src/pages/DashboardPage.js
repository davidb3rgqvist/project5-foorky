import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import ProfileCard from "../components/ProfileCard";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const [userRecipes, setUserRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentUser.profile_id) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch profile information
        const { data: profile } = await axios.get(`/profiles/${currentUser.profile_id}/`);
        setProfileData(profile);

        // Fetch user's created recipes
        const { data: recipes } = await axios.get("/recipes/");
        const filteredRecipes = recipes.results.filter(recipe => recipe.owner === currentUser.username);
        setUserRecipes(filteredRecipes);

        // Fetch user's liked recipes
        await fetchLikedRecipes();
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikedRecipes = async () => {
      try {
        const { data: likes } = await axios.get("/likes/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        const likedRecipes = likes.results.map(like => like.recipe);
        setLikedRecipes(likedRecipes);
      } catch (error) {
        console.error("Error fetching liked recipes", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Handle profile update
  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  // Handle profile deletion
  const handleProfileDelete = () => {
    window.location.href = "/login";
  };

  if (!currentUser) {
    return <div>Error: User not logged in</div>;
  }

  return (
    <div className={styles.Dashboard}>
      {/* ProfileCard Section */}
      <ProfileCard
        profileData={profileData}
        currentUser={currentUser}
        onProfileUpdate={handleProfileUpdate}
        onProfileDelete={handleProfileDelete}
      />

      {/* User's Created Recipes */}
      <div className={styles.RecipesSection}>
        <h3>Your Created Recipes</h3>
        {userRecipes.length > 0 ? (
          userRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
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
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p>You haven't liked any recipes yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
