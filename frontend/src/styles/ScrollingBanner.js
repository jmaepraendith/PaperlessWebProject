import React from 'react';
import "../styles/HomePage.css";

const ScrollingBanner = () => {
  return (
    <div className="scrolling-banner">
      <div className="marquee-content">
        <span className="marquee-text">
          Welcome to Paperless Website!
        </span>
        <span className="marquee-text">
          Your accountant works won't be boring anymore!
        </span>
        <span className="marquee-text">
          Welcome to Paperless Website!
        </span>
      </div>
    </div>
  );
};

export default ScrollingBanner;
