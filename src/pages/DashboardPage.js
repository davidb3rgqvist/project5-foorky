import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import ProfileCard from "../components/ProfileCard";
import FilterSearchCard from "../components/FilterSearchCard";
import { Spinner, Alert } from "react-bootstrap";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const [userRecipes, setUserRecipes] = useState([]);
  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    if (!currentUser || !currentUser.profile_id) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch profile data
        const { data: profile } = await axios.get(`/profiles/${currentUser.profile_id}/`);
        setProfileData(profile);

        // Fetch the user's own recipes
        const { data: recipes } = await axios.get("/recipes/");
        const filteredRecipes = recipes.results.filter(
          (recipe) => recipe.owner === currentUser.username
        );
        setUserRecipes(filteredRecipes);
        setAllUserRecipes(filteredRecipes);

        // Fetch the user's liked recipes
        await fetchLikedRecipes();
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch liked recipes by the logged-in user from ranked-liked-recipes endpoint
    const fetchLikedRecipes = async () => {
      try {
        const { data: likedRecipesData } = await axios.get("/ranked-liked-recipes/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });

        setLikedRecipes(likedRecipesData);
      } catch (error) {
        console.error("Error fetching liked recipes", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSearch = (searchQuery, filters) => {
    let filteredRecipes = [...allUserRecipes];

    if (searchQuery) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.difficulty === filters.difficulty
      );
    }

    if (filters.cookTime === "quick") {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.cook_time <= 30);
    } else if (filters.cookTime === "long") {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.cook_time >= 60);
    }

    if (filters.sortBy === "az") {
      filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "latest") {
      filteredRecipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setUserRecipes(filteredRecipes);
  };

  const handleDeleteRecipe = (recipeId) => {
    setUserRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));

    setAlertMessage("Recipe deleted successfully!");
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfileData(updatedProfile);
  };

  const handleProfileDelete = () => {
    window.location.href = "/login";
  };

  if (!currentUser) {
    return <div>Error: User not logged in</div>;
  }

  return (
    <div className={styles.Dashboard}>

      {/* Loading Spinner */}
      {loading && (
        <div className={styles.loaderContainer}>
          <Spinner animation="border" role="status">
            <span className="sr-only"></span>
          </Spinner>
        </div>
      )}

      {!loading && (
        <>
          {/* ProfileCard Section */}
          <ProfileCard
            profileData={profileData}
            currentUser={currentUser}
            onProfileUpdate={handleProfileUpdate}
            onProfileDelete={handleProfileDelete}
          />

          {/* FilterSearchCard Section */}
          <div className={styles.FilterContainer}>
            <FilterSearchCard handleSearch={handleSearch} filters={filters} setFilters={setFilters} />
          </div>

          {/* Success Alert for recipe deletion */}
          {alertMessage && (
            <Alert variant="success" onClose={() => setAlertMessage(null)} dismissible>
              {alertMessage}
            </Alert>
          )}

          {/* User's Created Recipes */}
          <div className={styles.RecipesSection}>
            <h3>Your Created Recipes</h3>
            <div className={styles.recipeGrid}>
              {userRecipes.length > 0 ? (
                userRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDeleteRecipe} />
                ))
              ) : (
                <p>No recipes found.</p>
              )}
            </div>
          </div>

          {/* Liked Recipes */}
          <div className={styles.LikedRecipesSection}>
            <h3>Your Liked Recipes</h3>
            <div className={styles.recipeGrid}>
              {likedRecipes.length > 0 ? (
                likedRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))
              ) : (
                <p>No liked recipes found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
