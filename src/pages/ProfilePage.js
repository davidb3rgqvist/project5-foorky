import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/profiles/${id}/`);
        setProfile(data);
        // Fetch recipes by this user
        const { data: recipesData } = await axios.get(`/recipes/?owner=${id}`);
        setRecipes(recipesData.results);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [id]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <img src={profile.profile_image} alt={profile.username} />
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      <p>Followers: {profile.followers_count}</p>

      <h3>Recipes</h3>
      <div>
        {recipes.map((recipe) => (
          <div key={recipe.id}>
            <h4>{recipe.title}</h4>
            <p>{recipe.short_description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
