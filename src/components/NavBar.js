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

  const handleSignOut = async () => {
    try {
      await axios.post("/dj-rest-auth/logout/");
      setCurrentUser(null);
      document.cookie = "my-app-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("authToken");
      history.push("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  const loggedInIcons = (
    <>
      <NavLink className={styles.NavLink} to="/recipe-feed" onClick={() => setExpanded(false)}>
        <i className="fas fa-utensils"></i> Feed me
      </NavLink>
      <NavLink className={styles.NavLink} to="/create-recipe" onClick={() => setExpanded(false)}>
        <i className="fas fa-plus-circle"></i> Create Recipe
      </NavLink>
      <Dropdown alignRight>
        <Dropdown.Toggle
          variant="success" style={{ backgroundColor: 'transparent' }}
          id="dropdown-profile"
          className={styles.profileToggle}
        >
           <i className="fas fa-user"></i> {currentUser?.name || currentUser?.username}
        </Dropdown.Toggle>

        <Dropdown.Menu className={styles.customDropdownMenu}>
          <Dropdown.Item as={NavLink} to="/dashboard" onClick={() => setExpanded(false)}>
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
      <NavLink className={styles.NavLink} to="/" onClick={() => setExpanded(false)}>
        <i className="fas fa-home"></i> Home
      </NavLink>
      <NavLink className={styles.NavLink} to="/signin" onClick={() => setExpanded(false)}>
        <i className="fas fa-sign-in-alt"></i> Sign in
      </NavLink>
      <NavLink className={styles.NavLink} to="/signup" onClick={() => setExpanded(false)}>
        <i className="fas fa-user-plus"></i> Sign up
      </NavLink>
    </>
  );

  return (
    <Navbar className={styles.NavBar} expand="md" fixed="top" expanded={expanded}>
      <Container>
        <NavLink to={currentUser ? "/recipe-feed" : "/"}>
          <Navbar.Brand>
            <img src={logo} alt="logo" height="30" />
          </Navbar.Brand>
        </NavLink>

        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto text-left">
            {currentUser ? loggedInIcons : loggedOutIcons}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
