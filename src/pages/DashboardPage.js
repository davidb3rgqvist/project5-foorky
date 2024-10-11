import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import axios from "axios";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const [userRecipes, setUserRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Ensure currentUser exists and has an id
    if (!currentUser?.id) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch profile information
        const { data: profile } = await axios.get(`/profiles/${currentUser.id}/`);
        setProfileData(profile);

        // Fetch user's created recipes
        const { data: recipes } = await axios.get("/recipes/", {
          params: { owner: currentUser.id },
        });
        setUserRecipes(recipes.results);

        // Fetch liked recipes
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

  // Handle profile image change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({ ...profileData, image: file });
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", profileData.name);
    formData.append("bio", profileData.bio);
    if (profileData.image) {
      formData.append("image", profileData.image);
    }

    try {
      const response = await axios.put(`/profiles/${currentUser.id}/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileData(response.data);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Failed to update profile.");
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await axios.delete(`/profiles/${currentUser.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        alert("Profile deleted successfully.");
      } catch (error) {
        console.error("Error deleting profile", error);
        alert("Failed to delete profile.");
      }
    }
  };

  // Display loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      {/* Profile Information */}
      <div className={styles.ProfileSection}>
        {isEditing ? (
          <form onSubmit={handleProfileUpdate}>
            <input
              type="text"
              name="name"
              value={profileData.name || ""}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Name"
            />
            <textarea
              name="bio"
              value={profileData.bio || ""}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Bio"
            />
            <input type="file" onChange={handleFileChange} />
            <button type="submit">Save Changes</button>
          </form>
        ) : (
          <>
            <h2>{currentUser?.username}'s Dashboard</h2>
            <img
              src={profileData.image || "default-profile.jpg"}
              alt="Profile"
              className={styles.ProfileImage}
            />
            <p>{profileData.bio || "No bio available"}</p>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </>
        )}
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
        <button onClick={() => document.getElementById("fileInput").click()}>
          Update Profile Image
        </button>
        <button onClick={handleDeleteProfile}>Delete Profile</button>
      </div>
    </div>
  );
};

export default DashboardPage;
