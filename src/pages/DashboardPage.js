import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import styles from "../styles/DashboardPage.module.css";

const DashboardPage = () => {
  const currentUser = useCurrentUser();
  const [profile, setProfile] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
      fetchUserRecipes();
      fetchLikedRecipes();
    }
  }, [currentUser]);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`/profiles/${currentUser.profile_id}/`);
      setProfile(data);
      setBio(data.content);
      setFollowersCount(data.followers_count);
    } catch (error) {
      console.error("Error fetching profile data", error);
    }
  };

  // Fetch user-created recipes
  const fetchUserRecipes = async () => {
    try {
      const { data } = await axios.get(`/recipes/?owner=${currentUser.username}`);
      setRecipes(data.results);

      // Calculate combined like count from all recipes
      const totalLikes = data.results.reduce((acc, recipe) => acc + recipe.likes_count, 0);
      setLikesCount(totalLikes);
    } catch (error) {
      console.error("Error fetching user recipes", error);
    }
  };

  // Fetch liked recipes
  const fetchLikedRecipes = async () => {
    try {
      const { data } = await axios.get(`/likes/?owner=${currentUser.username}`);
      setLikedRecipes(data.results);
    } catch (error) {
      console.error("Error fetching liked recipes", error);
    }
  };

  // Handle profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("content", bio);
    if (image) formData.append("image", image);

    try {
      await axios.put(`/profiles/${profile.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <Container>
      <Row>
        {/* Profile section */}
        <Col md={4}>
          <Card className={styles.profileCard}>
            <Card.Body>
              <Image src={profile.image} roundedCircle className={styles.profileImage} />
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group>
                  <Form.Label>Update Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Update Profile Picture</Form.Label>
                  <Form.File
                    label="Choose a new profile image"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Stats section */}
        <Col md={8}>
          <Row>
            <Col md={6}>
              <Card className={styles.statCard}>
                <Card.Body>
                  <h4>Total Likes</h4>
                  <p>{likesCount}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className={styles.statCard}>
                <Card.Body>
                  <h4>Total Followers</h4>
                  <p>{followersCount}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Created Recipes */}
          <h3 className="mt-4">Your Recipes</h3>
          <Row>
            {recipes.map((recipe) => (
              <Col md={4} key={recipe.id} className="mt-3">
                <Card>
                  <Card.Img variant="top" src={recipe.image} />
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                    <p>Likes: {recipe.likes_count}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Liked Recipes */}
          <h3 className="mt-4">Liked Recipes</h3>
          <Row>
            {likedRecipes.map((recipe) => (
              <Col md={4} key={recipe.id} className="mt-3">
                <Card>
                  <Card.Img variant="top" src={recipe.image} />
                  <Card.Body>
                    <Card.Title>{recipe.title}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
