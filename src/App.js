import React from "react";
import styles from "./App.module.css";
import NavBar from "./components/NavBar";
import Container from "react-bootstrap/Container";
import PropTypes from "prop-types";
import { Route, Switch, Redirect } from "react-router-dom";
import "./api/axiosDefaults";
import SignUpForm from "./pages/auth/SignUpForm";
import SignInForm from "./pages/auth/SignInForm";
import HomePage from "./pages/HomePage";
import RecipeFeedPage from "./pages/RecipeFeedPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import { useEffect } from "react";
import {
  CurrentUserProvider,
  useCurrentUser,
} from "./contexts/CurrentUserContext";

// PrivateRoute to check user authentication
function PrivateRoute({ component: Component, ...rest }) {
  const currentUser = useCurrentUser();
  return (
    <Route
      {...rest}
      render={(props) =>
        currentUser ? <Component {...props} /> : <Redirect to="/signin" />
      }
    />
  );
}

function App() {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Add any actions to perform on mount with token
    }
  }, []);

  return (
    <CurrentUserProvider>
      <div className={styles.App}>
        <NavBar />
        <Container className={styles.Main}>
          <Switch>
            {/* Public Routes */}
            <Route exact path="/" component={HomePage} />
            <Route exact path="/signin" component={SignInForm} />
            <Route exact path="/signup" component={SignUpForm} />

            {/* Protected Routes */}
            <PrivateRoute
              exact
              path="/recipe-feed"
              component={RecipeFeedPage}
            />
            <PrivateRoute
              exact
              path="/create-recipe"
              component={CreateRecipePage}
            />
            <PrivateRoute exact path="/dashboard" component={DashboardPage} />
            <PrivateRoute
              exact
              path="/profiles/:profileId"
              component={ProfilePage}
            />

            {/* Catch-all for undefined routes */}
            <Route render={() => <p>Page not found!</p>} />
          </Switch>
        </Container>
      </div>
    </CurrentUserProvider>
  );
}

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

export default App;
