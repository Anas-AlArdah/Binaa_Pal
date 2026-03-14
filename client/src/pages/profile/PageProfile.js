import React from 'react';
import './PageProfile.css';

const PageProfile = () => {
  return (
    <div className="profile-page">
      {/* ===== PROFILE CARD ===== */}
      <div className="profile-card">

        {/* — Header: Avatar + Info + Button — */}
        <div className="profile-header">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-circle">A</div>
          </div>

          {/* Name & Info */}
          <div className="profile-info">
            <h1 className="profile-name">Ahmad Nassar</h1>
            <div className="profile-meta">
              <span className="meta-item">
                <i className="fas fa-map-marker-alt"></i> Ramallah
              </span>
              <span className="meta-item meta-rating">
                <i className="fas fa-star"></i> 4.8 (3 reviews)
              </span>
              <span className="meta-item">
                <i className="far fa-clock"></i> 93 reliability
              </span>
            </div>
            <p className="profile-bio">
              Master tiler with 15+ years of experience. Specializing in modern bathroom and kitchen designs.
            </p>
            <div className="profile-contact-methods">
              <i className="fas fa-phone-alt"></i>
              <span>whatsapp, phone</span>
            </div>
          </div>

          {/* Request Button */}
          <div className="profile-action">
            <button className="btn-request">Request This Worker</button>
          </div>
        </div>

        {/* — Skill Tags — */}
        <div className="profile-skills">
          <span className="skill-tag tiling">
            <span className="skill-dot" style={{ backgroundColor: '#4a7c59' }}></span>
            Tiling
          </span>
          <span className="skill-tag masonry">
            <span className="skill-dot" style={{ backgroundColor: '#c0392b' }}></span>
            Masonry
          </span>
        </div>

        {/* — Stats Row — */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-label">Pricing</div>
            <div className="stat-value">30–80 ILS/m2</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Experience</div>
            <div className="stat-value">15 years</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Rating</div>
            <div className="stat-value">4.8/5</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Reliability</div>
            <div className="stat-value">93/100</div>
          </div>
        </div>

        {/* — Video Stats Section — */}
        <div className="video-stats-container">
          <video className="stats-video-bg" autoPlay loop muted playsInline>
            <source src={`${process.env.PUBLIC_URL}/vedios/states.mp4`} type="video/mp4" />
          </video>
          <div className="video-stats-overlay">
            <div className="v-stat-card">
              <span className="v-stat-number">120+</span>
              <span className="v-stat-label">Projects</span>
            </div>
            <div className="v-stat-card">
              <span className="v-stat-number">98%</span>
              <span className="v-stat-label">Happy Clients</span>
            </div>
            <div className="v-stat-card">
              <span className="v-stat-number">24/7</span>
              <span className="v-stat-label">Support</span>
            </div>
          </div>
        </div>

        {/* — AI Review Summary — */}
        <div className="ai-review-summary">
          <div className="ai-review-header">
            <span className="ai-icon">✨</span>
            <span className="ai-title">AI Review Summary</span>
          </div>
          <p className="ai-review-text">
            Based on 3 verified reviews: Strengths: exceptional quality, good communication.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PageProfile;
