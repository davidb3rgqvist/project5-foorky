import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RightSidebar = () => {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await axios.get('/profiles/');
        setProfiles(data.results);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfiles();
  }, []);

  const handleFollow = async (profileId) => {
    try {
      await axios.post(`/followers/${profileId}/`);
      // Update UI or state here if needed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sidebar-right">
      <h3>Profiles to Follow</h3>
      {profiles.map((profile) => (
        <div key={profile.id}>
          <img src={profile.profile_image} alt={profile.username} />
          <p>{profile.username}</p>
          <p>Followers: {profile.followers_count}</p>
          <button onClick={() => handleFollow(profile.id)}>Follow</button>
          <Link to={`/profiles/${profile.id}`}>View Profile</Link>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
