import React, { useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import styles from '../styles/ProfileCard.module.css';
import { useCurrentUser } from "../contexts/CurrentUserContext";


const ProfileCard = ({ profileData, onProfileUpdate, onProfileDelete }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const currentUser = useCurrentUser();
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfileData, setUpdatedProfileData] = useState({
    name: profileData.name,
    content: profileData.content,
    image: profileData.image,
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUpdatedProfileData({ ...updatedProfileData, image: file });
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("name", updatedProfileData.name);
    formData.append("content", updatedProfileData.content);
    if (updatedProfileData.image) {
      formData.append("image", updatedProfileData.image);
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(`/profiles/${profileData.id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage("Profile updated successfully!");
      onProfileUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/profiles/${profileData.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Profile deleted successfully.");
      onProfileDelete();
    } catch (error) {
      console.error("Error deleting profile", error);
      setErrorMessage("Failed to delete profile.");
    }
  };

  return (
    <div className={styles.cardContainer}>
      <Card.Body className={styles.cardBody}>
        {errorMessage && <Alert className={styles.errorMessage}>{errorMessage}</Alert>}
        {successMessage && <Alert className={styles.successMessage}>{successMessage}</Alert>}

        <div className="text-center">
          <Card.Img
            variant="top"
            src={profileData.image || "default-profile.jpg"}
            alt={`${profileData.name}'s profile`}
            className={styles.cardImage}
          />
          <Card.Title className={styles.cardTitle}>{profileData.name}</Card.Title>
          <Card.Text className={styles.cardText}>{profileData.content || "No bio available"}</Card.Text>
          <div className={styles.cardStats}>
            <div>
              <strong>{profileData.followers_count}</strong>
              <p>Followers</p>
            </div>
            <div>
              <strong>{profileData.recipes_count}</strong>
              <p>Recipes</p>
            </div>
          </div>
        </div>

        {currentUser?.username === profileData.owner && (
          <div className={styles.buttonGroup}>
            {isEditing ? (
              <form onSubmit={handleEditProfile} className={styles.editForm}>
                <input
                  type="text"
                  className={styles.formControl}
                  value={updatedProfileData.name}
                  onChange={(e) => setUpdatedProfileData({ ...updatedProfileData, name: e.target.value })}
                  placeholder="Name"
                />
                <textarea
                  className={styles.formControl}
                  value={updatedProfileData.content}
                  onChange={(e) => setUpdatedProfileData({ ...updatedProfileData, content: e.target.value })}
                  placeholder="Bio"
                />
                <input type="file" className={styles.formControl} onChange={handleFileChange} />
                <Button type="submit" className={styles.button}>Save</Button>
                <Button onClick={() => setIsEditing(false)} className={`${styles.button} ${styles.secondary}`}>Cancel</Button>
              </form>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className={`${styles.button} me-2`}>Edit Profile</Button>
                <Button onClick={handleDeleteProfile} className={`${styles.button} ${styles.danger}`}>Delete Profile</Button>
              </>
            )}
          </div>
        )}
      </Card.Body>
    </div>
  );
};

export default ProfileCard;
