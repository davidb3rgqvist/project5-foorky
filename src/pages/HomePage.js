import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "../styles/Homepage.module.css";
import buttonStyles from "../styles/Button.module.css";
import { useSwipe } from "../hooks/useSwipe";


function HomePage() {

  const benefits = [
    {
      icon: "fas fa-utensils",
      heading: "Discover Delicious Recipes with Foorky!",
      text: "Sign up today to explore inspiring recipes shared by friends and food lovers from around the world. Whether you're looking for quick meals or gourmet dishes",
    },
    {
      icon: "fas fa-clock",
      heading: "Stress-Free Cooking",
      text: "With Foorky’s easy-to-follow recipe format, you’ll save time and avoid the headache of constantly having to reread instructions. Our streamlined structure ensures you can focus on cooking, not deciphering complicated steps. Plus, every recipe follows the same format, so once you’ve learned it, preparing meals becomes even easier and faster!",
    },
    {
      icon: "fas fa-heart",
      heading: "We’re a community of food lovers",
      text: "Discover recipes that suit your lifestyle while connecting with a vibrant community of food lovers. Share tips, ideas, and inspiration as you create wholesome meals together. With Foorky, you’re never cooking alone!",
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
                Foorky connects you with a global community of culinary enthusiasts. 
                Join us and find your next favorite recipe!
              </h1>
              <Link to="/signup" className={buttonStyles.CTAButton}>
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
              Find new exciting dishes every day – 
              from beginners to seasoned chefs!
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
                © 2024 Foorky | Your guide to exciting eating habits.
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;
