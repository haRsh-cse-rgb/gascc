import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GraphOptions.css';

const GraphOptionsHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Extract all parameters from location state with default values
  const {
    concentration = 0.2,
    activationPeriod = 1.3,
    diffusionPeriod = 0.8,
    carburisingTemp = 1223,
    boostTime = 9,
    diffusionTime = 3,
    thickness = 8.0,
    gridPoints = 100,
    depth = 8,
    coordinateSystem = '1',
    distanceFromSurface = '4',
    dimension,
    graphType,
    previousGraph,
    experimentalData
  } = location.state || {};

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleProceed = () => {
    // Create params object with all values
    const params = {
      concentration,
      activationPeriod,
      diffusionPeriod,
      carburisingTemp,
      boostTime,
      diffusionTime,
      thickness,
      gridPoints,
      depth,
      coordinateSystem,
      distanceFromSurface,
      graphType,
      dimension,
      experimentalData
    };

    if (graphType === 'Experimental') {
      if (selectedOption === "Concentration vs Distance (Boost and Diffusion Period)") {
        navigate('/concentration-distance-experimental', { state: params });
      }
    } else if (graphType === 'Theoretical') {
      if (selectedOption === "Concentration vs Distance (Boost and Diffusion Period)") {
        navigate('/concentration-distance-graph', { state: params });
      }
    }
  };

  const handleBack = () => {
    const params = {
      concentration,
      activationPeriod,
      diffusionPeriod,
      carburisingTemp,
      boostTime,
      diffusionTime,
      thickness,
      gridPoints,
      depth,
      coordinateSystem,
      distanceFromSurface,
      graphType,
      dimension,
      experimentalData
    };

    if (graphType === 'experimental' && previousGraph === '/concentration-distance-experimental-graph') {
      navigate('/concentration-distance-experimental-graph', { state: params });
    } else {
      navigate(previousGraph || '/concentration-time-graph', { state: params });
    }
  };

  const handleCancel = () => {
    // Pass all necessary parameters when canceling
    const params = {
      concentration,
      activationPeriod,
      diffusionPeriod,
      carburisingTemp,
      boostTime,
      diffusionTime,
      thickness,
      gridPoints,
      depth,
      coordinateSystem,
      distanceFromSurface,
      dimension
    };
    navigate('/model-formulation', { state: params });
  };

  return (
    <div className="graph-options-container">
      <div className="graph-selection-card">
        <h2>Select the type of Graph to be plotted:</h2>
        
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="Concentration vs Distance (Boost and Diffusion Period)"
              checked={selectedOption === "Concentration vs Distance (Boost and Diffusion Period)"}
              onChange={handleOptionChange}
            />
            Concentration vs Distance (Boost and Diffusion Period)
          </label>

          <label className="inactive-option">
            <input
              type="radio"
              value="Concentration vs Time (at a particular depth)"
              disabled
            />
            Concentration vs Time (at a particular depth)
          </label>

          <label className="inactive-option">
            <input
              type="radio"
              value="Case Depth vs Time (for various initial carbon concentration)"
              disabled
            />
            Case Depth vs Time (for various initial carbon concentration)
          </label>

          <label className="inactive-option">
            <input
              type="radio"
              value="Concentration vs Distance (for different Time)"
              disabled
            />
            Concentration vs Distance (for different Time)
          </label>

          <label className="inactive-option">
            <input
              type="radio"
              value="Concentration vs Distance (for different temperature values)"
              disabled
            />
            Concentration vs Distance (for different temperature values)
          </label>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="nav-button" onClick={handleCancel}>
          Cancel
        </button>
        <button className="nav-button" onClick={handleBack}>
          Back
        </button>
        <button 
          className="nav-button" 
          onClick={handleProceed}
          disabled={!selectedOption}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default GraphOptionsHandler;