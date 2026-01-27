// src/pages/MaterialSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MaterialSelection.css'; // Import the CSS file for styling

function MaterialSelection() {
  const navigate = useNavigate();

  const handleCancelClick = () => {
    navigate('/logged-off');
  };

  const handleNextClick = () => {
    navigate('/operating-parameters'); // Change this to the appropriate next page route
  };

  return (
    <div className="material-selection">
      <h2>Please select the material under consideration</h2>
      <select>
        <option>Plain Carbon Steel</option>
        <option disabled>Alloy Steel (Inactive in Trial Version)</option>
      </select>
      <br />
      <button className="next-button" onClick={handleNextClick}>Proceed</button>
      <button className="cancel-button" onClick={handleCancelClick}>Cancel</button>
    </div>
  );
}

export default MaterialSelection;
