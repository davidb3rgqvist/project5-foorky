import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/ProfileCard.module.css";
import buttonStyles from "../styles/Button.module.css";

const ProfileCard = ({
  profileData,
  onProfileUpdate,
  onProfileDelete,
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
    name: profileData.name || "",
    content: profileData.content || "",
    image: null,
    email: profileData.email || "", // Email is optional
    age: profileData.age || "", // Age is optional
  });

  // Handler for real-time validation of age
  const handleAgeChange = (e) => {
    const age = e.target.value;
    if (age && (age <= 0 || age > 120)) {
      setErrorMessage("Age must be between 1 and 120.");
    } else {
      setErrorMessage("");
    }
    setUpdatedProfileData({ ...updatedProfileData, age });
  };

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
      setImagePreview(fileURL); // Show preview of selected image
      setUpdatedProfileData({ ...updatedProfileData, image: file });
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    if (email.trim() === "") return true; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle profile editing and form submission
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate email
    if (!validateEmail(updatedProfileData.email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    // Validate age (allow empty age)
    const age = Number(updatedProfileData.age);
    if (updatedProfileData.age && (isNaN(age) || age <= 0 || age > 120)) {
      setErrorMessage("Please enter a valid age between 1 and 120.");
      return;
    }

    const formData = new FormData();
    formData.append("name", updatedProfileData.name);
    formData.append("content", updatedProfileData.content);
    formData.append("email", updatedProfileData.email);
    formData.append("age", updatedProfileData.age);

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
      setSuccessMessage("Profile updated successfully!");
      onProfileUpdate(response.data);
      setIsEditing(false);
      setTimeout(() => {
        setSuccessMessage("");
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
      onProfileDelete();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      history.push("/");
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
                <input
                  type="email"
                  className={styles.formControl}
                  value={updatedProfileData.email}
                  onChange={(e) =>
                    setUpdatedProfileData({
                      ...updatedProfileData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email (optional)"
                />
                <input
                  type="number"
                  className={styles.formControl}
                  value={updatedProfileData.age}
                  onChange={handleAgeChange}
                  placeholder="Age (optional)"
                  min="1"
                  max="120"
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
                  className={`${buttonStyles.cardButton} ${buttonStyles.cancelButton}`}
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
                  className={`${buttonStyles.cardButton} ${buttonStyles.cancelButton}`}
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

ProfileCard.propTypes = {
  profileData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string,
    email: PropTypes.string,
    age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    image: PropTypes.string,
    followers_count: PropTypes.number,
    following_count: PropTypes.number,
    recipes_count: PropTypes.number,
    owner: PropTypes.string.isRequired,
  }).isRequired,
  onProfileUpdate: PropTypes.func.isRequired,
  onProfileDelete: PropTypes.func.isRequired,
  setAlertMessage: PropTypes.func,
};

export default ProfileCard;
