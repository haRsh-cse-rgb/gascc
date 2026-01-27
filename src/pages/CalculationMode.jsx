import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CalculationMode.css'; // Import the CSS file for styling

function CalculationMode() {
    const navigate = useNavigate();
    const location = useLocation();
    const defaultText = 'Custom inputs inactive in trial version, Kindly load default values to proceed'; // Default inactive text

    // State variables for new inputs
    const [dimension, setDimension] = useState('');
    const [coordinateSystem, setCoordinateSystem] = useState('');
    const [thickness, setThickness] = useState('');
    const [gridPoints, setGridPoints] = useState(defaultText);
    const [distanceFromSurface, setDistanceFromSurface] = useState(defaultText);
    const [showPopup, setShowPopup] = useState(false); // State to control the pop-up
    const [popupMessage, setPopupMessage] = useState(''); // State to store pop-up message

    // Retrieve values passed from the previous page
    const {
        concentration,
        activationPeriod,
        diffusionPeriod,
        carburisingTemp,
        boostTime,
        diffusionTime,
    } = location.state || {};

    // Function to load default values
    const handleLoadDefaults = () => {
        setDimension('1D');
        setCoordinateSystem('Cartesian');
        setThickness('8');
        setGridPoints('100');
        setDistanceFromSurface('4');
    };

    // Function to handle the "Proceed" button click
    const handleProceed = () => {
        // Check if any fields are empty or contain the default inactive text
        if (!coordinateSystem || gridPoints === defaultText || distanceFromSurface === defaultText) {
            alert('Please fill all fields before proceeding, or click on the "Load Default Values" button to proceed with Default Values!');
            return;
        }
        else if (!dimension) {
            alert('Please select the dimension, or click on the "Load Default Values" button to proceed with Default Values!');
            return;
        }
        else if (!thickness) {
            alert('Thickness of the Sample cannot be empty, please fill it or click on the "Load Default Values" button to proceed with Default Values!');
            return;
        }

        // Check if distance from the surface is greater than thickness
        if (parseFloat(distanceFromSurface) > parseFloat(thickness)) {
            setPopupMessage('Distance from the surface should be less than the thickness of the sample.');
            setShowPopup(true); // Show pop-up
            return;
        }

        // Navigate to Model Formulation page with all values passed
        navigate('/model-formulation', {
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
            },
        });
    };

    // Function to close the pop-up
    const handleClosePopup = () => {
        setShowPopup(false); // Close pop-up
    };

    // Function to restrict input to numbers and one decimal point
    const handleNumberInput = (e) => {
        const charCode = e.charCode;
        // Allow numbers, period (.), and control keys like Backspace
        if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            e.preventDefault();
        }
    };

    return (
        <div className="calculation-mode">
            <div className="content-wrapper">

                <h2>Calculation Mode</h2>
                <div className="coordinate-system">
                    <br />
                    <label><strong>Select the coordinate system:</strong></label>
                    <div className="dimension-select">
                        <select
                            value={dimension}
                            onChange={(e) => setDimension(e.target.value)}
                        >
                            <option value="">Select Dimension</option>
                            <option value="1D">1 Dimensional</option>
                            <option value="2D" disabled>2 Dimensional</option>
                        </select>
                    </div>
                    <div className="coordinate-options">
                        <label>Coordinate System:</label>
                        <label>
                            <input
                                type="radio"
                                value="Cartesian"
                                checked={coordinateSystem === 'Cartesian'}
                                onChange={() => setCoordinateSystem('Cartesian')}
                            />
                            Cartesian
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Cylindrical"
                                disabled // Disable Cylindrical option
                            />
                            Cylindrical (Inactive in trial mode)
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="Spherical"
                                disabled // Disable Spherical option
                            />
                            Spherical (Inactive in trial mode)
                        </label>
                    </div>
                </div>
                <div className="input-parameters">
                    <h3>Input Parameters:</h3>
                    <div className="form-group">
                        <label>Thickness of the Sample:</label>
                        <div className="input-wrapper">

                            <input
                                type="text"
                                value={thickness}
                                onChange={(e) => setThickness(e.target.value)}
                                onKeyPress={handleNumberInput} // Restrict to numbers only
                            />
                            <span className="unit">mm</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Number of Grid Points:</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={gridPoints}
                                readOnly // Make this field read-only
                                className="disabled-input" // Add class to style disabled inputs
                            />
                            <span className="unit">nos</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Distance from the Surface:</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={distanceFromSurface}
                                readOnly // Make this field read-only
                                className="disabled-input" // Add class to style disabled inputs
                            />
                            <span className="unit">mm</span>
                        </div>
                    </div>
                    <div className="button-group">
                        <button onClick={handleLoadDefaults}>Load Default Values</button>
                        <button type="button" onClick={() => navigate('/operating-parameters')}>Back</button> {/* Navigate to Operating Parameters */}
                        <button type="button" onClick={() => navigate('/logged-off')}>Cancel</button>
                        <button type="button" onClick={handleProceed}>Proceed</button>
                    </div>
                </div>

                {/* Popup for validation */}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <p>{popupMessage}</p>
                            <button onClick={handleClosePopup} className="ok-button">OK</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CalculationMode;
