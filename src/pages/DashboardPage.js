import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import ProfileCard from "../components/ProfileCard";
import FilterSearchCard from "../components/FilterSearchCard";
import { Spinner } from "react-bootstrap";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const [userRecipes, setUserRecipes] = useState([]);
  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

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
        const filteredRecipes = recipes.results.filter(
          (recipe) => recipe.owner === currentUser.username
        );
        setUserRecipes(filteredRecipes);
        setAllUserRecipes(filteredRecipes);

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
        const likedRecipes = likes.results.map((like) => like.recipe);
        setLikedRecipes(likedRecipes);
      } catch (error) {
        console.error("Error fetching liked recipes", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Filter the recipes based on the search query and selected filters
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
      {/* Loading Spinner */}
      {loading && (
        <div className={styles.loaderContainer}>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* Content displayed after loading */}
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

          {/* User's Created Recipes */}
          <div className={styles.RecipesSection}>
            <h3>Your Created Recipes</h3>
            <div className={styles.recipeGrid}>
              {userRecipes.length > 0 ? (
                userRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
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
                <p>You haven't liked any recipes yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
