import React from 'react';
import { Link } from 'react-router-dom';
import './LoggedOff.css'; // Optional: add styles for the page

function LoggedOff() {
  return (
    <div className="logged-off-container">
      <h1>You have successfully logged off</h1>
      <p>Thank you for visiting. Click below to start again.</p>
      <div className="button-container">
        <Link to="/" className="start-again-button">
          Start Again
        </Link>
        <a
          href="https://www.rescons.in"
          target="_blank"
          rel="noopener noreferrer"
          className="rescons-button"
        >
          Visit Rescons
        </a>
      </div>
    </div>
  );
}

export default LoggedOff;
