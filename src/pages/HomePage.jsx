import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/material-selection');
  };

  const handleContact = () => {
    window.open('https://www.rescons.in/contact.html', '_blank', 'noopener noreferrer');
  };

  return (
    <div className="homepage-container">
      <h1>Welcome to Gas Carburizing Software</h1>
      <p>This is the demo version.</p>

      <div className="main-buttons">
        <button onClick={handleProceed}>Click to Proceed</button>
      </div>

      <div className="demo-notice">
        <p>Limited features available in the demo version.</p>
        <p>To access the full version with complete functionality:</p>
        <button onClick={handleContact} className="contact-button">
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default HomePage;