import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import styles from "../styles/TopBar.module.css";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import buttonStyles from "../styles/Button.module.css";

const TopBar = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const history = useHistory();
  const currentUser = useCurrentUser();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await axios.get(`/profiles/?page=${currentPage}`);
        const filteredProfiles = data.results.filter(
          (profile) => profile.owner !== currentUser?.username,
        );
        setProfiles(filteredProfiles);
        setTotalPages(Math.ceil(data.count / 5));
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      }
    };

    fetchProfiles();
  }, [currentPage, currentUser]);

  const handleProfileClick = (profileId) => {
    history.push(`/profiles/${profileId}`);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={styles.topBar}>
      <Button
        variant="light"
        className={buttonStyles.arrowButton}
        onClick={prevPage}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>

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
          <img
            src={profile.image || "default-profile.jpg"}
            alt={profile.username || profile.name}
            className={styles.profileImage}
          />
          <p className={styles.profileName}>
            {profile.name || profile.username}
          </p>
        </div>
      ))}

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
