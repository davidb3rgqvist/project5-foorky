import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/RightSidebar.module.css";

const RightSidebar = () => {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await axios.get("/profiles/");
        setProfiles(data.results);
      } catch (error) {
        console.error("Failed to fetch profiles", error);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className={styles.Sidebar}>
      <h3>Profiles to Follow</h3>
      {profiles.map(profile => (
        <div key={profile.id} className={styles.ProfileCard}>
          <img src={profile.image} alt={profile.username} />
          <h4>{profile.username}</h4>
          <p>{profile.followers_count} Followers</p>
          <button>Follow</button>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
