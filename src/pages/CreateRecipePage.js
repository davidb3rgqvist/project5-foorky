import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/CreateRecipePage.module.css";
import buttonStyles from "../styles/Button.module.css";

const CreateRecipePage = () => {
  const location = useLocation();
  const recipeToEdit = location.state?.recipe;
  const isEditMode = !!recipeToEdit; // Determine if it's in edit mode

  // State to manage form data, error/success messages, and image preview
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    ingredients: "",
    steps: "",
    cook_time: 30,
    difficulty: "Easy",
    image: null,
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const history = useHistory();

  // If in edit mode, pre-populate the form with the recipe data
  useEffect(() => {
    if (isEditMode) {
      setFormData({
        title: recipeToEdit.title,
        short_description: recipeToEdit.short_description,
        ingredients: recipeToEdit.ingredients,
        steps: recipeToEdit.steps,
        cook_time: recipeToEdit.cook_time,
        difficulty: recipeToEdit.difficulty,
        image: null, // Don't pre-load the image
      });
      setPreviewImage(null); // Reset preview image
    }
  }, [isEditMode, recipeToEdit]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit the short description to 80 characters
    const updatedValue =
      name === "short_description" && value.length > 80
        ? value.slice(0, 77) + "..."
        : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));
  };

  // Handle image file selection and set preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));

      // Create a file reader to display the image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Set the image preview
      };
      reader.readAsDataURL(file); // Convert the image file to data URL
    }
  };

  // Handle deleting the selected image
  const handleDeleteImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      image: null, // Remove the image from form data
    }));
    setPreviewImage(null); // Reset the preview image
  };

  // Clear the form after submission
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
    setPreviewImage(null); // Clear the preview image
  };

  // Handle form submission for creating or editing a recipe
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    // Validate form fields
    if (
      !formData.title ||
      !formData.short_description ||
      !formData.ingredients ||
      !formData.steps ||
      (!formData.image && !isEditMode)
    ) {
      setErrorMessage(
        "Please fill in all the fields. An image is optional when editing.",
      );
      return;
    }
    if (formData.cook_time && formData.cook_time < 0) {
      setErrorMessage("Cook time cannot be less than 0 minutes.");
    } else {
      setErrorMessage(null); // Clear error if input is valid
    }

    // Prepare the form data for submission
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("short_description", formData.short_description);
    formDataToSubmit.append("ingredients", formData.ingredients);
    formDataToSubmit.append("steps", formData.steps);
    formDataToSubmit.append("cook_time", formData.cook_time);
    formDataToSubmit.append("difficulty", formData.difficulty);
    if (formData.image) formDataToSubmit.append("image", formData.image); // Include image if available

    try {
      if (isEditMode) {
        // Update the existing recipe
        await axios.put(`/recipes/${recipeToEdit.id}/`, formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage("Recipe updated successfully!");
      } else {
        // Create a new recipe
        await axios.post("/recipes/", formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage("Recipe created successfully!");
      }
      setErrorMessage(null);
      clearForm();
      setTimeout(() => {
        history.push("/recipe-feed"); // Redirect to the recipe feed
      }, 2000);
    } catch (error) {
      setErrorMessage("Failed to save recipe. Please try again.");
      setSuccessMessage(null);
    }
  };

  return (
    <Container className={styles.CreateRecipeContainer}>
      <h1>{isEditMode ? "Edit Recipe" : "Create a New Recipe"}</h1>
      {/* Display error or success messages */}
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
          <Form.Label>Short Description (max 80 characters)</Form.Label>
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

        <Form.Group controlId="cook_time">
          <Form.Label>Cook Time (in minutes)</Form.Label>
          <Form.Control
            type="number"
            name="cook_time"
            value={formData.cook_time}
            onChange={handleChange}
            min="0"
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
          {previewImage && (
            <div className={styles.imagePreviewContainer}>
              <img
                src={previewImage}
                alt="Recipe Preview"
                className={styles.imagePreview}
              />
              <div className={styles.imagePreviewButtonContainer}>
                <Button
                  className={buttonStyles.Button}
                  onClick={handleDeleteImage}
                >
                  Remove Image
                </Button>
              </div>
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
            <Button
              className={buttonStyles.Button}
              onClick={() => document.getElementById("image").click()}
            >
              Upload Image
            </Button>
          </div>
        </Form.Group>

        <Button className={buttonStyles.Button} type="submit">
          {isEditMode ? "Update Recipe" : "Create Recipe"}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateRecipePage;
