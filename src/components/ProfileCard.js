import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import styles from "../styles/ProfileCard.module.css";
import { useHistory } from "react-router-dom";
import buttonStyles from "../styles/Button.module.css";
import { useCurrentUser } from "../contexts/CurrentUserContext";

const ProfileCard = ({
  profileData,
  onProfileUpdate,
  onProfileDelete,
  setAlertMessage,
}) => {
  // State for handling success and error messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get current logged-in user
  const currentUser = useCurrentUser();
  const history = useHistory();

  // State to control editing mode
  const [isEditing, setIsEditing] = useState(false);

  // State for handling updated profile data
  const [updatedProfileData, setUpdatedProfileData] = useState({
    name: profileData.name,
    content: profileData.content,
    image: null,
  });

  // State for handling image preview
  const [imagePreview, setImagePreview] = useState(
    profileData.image || "/path-to-default/default-profile.jpg"
  );

  // Update the image preview when the profile image changes
  useEffect(() => {
    setImagePreview(profileData.image || "/path-to-default/default-profile.jpg");
  }, [profileData.image]);

  // Handle file input changes and update the image preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setImagePreview(fileURL);  // Show preview of selected image
      setUpdatedProfileData({ ...updatedProfileData, image: file });
    }
  };

  // Handle profile editing and form submission
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData();
    formData.append("name", updatedProfileData.name);
    formData.append("content", updatedProfileData.content);
    if (updatedProfileData.image) {
      formData.append("image", updatedProfileData.image);
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `/profiles/${profileData.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMessage("Profile updated successfully!");  // Success message
      onProfileUpdate(response.data);  // Update profile in parent component
      setIsEditing(false);
      setTimeout(() => {
        setSuccessMessage("");  // Clear success message after 3 seconds
      }, 3000);
    } catch (error) {
      console.error("Error updating profile", error);
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    setErrorMessage("");

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/profiles/${profileData.id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Profile deleted successfully.");
      onProfileDelete();  // Notify parent of profile deletion
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      history.push("/");  // Redirect to home after deletion
    } catch (error) {
      console.error("Error deleting profile", error);
      setErrorMessage("Failed to delete profile.");
    }
  };

  return (
    <div className={styles.cardContainer}>
      <Card.Body className={styles.cardBody}>
        {/* Display error or success messages */}
        {errorMessage && (
          <Alert variant="danger" className={styles.errorMessage}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert variant="success" className={styles.successMessage}>
            {successMessage}
          </Alert>
        )}

        {/* Profile information */}
        <div className="text-center">
          <Card.Img
            variant="top"
            src={imagePreview}
            alt={`${profileData.name}'s profile`}
            className={styles.cardImage}
          />
          <Card.Title className={styles.cardTitle}>
            {profileData.name}
          </Card.Title>
          <Card.Text className={styles.cardText}>
            {profileData.content || "No bio available"}
          </Card.Text>

          {/* Display profile statistics */}
          <div className={styles.cardStats}>
            <div>
              <strong>{profileData.followers_count}</strong>
              <p>Followers</p>
            </div>
            <div>
              <strong>{profileData.following_count}</strong>
              <p>Following</p>
            </div>
            <div>
              <strong>{profileData.recipes_count}</strong>
              <p>Recipes</p>
            </div>
          </div>
        </div>

        {/* Allow profile owner to edit or delete the profile */}
        {currentUser?.username === profileData.owner && (
          <div className={buttonStyles.buttonGroup}>
            {isEditing ? (
              <form onSubmit={handleEditProfile} className={styles.editForm}>
                <input
                  type="text"
                  className={styles.formControl}
                  value={updatedProfileData.name}
                  onChange={(e) =>
                    setUpdatedProfileData({
                      ...updatedProfileData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Name"
                />
                <textarea
                  className={styles.formControl}
                  value={updatedProfileData.content}
                  onChange={(e) =>
                    setUpdatedProfileData({
                      ...updatedProfileData,
                      content: e.target.value,
                    })
                  }
                  placeholder="Bio"
                />

                {/* Hidden file input */}
                <input
                  type="file"
                  id="fileInput"
                  className={styles.formControl}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Button to trigger file input */}
                <Button
                  onClick={() => document.getElementById("fileInput").click()}
                  className={buttonStyles.cardButton}
                >
                  Upload New Image
                </Button>

                <Button type="submit" className={buttonStyles.cardButton}>
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className={`${buttonStyles.cardButton} ${buttonStyles.cardButton}`}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className={`${buttonStyles.cardButton} me-2`}
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={handleDeleteProfile}
                  className={`${buttonStyles.cardButton} ${buttonStyles.cardButton}`}
                >
                  Delete Profile
                </Button>
              </>
            )}
          </div>
        )}
      </Card.Body>
    </div>
  );
};

export default ProfileCard;
