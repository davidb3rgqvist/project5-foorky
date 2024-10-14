import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import RecipeCard from "../components/RecipeCard";
import { Spinner } from "react-bootstrap";
import styles from "../styles/ProfilePage.module.css";
import buttonStyles from "../styles/Button.module.css";


const ProfilePage = () => {
  const { profileId } = useParams();
  const [profile, setProfile] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: profileData } = await axios.get(`/profiles/${profileId}/`);
        setProfile(profileData);
  
        const { data: recipeData } = await axios.get(`/recipes/by_profile/?profile_id=${profileId}`);
        setRecipes(recipeData);
  
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

  // Function to fetch more recipes (infinite scroll)
  const fetchMoreRecipes = async (page) => {
    try {
      const { data: recipeData } = await axios.get(`/recipes/?owner=${profile.owner}&page=${page}`);
      setRecipes((prevRecipes) => [...prevRecipes, ...recipeData.results]);
      setHasMore(!!recipeData.next);
    } catch (err) {
      console.error("Error fetching more recipes", err);
    }
  };

  // Infinite scrolling effect for fetching more recipes
  useEffect(() => {
    if (!loading && hasMore) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      if (observerRef.current) {
        observer.observe(observerRef.current);
      }

      return () => {
        if (observerRef.current) {
          observer.unobserve(observerRef.current);
        }
      };
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchMoreRecipes(currentPage);
    }
  }, [currentPage]);

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

  if (loading) return <div ref={observerRef} className={styles.loaderContainer}>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>;

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

      {/* Recipes Section */}
      <div className={styles.recipesSection}>
        <h3>{profile.owner}'s Recipes</h3>
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
