import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ModelFormulation.css';

const ModelFormulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [values, setValues] = useState({});
  const [contourData, setContourData] = useState([]);

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
    depth: prevDepth // Retrieve previously selected depth
  } = location.state || {};

  const calculateContour = useCallback(() => {
    const m = gridPoints || 100;
    const c = concentration || 1.0;
    let con = new Array(m + 1).fill(0);
    for (let i = 0; i <= m; i++) {
      con[i] = c * (1 - i / m);
    }
    setContourData(con);
  }, [gridPoints, concentration]);

  useEffect(() => {
    setValues({
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
    });
    calculateContour();
  }, [
    concentration, activationPeriod, diffusionPeriod, carburisingTemp, boostTime, diffusionTime, dimension, coordinateSystem, thickness, gridPoints, distanceFromSurface, calculateContour
  ]);

  // If returning with a previously selected depth, set that as the selectedDepth
  useEffect(() => {
    if (prevDepth) {
      setSelectedDepth(prevDepth);
    }
  }, [prevDepth]);

  const handlePlotClick = (depth) => {
    if (depth !== null) {
      setPopupMessage(
        `Mouse clicked at depth of ${depth.toFixed(1)} mm (${(depth / 10).toFixed(2)} cm).
         Proceed with this section?`
      );
      setSelectedDepth(depth); // Set the selected depth
      setShowPopup(true);
    } else {
      setPopupMessage('Please click on the cross-sectional area to proceed.');
      setSelectedDepth(null);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleProceed = () => {
    if (selectedDepth !== null) {
      navigate('/graph-selection', { state: { depth: selectedDepth, ...values } });
    }
  };

  const handleBack = () => {
    navigate('/calculation-mode', { state: { ...values, depth: selectedDepth } });
  };

  const handleExit = () => {
    navigate('/logged-off');
  };

  const getLayerColor = (concentration) => {
    const minConc = Math.min(...contourData);
    const maxConc = Math.max(...contourData);
    const normalizedConc = (concentration - minConc) / (maxConc - minConc);
    const hue = (1 - normalizedConc) * 240; // 240 for blue, 0 for red
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="content-container">
      <div className="flex flex-col items-center p-4 min-h-screen">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2">Model Formulation of Gas Carburization Process</h1>
          <h2 className="text-xl mb-4">(One-Dimensional Unsteady State Model)</h2>

          <p className="description mb-4">
            Sample along Y-axis represents the sample thickness. Corresponding value of the thickness is obtained by a mouse click all along the cross section of the cuboid. Clicking anywhere else produces no results.
          </p>
          <p className="note mb-4">
            <strong>Please click within the coloured portion to view the profile at that point.</strong>
          </p>

          <div className="mb-8">
            <svg width="800" height="400" viewBox="0 0 800 400">
              {/* Front face */}
              {contourData.map((concentration, i) => (
                <rect
                  key={`front-${i}`}
                  x="100" y={120 + i * (150 / gridPoints)}
                  width="400" height={150 / gridPoints}
                  fill={getLayerColor(concentration)}
                  stroke="none"
                  onClick={() => handlePlotClick(i * thickness / gridPoints)}
                />
              ))}

              {/* Side face */}
              {contourData.map((concentration, i) => (
                <polygon
                  key={`side-${i}`}
                  points={`500,${120 + i * (150 / gridPoints)} 650,${20 + i * (150 / gridPoints)} 650,${23 + i * (150 / gridPoints)} 500,${123 + i * (150 / gridPoints)}`}
                  fill={getLayerColor(concentration)}
                  stroke="none"
                  onClick={() => handlePlotClick(null)}
                />
              ))}

              {/* Top face */}
              <polygon
                points="100,120 500,120 650,20 250,20"
                fill={getLayerColor(contourData[0])}
                stroke="black"
                strokeWidth="1"
                onClick={() => handlePlotClick(null)}
              />

              {/* Partition lines */}
              {Array.from({ length: 11 }, (_, i) => (
                <React.Fragment key={`partition-${i}`}>
                  <line
                    x1="100" y1={120 + i * 15}
                    x2="500" y2={120 + i * 15}
                    stroke="black" strokeWidth="2"
                  />
                  <line
                    x1="500" y1={120 + i * 15}
                    x2="650" y2={20 + i * 15}
                    stroke="black" strokeWidth="2"
                  />
                </React.Fragment>
              ))}

              {/* Axes */}
              <line x1="100" y1="270" x2="500" y2="270" stroke="black" strokeWidth="2" />
              <line x1="100" y1="120" x2="100" y2="270" stroke="black" strokeWidth="2" />
              <line x1="650" y1="20" x2="650" y2="170" stroke="black" strokeWidth="2" />
              <line x1="500" y1="120" x2="500" y2="270" stroke="black" strokeWidth="2" />
              <line x1="90" y1="120" x2="240" y2="20" stroke="black" strokeWidth="2" />

              {/* Axis Labels */}
              <text x="300" y="290" fontSize="14" textAnchor="middle">X</text>
              <text x="80" y="195" fontSize="14" textAnchor="middle">Y</text>
              <text x="240" y="10" fontSize="14" textAnchor="start">Z</text>

              {/* Depth Labels */}
              {Array.from({ length: 11 }, (_, i) => i * thickness / 10).map((depth, i) => (
                <text key={`depth-${i}`} x="50" y={125 + i * 15} fontSize="12" textAnchor="end">
                  {depth.toFixed(1)}
                </text>
              ))}
              <text x="20" y="195" fontSize="14" textAnchor="middle" transform="rotate(-90, 20, 195)">
                Depth (mm)
              </text>

              {/* Diffusion Arrow and Label */}
              <line x1="700" y1="120" x2="700" y2="250" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <text x="700" y="110" fontSize="14" textAnchor="middle">Diffusion</text>

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                </marker>
              </defs>
            </svg>
          </div>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <p>{popupMessage}</p>
                <div className="popup-buttons">
                  {selectedDepth !== null ? (
                    <>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleProceed}>Proceed</button>
                      <button className="px-4 py-2 bg-gray-300 text-black rounded" onClick={handleClosePopup}>Cancel</button>
                    </>
                  ) : (
                    <button className="px-4 py-2 bg-gray-300 text-black rounded" onClick={handleClosePopup}>Close</button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4 ">
            <button className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleBack}>Back</button>
            <button className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleExit}>Exit</button>
          </div>
        </div>
      </div>
      </div>
      );
};

      export default ModelFormulation;