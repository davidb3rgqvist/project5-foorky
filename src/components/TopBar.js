import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import styles from "../styles/TopBar.module.css";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import buttonStyles from "../styles/Button.module.css";

// TopBar component for displaying a list of user profiles with pagination
const TopBar = () => {
  // State variables to manage profiles, current page, and total number of pages
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // useHistory hook for navigation and current user context
  const history = useHistory();
  const currentUser = useCurrentUser();

  // Fetch profiles when the component mounts or when currentPage or currentUser changes
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // API request to get profiles for the current page
        const { data } = await axios.get(`/profiles/?page=${currentPage}`);
        
        // Filter out the current user's profile from the list
        const filteredProfiles = data.results.filter(
          (profile) => profile.owner !== currentUser?.username
        );
        
        // Update the profiles state and calculate total pages based on the response
        setProfiles(filteredProfiles);
        setTotalPages(Math.ceil(data.count / 5)); // Assuming 5 profiles per page
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      }
    };

    fetchProfiles();
  }, [currentPage, currentUser]);

  // Navigate to the selected profile's page
  const handleProfileClick = (profileId) => {
    history.push(`/profiles/${profileId}`);
  };

  // Go to the next page if it exists
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Go to the previous page if it exists
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={styles.topBar}>
      {/* Previous page button, disabled if on the first page */}
      <Button
        variant="light"
        className={buttonStyles.arrowButton}
        onClick={prevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>

      {/* Display the list of profile items */}
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className={styles.profileItem}
          role="button"
          tabIndex={0}
          onClick={() => handleProfileClick(profile.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleProfileClick(profile.id);
          }}
        >
          {/* Profile image, fallback to a default image if none is available */}
          <img
            src={profile.image || "default-profile.jpg"}
            alt={profile.username || profile.name}
            className={styles.profileImage}
          />
          {/* Profile name or username */}
          <p className={styles.profileName}>
            {profile.name || profile.username}
          </p>
        </div>
      ))}

      {/* Next page button, disabled if on the last page */}
      <Button
        variant="light"
        className={buttonStyles.arrowButton}
        onClick={nextPage}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Button>
    </div>
  );
};

export default TopBar;
