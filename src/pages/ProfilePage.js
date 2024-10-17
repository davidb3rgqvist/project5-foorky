import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import FilterSearchCard from "../components/FilterSearchCard";
import { Spinner, Alert } from "react-bootstrap";
import styles from "../styles/ProfilePage.module.css";
import buttonStyles from "../styles/Button.module.css";
import { useCurrentUser } from "../contexts/CurrentUserContext";

const ProfilePage = () => {
  const { profileId } = useParams();
  const currentUser = useCurrentUser();
  const [profile, setProfile] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [filters, setFilters] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followId, setFollowId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profileData } = await axios.get(
          `/profiles/${profileId}/`,
        );
        setProfile(profileData);

        const { data: recipeData } = await axios.get(
          `/recipes/by_profile/?profile_id=${profileId}`,
        );
        setRecipes(recipeData);
        setAllRecipes(recipeData);

        const { data: followers } = await axios.get(
          `/followers/?followed=${profileId}`,
        );

        const followRecord = followers.results.find(
          (f) => f.owner === currentUser?.username,
        );
        console.log(followRecord);
        if (followRecord) {
          setIsFollowing(true);
          setFollowId(followRecord.id);
        } else {
          setIsFollowing(false);
          setFollowId(null);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, currentUser]);

  const handleSearch = (searchQuery, filters) => {
    let filteredRecipes = [...allRecipes];

    if (searchQuery) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.difficulty === filters.difficulty,
      );
    }

    if (filters.cookTime === "quick") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.cook_time <= 30,
      );
    } else if (filters.cookTime === "long") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.cook_time >= 60,
      );
    }

    if (filters.sortBy === "az") {
      filteredRecipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === "latest") {
      filteredRecipes.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    }

    setRecipes(filteredRecipes);
  };

  const handleFollow = async () => {
    if (isFollowing) {
      console.log("Already following this user");
      return;
    }

    try {
      const response = await axios.post(
        `/followers/`,
        { followed: profileId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );
      setIsFollowing(true);
      setFollowId(response.data.id);
      setProfile((prevProfile) => ({
        ...prevProfile,
        followers_count: prevProfile.followers_count + 1,
      }));
      setAlertMessage("You are now following this profile!");
      setAlertVariant("success");
    } catch (error) {
      console.error("Error following the profile:", error);
      setAlertMessage("Failed to follow the profile.");
      setAlertVariant("danger");
    } finally {
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    }
  };

  const handleUnfollow = async () => {
    if (!isFollowing) {
      console.log("Not following this user yet");
      return;
    }

    try {
      if (followId) {
        await axios.delete(`/followers/${followId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setIsFollowing(false);
        setFollowId(null);
        setProfile((prevProfile) => ({
          ...prevProfile,
          followers_count: prevProfile.followers_count - 1,
        }));
        setAlertMessage("You have unfollowed this profile.");
        setAlertVariant("warning");
      }
    } catch (error) {
      console.error("Error unfollowing the profile:", error);
      setAlertMessage("Failed to unfollow the profile.");
      setAlertVariant("danger");
    } finally {
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    }
  };

  const handleToggleFollow = () => {
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  if (loading)
    return (
      <div className={styles.loaderContainer}>
        <Spinner animation="border" role="status">
          <span className="sr-only"></span>
        </Spinner>
      </div>
    );

  return (
    <div className={styles.profilePage}>
      {/* Alert Section */}
      {alertMessage && (
        <Alert
          variant={alertVariant}
          onClose={() => setAlertMessage(null)}
          dismissible
        >
          {alertMessage}
        </Alert>
      )}

      {/* Profile Card Section */}
      <div className={styles.profileCard}>
        <img
          src={profile.image}
          alt={profile.owner}
          className={styles.profileImage}
        />
        <h4>{profile.name || profile.owner}</h4>
        <p>{profile.content || "No bio available"}</p>
        <div className={styles.profileStats}>
          <strong>{profile.followers_count} Followers</strong>
          <strong>{profile.following_count} Following</strong>
          <strong>{profile.recipes_count} Recipes</strong>
        </div>

        {/* Follow/Unfollow Button */}
        <button
          onClick={handleToggleFollow}
          className={buttonStyles.followButton}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

      {/* Filter Search Card */}
      <FilterSearchCard
        handleSearch={handleSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Recipes Section */}
      <div className={styles.recipesSection}>
        <h3>{profile.name || profile.owner}'s Recipes</h3>
        <div className={styles.recipesGrid}>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
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
