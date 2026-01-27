import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation to retrieve passed state
import './GraphSelection.css';

const GraphSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve all the values passed from the previous pages (ModelFormulation)
  const {
    concentration,
    activationPeriod,
    diffusionPeriod,
    carburisingTemp,
    boostTime,
    diffusionTime,
    dimension,
    coordinateSystem,
    thickness,
    gridPoints,
    distanceFromSurface,
    depth
  } = location.state || {};

  const [showPopup, setShowPopup] = useState(false);

  const handleBothButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Function to navigate to the next page, passing all state data
  const navigateToNextPage = (graphType) => {
    // Pass all existing values along with the graphType to the next page
    navigate('/graph-type-selection', {
      state: {
        concentration,
        activationPeriod,
        diffusionPeriod,
        carburisingTemp,
        boostTime,
        diffusionTime,
        dimension,
        coordinateSystem,
        thickness,
        gridPoints,
        distanceFromSurface,
        depth, // Ensure depth is passed
        graphType, // Add the graphType to state
      },
    });
  };

  return (
    <div className="graph-selection-container">
      <div className="graph-selection-card">
        <h2>Please select the type of Graph to be plotted:</h2>
        <p>Selected Thickness: {depth ? `${depth} mm` : 'No thickness selected'}</p> {/* Display selected thickness */}

        <div className="button-container">
          {/* Pass graphType along with all previous values */}
          <button
            className="graph-button"
            onClick={() => navigateToNextPage('Theoretical')}
          >
            Theoretical Value
          </button>
          <button
            className="graph-button"
            onClick={() => navigateToNextPage('Experimental')}
          >
            Experimental Value
          </button>
          <button
            className="graph-button"
            onClick={handleBothButtonClick}
          >
            Both Theoretical and Experimental Values
          </button>
        </div>
      </div>

      <div className="navigation-buttons">
        {/* Navigate back to ModelFormulation and pass the existing state */}
        <button
          className="nav-button"
          onClick={() => navigate('/model-formulation', { state: { ...location.state } })}
        >
          Back
        </button>
        <button
          className="nav-button"
          onClick={() => navigate('/logged-off')}
        >
          Cancel
        </button>
      </div>

      {/* Popup for warning */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>Warning! This feature is not active at present.</p>
            <button className="popup-button" onClick={handleClosePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphSelection;
