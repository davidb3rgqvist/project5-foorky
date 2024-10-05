import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "../styles/Homepage.module.css";
import { useSwipe } from "../hooks/useSwipe";

function HomePage() {

  const benefits = [
    {
      icon: "fas fa-utensils",
      heading: "Personalized Recipes",
      text: "Get custom meal plans tailored to your tastes and preferences.",
    },
    {
      icon: "fas fa-clock",
      heading: "Save Time",
      text: "Reduce meal prep time with easy-to-follow recipes.",
    },
    {
      icon: "fas fa-heart",
      heading: "Healthy & Nutritious",
      text: "Enjoy balanced, nutritious meals that suit your lifestyle.",
    },
  ];

  const { activeIndex, setActiveIndex } = useSwipe(benefits.length);

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
        {benefits.map((benefit, index) => (
          <Col
            key={index}
            className={styles.BenefitColumn}
            style={{ display: index === activeIndex ? "block" : "none" }}
          >
            <i className={`${styles.BenefitIcon} ${benefit.icon}`}></i>
            <h2 className={styles.BenefitHeading}>{benefit.heading}</h2>
            <p className={styles.BenefitText}>{benefit.text}</p>
          </Col>
        ))}
      </Container>

      {/* Dots to indicate active section */}
      <div className={styles.SwipeDots}>
        {benefits.map((_, index) => (
          <span
            key={index}
            className={`${styles.SwipeDot} ${index === activeIndex ? styles.active : ""}`}
            onClick={() => setActiveIndex(index)}
          ></span>
        ))}
      </div>

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
