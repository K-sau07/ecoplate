import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="logo">EcoPlate</div>
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')} className="btn-login">
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="btn-signup">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🌱</span>
            <span className="badge-text">Sustainability Starts Here</span>
          </div>
          <h1 className="hero-title">
            Reduce Food Waste.
            <br />
            <span className="hero-highlight">Feed Communities.</span>
          </h1>
          <p className="hero-subtitle">
            Connect grocery stores, customers, and NGOs to fight food waste through
            dynamic pricing and free distribution.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/signup')} className="btn-primary-large">
              Start Saving Food
              <span className="btn-arrow">→</span>
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary-large">
              Sign In
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-number">40%</div>
            <div className="stat-label">Food Waste Reduction</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Meals Saved Daily</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Partner Stores</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How EcoPlate Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon store-icon">🏪</div>
            <h3 className="feature-title">For Stores</h3>
            <p className="feature-description">
              List food items nearing expiry with dynamic pricing. Reduce waste and recover costs.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon customer-icon">🛒</div>
            <h3 className="feature-title">For Customers</h3>
            <p className="feature-description">
              Get quality food at discounted prices. Save money while reducing waste.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon ngo-icon">🤝</div>
            <h3 className="feature-title">For NGOs</h3>
            <p className="feature-description">
              Claim food donations for free distribution. Feed communities in need.
            </p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">Trusted by Communities</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-image">🏪</div>
            <p className="testimonial-text">
              "EcoPlate helped us reduce waste by 45% while recovering costs on items nearing expiry. It's a win-win."
            </p>
            <div className="testimonial-author">
              <div className="author-name">Sarah Johnson</div>
              <div className="author-role">Store Manager, FreshMart</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-image">🤝</div>
            <p className="testimonial-text">
              "We've been able to feed 500+ families monthly with food that would have been wasted. Incredible impact."
            </p>
            <div className="testimonial-author">
              <div className="author-name">Michael Chen</div>
              <div className="author-role">Director, Community Food Bank</div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-image">👨‍👩‍👧</div>
            <p className="testimonial-text">
              "Quality groceries at amazing prices. I save $200 monthly while helping reduce food waste!"
            </p>
            <div className="testimonial-author">
              <div className="author-name">Emily Rodriguez</div>
              <div className="author-role">Customer, Boston</div>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-section">
        <div className="impact-content">
          <h2 className="impact-title">Our Impact</h2>
          <p className="impact-subtitle">
            Together, we're making a difference in fighting food waste and hunger.
          </p>
          <div className="impact-grid">
            <div className="impact-item">
              <div className="impact-value">500K+</div>
              <div className="impact-label">Pounds of Food Saved</div>
            </div>
            <div className="impact-item">
              <div className="impact-value">200K+</div>
              <div className="impact-label">CO2 Emissions Reduced</div>
            </div>
            <div className="impact-item">
              <div className="impact-value">10K+</div>
              <div className="impact-label">Families Fed</div>
            </div>
            <div className="impact-item">
              <div className="impact-value">95%</div>
              <div className="impact-label">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-subtitle">
            Join our community of stores, customers, and NGOs fighting food waste.
          </p>
          <button onClick={() => navigate('/signup')} className="btn-cta">
            Join EcoPlate Today
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">EcoPlate</div>
            <p className="footer-tagline">Fighting food waste, feeding communities.</p>
          </div>
          <div className="footer-right">
            <p className="footer-copy">© 2025 EcoPlate. Built for CSYE7230.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
