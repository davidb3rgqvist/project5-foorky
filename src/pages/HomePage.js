import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "../styles/Homepage.module.css";

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className={styles.Hero}>
        <Container>
          <Row>
            <Col className="text-center">
              <h1 className={styles.HeroText}>
                Discover Delicious Recipes with Foorky! Sign up today for personalized meal plans and more.
              </h1>
              <Link to="/signup" className={styles.CTAButton}>
                Get Started
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Benefits Section */}
      <Container className={styles.BenefitsWrapper}>
        <Row>
          <Col className={styles.BenefitColumn}>
            <i className={`${styles.BenefitIcon} fas fa-utensils`}></i>
            <h2 className={styles.BenefitHeading}>Personalized Recipes</h2>
            <p className={styles.BenefitText}>
              Get custom meal plans tailored to your tastes and preferences.
            </p>
          </Col>
          <Col className={styles.BenefitColumn}>
            <i className={`${styles.BenefitIcon} fas fa-clock`}></i>
            <h2 className={styles.BenefitHeading}>Save Time</h2>
            <p className={styles.BenefitText}>
              Reduce meal prep time with easy-to-follow recipes.
            </p>
          </Col>
          <Col className={styles.BenefitColumn}>
            <i className={`${styles.BenefitIcon} fas fa-heart`}></i>
            <h2 className={styles.BenefitHeading}>Healthy & Nutritious</h2>
            <p className={styles.BenefitText}>
              Enjoy balanced, nutritious meals that suit your lifestyle.
            </p>
          </Col>
        </Row>
      </Container>

      {/* About Section */}
      <div className={styles.AboutWrapper}>
        <Container>
          <Row>
            <Col className="text-center">
              <div className={styles.AboutText}>
                Foorky helps you explore new dishes and offers curated meal plans
                tailored to your preferences. Whether you're a beginner cook or an
                expert chef, there's something for everyone!
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Section */}
      <footer className={styles.FooterWrapper}>
        <Container>
          <Row>
            <Col className="text-center">
              <div className={styles.FooterText}>
                © 2024 Foorky | Your guide to better eating habits.
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;
