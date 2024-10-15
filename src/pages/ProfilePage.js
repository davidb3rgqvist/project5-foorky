import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import FilterSearchCard from "../components/FilterSearchCard"; // Import the FilterSearchCard
import { Spinner } from "react-bootstrap";
import styles from "../styles/ProfilePage.module.css";
import buttonStyles from "../styles/Button.module.css";

const ProfilePage = () => {
  const { profileId } = useParams();
  const [profile, setProfile] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]); // Store all recipes for resetting filters
  const [filters, setFilters] = useState({}); // Add filters state
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profileData } = await axios.get(`/profiles/${profileId}/`);
        setProfile(profileData);

        const { data: recipeData } = await axios.get(`/recipes/by_profile/?profile_id=${profileId}`);
        setRecipes(recipeData);
        setAllRecipes(recipeData); // Keep all recipes to reset later

        const { data: followers } = await axios.get(`/followers/?followed=${profileId}`);
        setIsFollowing(followers.some((f) => f.owner === profileData.owner));
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  // Filter the recipes based on the search query and selected filters
  const handleSearch = (searchQuery, filters) => {
    let filteredRecipes = [...allRecipes];

    if (searchQuery) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    if (filters.cookTime === "quick") {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cook_time <= 30);
    } else if (filters.cookTime === "long") {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cook_time >= 60);
    }

    if (filters.sortBy === "az") {
      filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "latest") {
      filteredRecipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setRecipes(filteredRecipes);
  };

  // Handle following a user
  const handleFollow = async () => {
    try {
      await axios.post(`/followers/`, { followed: profileId });
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following the profile", error);
    }
  };

  // Handle unfollowing a user
  const handleUnfollow = async () => {
    try {
      const { data: followers } = await axios.get(`/followers/?followed=${profileId}`);
      const followId = followers.find(f => f.owner === profile.owner).id;
      await axios.delete(`/followers/${followId}/`);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing the profile", error);
    }
  };

  if (loading) return (
    <div className={styles.loaderContainer}>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  return (
    <div className={styles.profilePage}>
      {/* Profile Card Section */}
      <div className={styles.profileCard}>
        <img src={profile.image} alt={profile.owner} className={styles.profileImage} />
        <h4>{profile.name || profile.owner}</h4>
        <p>{profile.content || "No bio available"}</p>
        <div className={styles.profileStats}>
          <strong>{profile.followers_count} Followers</strong>
          <strong>{profile.following_count} Following</strong>
          <strong>{profile.recipes_count} Recipes</strong>
        </div>

        {/* Follow/Unfollow Button */}
        {isFollowing ? (
          <button onClick={handleUnfollow} className={buttonStyles.followButton}>
            Unfollow
          </button>
        ) : (
          <button onClick={handleFollow} className={buttonStyles.followButton}>
            Follow
          </button>
        )}
      </div>

      {/* Filter Search Card */}
      <FilterSearchCard
        handleSearch={handleSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Recipes Section */}
      <div className={styles.recipesSection}>
        <h3>{profile.owner}'s Recipes</h3>
        <div className={styles.recipesGrid}>
          {recipes.length > 0 ? (
            recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
