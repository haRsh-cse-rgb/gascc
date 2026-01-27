import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OperatingParameters.css';

function OperatingParameters() {
  const navigate = useNavigate();
  const defaultText = 'Custom Inputs Inactive in trial version, Kindly load default values';

  const [concentration, setConcentration] = useState('');
  const [activationPeriod, setActivationPeriod] = useState(defaultText);
  const [diffusionPeriod, setDiffusionPeriod] = useState(defaultText);
  const [carburisingTemp, setCarburisingTemp] = useState(defaultText);
  const [boostTime, setBoostTime] = useState(defaultText);
  const [diffusionTime, setDiffusionTime] = useState(defaultText);

  const handleConcentrationChange = (e) => {
    const value = e.target.value;
    setConcentration(value);

    // Only validate if we have a complete value starting with "0."
    if (value.startsWith('0.') && value.length > 2 && value !== '0.2' && value !== '0.3') {
      alert('In the Demo version, only concentrations of 0.2 or 0.3 wt% are supported. To use custom concentration values, please upgrade to the full version. Contact our team for more information about accessing the complete feature set.');
      setConcentration('');
    }
  };

  const handleLoadDefaults = () => {
    setConcentration('0.2');
    setActivationPeriod('1.3');
    setDiffusionPeriod('0.8');
    setCarburisingTemp('1223');
    setBoostTime('9');
    setDiffusionTime('3');
  };

  const handleProceed = () => {
    if (
      activationPeriod === defaultText ||
      diffusionPeriod === defaultText ||
      carburisingTemp === defaultText ||
      boostTime === defaultText ||
      diffusionTime === defaultText
    ) {
      alert('Please fill all fields before proceeding, or click on the "Load Default Values" button to proceed with Default Values!');
      return;
    }
    else if (
      !concentration ||
      (concentration !== '0.2' && concentration !== '0.3')
    ) {
      alert('Please enter a valid concentration value (0.2 or 0.3 wt%) or click on the "Load Default Values" button to proceed with Default Values!');
      return;
    }

    navigate('/calculation-mode', {
      state: {
        concentration,
        activationPeriod,
        diffusionPeriod,
        carburisingTemp,
        boostTime,
        diffusionTime,
      },
    });
  };

  const handleNumberInput = (e) => {
    const charCode = e.charCode;
    if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  };

  return (
    <div className="operating-parameters">
      <div className="operating-parameters-content">
        <h2>Please input the following parameters:</h2>
        <form>
          <div className="form-group">
            <label>Initial Carbon Concentration of the given steel sample:</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={concentration}
                onChange={handleConcentrationChange}
                onKeyPress={handleNumberInput}
                placeholder="Only insert 0.2 or 0.3"
              />
              <span className="unit">wt%</span>
            </div>
          </div>
          <div className="form-group">
            <label>Carbon potential of the atmosphere (Activation period):</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={activationPeriod}
                readOnly
                className="disabled-input"
              />
              <span className="unit">wt%</span>
            </div>
          </div>
          <div className="form-group">
            <label>Carbon potential of the atmosphere (Diffusion period):</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={diffusionPeriod}
                readOnly
                className="disabled-input"
              />
              <span className="unit">wt%</span>
            </div>
          </div>
          <div className="form-group">
            <label>Carburising Temperature:</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={carburisingTemp}
                readOnly
                className="disabled-input"
              />
              <span className="unit">K</span>
            </div>
          </div>
          <div className="form-group">
            <label>Boost Time:</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={boostTime}
                readOnly
                className="disabled-input"
              />
              <span className="unit">hr</span>
            </div>
          </div>
          <div className="form-group">
            <label>Diffusion Time:</label>
            <div className="input-unit-container">
              <input
                type="text"
                value={diffusionTime}
                readOnly
                className="disabled-input"
              />
              <span className="unit">hr</span>
            </div>
          </div>
          <div className="button-group">
            <button type="button" onClick={handleLoadDefaults}>Load Default Values</button>
            <button type="button" onClick={() => navigate('/material-selection')}>Back</button>
            <button type="button" onClick={() => navigate('/logged-off')}>Cancel</button>
            <button type="button" onClick={handleProceed}>Proceed</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OperatingParameters;