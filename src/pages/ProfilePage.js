import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import styles from "../styles/ProfilePage.module.css"; // Ensure styles are imported

const ProfilePage = () => {
  const { profileId } = useParams(); // Grab profileId from URL
  const [profile, setProfile] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData } = await axios.get(`/profiles/${profileId}/`);
        setProfile(profileData);

        const { data: recipeData } = await axios.get(`/profiles/${profileId}/recipes/`);
        setRecipes(recipeData.results);

        const { data: followers } = await axios.get(`/followers/?followed=${profileId}`);
        setIsFollowing(followers.some((f) => f.owner === profileData.owner));
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const handleFollow = async () => {
    try {
      await axios.post(`/followers/`, { followed: profileId });
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following the profile", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const { data: followers } = await axios.get(`/followers/?followed=${profileId}`);
      const followId = followers.find((f) => f.owner === profile.owner).id;
      await axios.delete(`/followers/${followId}/`);
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing the profile", error);
    }
  };

  if (loading) return <div>Loading...</div>;

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
          <button onClick={handleUnfollow} className={styles.followButton}>
            Unfollow
          </button>
        ) : (
          <button onClick={handleFollow} className={styles.followButton}>
            Follow
          </button>
        )}
      </div>

      {/* Recipes Section */}
      <div className={styles.recipesSection}>
        <h3>{profile.owner}'s Recipes</h3>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
