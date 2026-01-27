import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConcentrationDistanceExperimental.css';

const ConcentrationTimeExperimental = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const tableRef = useRef(null);
  
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
    graphType,
    selectedGraph
  } = location.state || {};

  // State for table data and save dialog
  const [tableData, setTableData] = useState(
    Array(60).fill().map(() => ({
      time: '',
      concentration: ''
    }))
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (index, field, value) => {
    const newData = [...tableData];
    
    // Validate input based on field type
    if (field === 'time') {
      if (value < 0) return; // Don't allow negative time
    } else if (field === 'concentration') {
      if (value < 0) return; // Don't allow negative concentration
    }

    // If editing the last row and it contains data, add more rows
    if (index === tableData.length - 1 && value !== '') {
      newData.push(...Array(10).fill().map(() => ({
        time: '',
        concentration: ''
      })));
    }
    
    newData[index][field] = value;
    setTableData(newData);
  };

  const handleFileOpen = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const parseFileContent = (content) => {
    try {
      // Split content into lines and remove empty lines
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      // Ensure we have at least a header line
      if (lines.length < 1) {
        throw new Error('File is empty');
      }

      // Validate header
      const headerLine = lines[0].toLowerCase();
      if (!headerLine.includes('time') || !headerLine.includes('concentration')) {
        throw new Error('Invalid header format. Expected: TIME (minutes),CONCENTRATION (wt%)');
      }

      // Skip header row and parse data lines
      const dataLines = lines.slice(1);
      
      const parsedData = dataLines.map((line, index) => {
        const [time, concentration] = line.split(',').map(val => val.trim());
        
        // Validate the data
        if (!time || !concentration) {
          throw new Error(`Invalid data format at line ${index + 2}`);
        }

        const timeNum = Number(time);
        const concNum = Number(concentration);

        if (isNaN(timeNum) || isNaN(concNum)) {
          throw new Error(`Invalid numeric values at line ${index + 2}`);
        }

        if (timeNum < 0 || concNum < 0) {
          throw new Error(`Negative values not allowed at line ${index + 2}`);
        }

        return {
          time: time,
          concentration: concentration
        };
      });

      // Calculate required table size (at least 60 or data length + buffer)
      const minSize = Math.max(60, parsedData.length + 10);
      
      // Create new table data array with existing data plus empty rows
      const newData = Array(minSize).fill().map((_, index) => {
        if (index < parsedData.length) {
          return parsedData[index];
        }
        return {
          time: '',
          concentration: ''
        };
      });

      return newData;
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error(`Invalid file format: ${error.message}`);
    }
  };

  const handleFileUpload = (event) => {
    setErrorMessage('');
    
    // Check if files exist and get the first file
    if (!event.target.files || !event.target.files[0]) {
      setErrorMessage('No file selected');
      return;
    }

    const file = event.target.files[0];
    
    // Verify that it's a text file
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setErrorMessage('Please upload a text (.txt) file');
      event.target.value = ''; // Reset file input
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (typeof e.target.result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const content = e.target.result;
        const parsedData = parseFileContent(content);
        setTableData(parsedData);
      } catch (error) {
        console.error('Error reading file:', error);
        setErrorMessage(error.message || 'Error reading file. Please ensure it follows the correct format.');
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error reading the file. Please try again.');
    };

    try {
      reader.readAsText(file);
    } catch (error) {
      setErrorMessage('Error reading the file. Please try again.');
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    // Filter out empty rows
    const filledData = tableData.filter(row => 
      row.concentration.toString().trim() !== '' && 
      row.time.toString().trim() !== ''
    );
    
    if (filledData.length === 0) {
      setErrorMessage('No data to save');
      setShowSaveDialog(false);
      return;
    }
    
    let content = 'TIME (minutes),CONCENTRATION (wt%)\n';
    content += filledData.map(row => `${row.time},${row.concentration}`).join('\n');

    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.trim() || 'experimental_data'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowSaveDialog(false);
    setFileName('');
  };

  const handlePrint = () => {
    const printContent = document.createElement('div');
    
    // Filter out empty rows for printing
    const filledData = tableData.filter(row => 
      row.concentration.toString().trim() !== '' && 
      row.time.toString().trim() !== ''
    );
    
    if (filledData.length === 0) {
      setErrorMessage('No data to print');
      return;
    }

    printContent.innerHTML = `
      <style>
        @media print {
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid black; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
          @page { size: portrait; }
        }
      </style>
      <h2 style="text-align: center;">Experimental Time-Concentration Data</h2>
      
      <table>
        <thead>
          <tr>
            <th>Time (minutes)</th>
            <th>Concentration (wt%)</th>
          </tr>
        </thead>
        <tbody>
          ${filledData.map(row => `
            <tr>
              <td>${row.time}</td>
              <td>${row.concentration}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleClose = () => {
    navigate('/logged-off');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      setTableData(Array(60).fill().map(() => ({
        time: '',
        concentration: ''
      })));
      setErrorMessage('');
    }
  };

  const handleOk = () => {
    // Filter out empty rows before sending data
    const filledData = tableData.filter(row => 
      row.concentration.toString().trim() !== '' && 
      row.time.toString().trim() !== ''
    );
    
    if (filledData.length === 0) {
      setErrorMessage('Please enter some data before proceeding');
      return;
    }

    // Validate data is in ascending order by time
    for (let i = 1; i < filledData.length; i++) {
      if (Number(filledData[i].time) <= Number(filledData[i-1].time)) {
        setErrorMessage('Time values must be in ascending order');
        return;
      }
    }
    
    navigate('/concentration-time-experimental-graph', { 
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
        depth,
        graphType,
        selectedGraph,
        experimentalData: filledData
      } 
    });
  };

  const handleBack = () => {
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
        depth,
        graphType
      }
    });
  };

  return (
    <div className="experimental-data-container">
      <h2 className="table-title">Input Time-Concentration Data</h2>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <div className="table-container">
        <table ref={tableRef}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Time (minutes)</th>
              <th>Concentration (wt%)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="row-number">{index + 1}</td>
                <td>
                  <input
                    type="number"
                    value={row.time}
                    onChange={(e) => handleInputChange(index, 'time', e.target.value)}
                    step="1"
                    min="0"
                    // placeholder="Enter time"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.concentration}
                    onChange={(e) => handleInputChange(index, 'concentration', e.target.value)}
                    step="0.000001"
                    min="0"
                    // placeholder="Enter concentration"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="buttons-container">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden-input"
          accept=".txt"
        />
        <button onClick={handleFileOpen}>Open</button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handlePrint}>Print</button>
        <button onClick={handleClose}>Close</button>
        <button onClick={handleBack}>Back</button>
        <button onClick={handleOk}>Ok</button>
        <button onClick={handleReset} className="reset-button">Reset</button>
      </div>

      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Save File</h3>
            <input
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="filename-input"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <button 
                onClick={handleSaveConfirm}
                disabled={!fileName.trim()}
                className={!fileName.trim() ? 'disabled' : ''}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcentrationTimeExperimental;