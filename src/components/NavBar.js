import React, { useContext, useState } from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import logo from "../assets/logo.png";
import styles from "../styles/NavBar.module.css";
import { NavLink, useHistory } from "react-router-dom";
import { CurrentUserContext, SetCurrentUserContext } from "../contexts/CurrentUserContext";
import axios from "axios";

const NavBar = () => {
  const currentUser = useContext(CurrentUserContext);
  const setCurrentUser = useContext(SetCurrentUserContext);
  const history = useHistory();

  const [expanded, setExpanded] = useState(false);

  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      // Perform logout on the server
      await axios.post("/dj-rest-auth/logout/");
      
      // Clear the tokens in React state
      setCurrentUser(null);
      
      // Explicitly clear the tokens from cookies
      document.cookie = "my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "my-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Optionally, remove tokens from localStorage/sessionStorage if used
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
  
      // Redirect user to sign-in page
      history.push("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleCloseNav = () => {
    setExpanded(false);
  };

  const loggedInIcons = (
    <>
      {/* Feed Link */}
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/recipe-feed"
        onClick={handleCloseNav}
      >
        <i className="fas fa-utensils"></i> Feed
      </NavLink>
      {/* Create Recipe Link */}
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/create-recipe"
        onClick={handleCloseNav}
      >
        <i className="fas fa-plus-circle"></i> Create Recipe
      </NavLink>
      {/* User Dropdown */}
      <Dropdown alignRight>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          <i className="fas fa-user"></i> {currentUser?.username}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item as={NavLink} to="/dashboard" onClick={handleCloseNav}>
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </Dropdown.Item>
          <Dropdown.Item onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i> Sign out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );

  const loggedOutIcons = (
    <>
      {/* Home Link */}
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/"
        onClick={handleCloseNav}
      >
        <i className="fas fa-home"></i> Home
      </NavLink>
      {/* Sign in Link */}
      <NavLink
        className={styles.NavLink}
        activeClassName={styles.Active}
        to="/signin"
        onClick={handleCloseNav}
      >
        <i className="fas fa-sign-in-alt"></i> Sign in
      </NavLink>
      {/* Sign up Link */}
      <NavLink
        to="/signup"
        className={styles.NavLink}
        activeClassName={styles.Active}
        onClick={handleCloseNav}
      >
        <i className="fas fa-user-plus"></i> Sign up
      </NavLink>
    </>
  );

  return (
    <Navbar className={styles.NavBar} expand="md" fixed="top" expanded={expanded}>
      <Container>
        {/* Logo link changes based on whether the user is logged in or not */}
        <NavLink to={currentUser ? "/recipe-feed" : "/"}>
          <Navbar.Brand>
            <img src={logo} alt="logo" height="30" />
          </Navbar.Brand>
        </NavLink>

        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggle} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto text-left">
            {/* Show either the logged-in or logged-out menu, but not both */}
            {currentUser ? loggedInIcons : loggedOutIcons}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
