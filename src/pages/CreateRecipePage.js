import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import axios from "axios";
import styles from "../styles/CreateRecipePage.module.css";

const CreateRecipePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    ingredients: "",
    steps: "",
    image: null,
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: e.target.files[0],
    }));
  };

  const clearForm = () => {
    setFormData({
      title: "",
      short_description: "",
      ingredients: "",
      steps: "",
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (!formData.title || !formData.short_description || !formData.ingredients || !formData.steps) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("short_description", formData.short_description);
    formDataToSubmit.append("ingredients", formData.ingredients);
    formDataToSubmit.append("steps", formData.steps);
    if (formData.image) {
      formDataToSubmit.append("image", formData.image);
    }

    try {
      const { data } = await axios.post("/recipes/", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage("Recipe created successfully!");
      setErrorMessage(null);

      // Clear the form fields
      clearForm();

      // Redirect to feed after 2 seconds
      setTimeout(() => {
        history.push("/feed");
      }, 2000);
    } catch (error) {
      console.log("Error creating recipe", error);
      setErrorMessage("Failed to create recipe. Please try again.");
      setSuccessMessage(null);
    }
  };

  return (
    <Container className={styles.CreateRecipeContainer}>
      <h1>Create a New Recipe</h1>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter recipe title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="short_description">
          <Form.Label>Short Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter a short description"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="ingredients">
          <Form.Label>Ingredients</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter ingredients (comma separated)"
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="steps">
          <Form.Label>Steps</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter cooking steps"
            name="steps"
            value={formData.steps}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="image">
          <Form.Label>Upload Image</Form.Label>
          <Form.File onChange={handleFileChange} />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Recipe
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRecipePage;
