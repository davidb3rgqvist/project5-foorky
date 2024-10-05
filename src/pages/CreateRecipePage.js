import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import styles from "../styles/CreateRecipePage.module.css";

const CreateRecipePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    ingredients: "",
    steps: "",
    cook_time: 30, // Default value for cooking time
    difficulty: "Easy", // Default value for difficulty
    image: null,
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for image preview
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleIngredientsChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ingredients: value, // Update ingredients with formatted text
    }));
  };

  const handleStepsChange = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      steps: value, // Update steps with formatted text
    }));
  };

  // Handle image upload and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));
      // Create a preview of the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Set preview image
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle clearing the selected image
  const handleDeleteImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: null,
    }));
    setPreviewImage(null); // Remove the preview image
  };

  const clearForm = () => {
    setFormData({
      title: "",
      short_description: "",
      ingredients: "",
      steps: "",
      cook_time: 30,
      difficulty: "Easy",
      image: null,
    });
    setPreviewImage(null); // Clear the image preview
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
    formDataToSubmit.append("ingredients", formData.ingredients); // Ingredients with formatting
    formDataToSubmit.append("steps", formData.steps); // Steps with formatting
    formDataToSubmit.append("cook_time", formData.cook_time); // Append cooking time
    formDataToSubmit.append("difficulty", formData.difficulty); // Append difficulty
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

        {/* Ingredients Field with React Quill */}
        <Form.Group controlId="ingredients">
          <Form.Label>Ingredients</Form.Label>
          <ReactQuill
            theme="snow"
            value={formData.ingredients}
            onChange={handleIngredientsChange}
            placeholder="Enter ingredients with formatting (comma separated)"
          />
        </Form.Group>

        {/* Steps Field with React Quill */}
        <Form.Group controlId="steps">
          <Form.Label>Steps</Form.Label>
          <ReactQuill
            theme="snow"
            value={formData.steps}
            onChange={handleStepsChange}
            placeholder="Enter cooking steps with formatting"
          />
        </Form.Group>

        <Form.Group controlId="cook_time">
          <Form.Label>Cook Time (in minutes)</Form.Label>
          <Form.Control
            type="number"
            name="cook_time"
            value={formData.cook_time}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="difficulty">
          <Form.Label>Difficulty</Form.Label>
          <Form.Control
            as="select"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </Form.Control>
        </Form.Group>

        {/* Image Upload Section */}
        <Form.Group controlId="image">
          <Form.Label>Upload Image</Form.Label>
          {/* Image Preview */}
          {previewImage && (
            <div className={styles.imagePreviewContainer}>
              <img src={previewImage} alt="Recipe Preview" className={styles.imagePreview} />
              <Button variant="danger" onClick={handleDeleteImage}>
                Remove Image
              </Button>
            </div>
          )}
          <div>
            <input
              type="file"
              id="image"
              name="image"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button variant="secondary" onClick={() => document.getElementById("image").click()}>
              Upload Image
            </Button>
          </div>
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Recipe
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRecipePage;
