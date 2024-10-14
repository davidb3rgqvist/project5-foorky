import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import styles from "../styles/TopBar.module.css";

const TopBar = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const history = useHistory();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await axios.get(`/profiles/?page=${currentPage}`);
        setProfiles(data.results);
        setTotalPages(Math.ceil(data.count / 5)); 
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      }
    };

    fetchProfiles();
  }, [currentPage]);

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
      <Button variant="light" className={styles.arrowButton} onClick={prevPage} disabled={currentPage === 1}>
        &lt;
      </Button>

      {profiles.map((profile) => (
        <div key={profile.id} className={styles.profileItem}>
          <img
            src={profile.image || "default-profile.jpg"}
            alt={profile.username}
            className={styles.profileImage}
            onClick={() => handleProfileClick(profile.id)}
          />
          <p className={styles.profileName}>{profile.username}</p>
        </div>
      ))}

      <Button variant="light" className={styles.arrowButton} onClick={nextPage} disabled={currentPage === totalPages}>
        &gt;
      </Button>
    </div>
  );
};

export default TopBar;
