import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GraphTypeSelection.css';

const GraphTypeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    depth,
    graphType
  } = location.state || {};

  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleCancel = () => {
    navigate('/model-formulation', {
      state: {
        concentration, activationPeriod, diffusionPeriod, carburisingTemp, boostTime, diffusionTime, dimension, coordinateSystem, thickness, gridPoints, distanceFromSurface, depth
      }
    });
  };

  const handleBack = () => {
    navigate('/graph-selection', {
      state: {
        concentration, activationPeriod, diffusionPeriod, carburisingTemp, boostTime, diffusionTime, dimension, coordinateSystem, thickness, gridPoints, distanceFromSurface, depth, graphType
      }
    });
  };

  const handleOk = () => {
    if (graphType === "Theoretical") {
      if (selectedOption === "Concentration vs Distance (Boost and Diffusion Period)") {
        navigate(`/concentration-distance-graph`, { 
          state: { 
            concentration, activationPeriod, diffusionPeriod, carburisingTemp, boostTime, diffusionTime, dimension, coordinateSystem, thickness, gridPoints, distanceFromSurface, depth, graphType, selectedGraph: selectedOption 
          } 
        });
      } else {
        console.log("Invalid selection for Theoretical graph type");
      }
    } else if (graphType === "Experimental") {
      if (selectedOption === "Concentration vs Distance (Boost and Diffusion Period)") {
        navigate(`/concentration-distance-experimental`, {
          state: {
            concentration, activationPeriod, diffusionPeriod, carburisingTemp, boostTime, diffusionTime, dimension, coordinateSystem, thickness, gridPoints, distanceFromSurface, depth, graphType, selectedGraph: selectedOption
          }
        });
      } else {
        console.log("Invalid selection for Experimental graph type");
      }
    } else {
      console.log("Selection is invalid, navigating to some other page.");
      navigate('/some-other-page');
    }
  };

  return (
    <div className="graph-type-selection-container">
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
        <button className="nav-button" onClick={handleCancel}>Cancel</button>
        <button className="nav-button" onClick={handleBack}>Back</button>
        <button className="nav-button" onClick={handleOk}>Proceed</button>
      </div>
    </div>
  );
};

export default GraphTypeSelection;