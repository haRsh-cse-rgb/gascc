import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConcentrationDistanceExperimental.css';

const ConcentrationDistanceExperimental = () => {
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

  const [tableData, setTableData] = useState(
    Array(60).fill().map((_, index) => ({
      concentration: '',
      distance: ''
    }))
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleInputChange = (index, field, value) => {
    const newData = [...tableData];
    // If editing the last row and it contains data, add more rows
    if (index === tableData.length - 1 && value !== '') {
      newData.push(...Array(10).fill().map(() => ({
        concentration: '',
        distance: ''
      })));
    }
    newData[index][field] = value;
    setTableData(newData);
  };

  // const handleFileOpen = () => {
  //   fileInputRef.current.click();
  // };

  const parseFileContent = (content) => {
    try {
      // Split into sections (split by empty lines)
      const sections = content.split(/\n\s*\n/);
      let allData = [];

      sections.forEach(section => {
        if (section.trim()) {  // If section is not empty
          const lines = section.split('\n');
          
          // Skip the first line (title) and header row
          const dataLines = lines.slice(2).filter(line => line.trim());
          
          const sectionData = dataLines.map(line => {
            const [depth, concentration] = line.split(',').map(val => val.trim());
            return {
              distance: depth,
              concentration: concentration
            };
          });
          
          allData = [...allData, ...sectionData];
        }
      });

      // Calculate required table size (at least 60 or data length + buffer)
      const minSize = Math.max(60, allData.length + 10);
      
      // Create new table data array
      const newData = Array(minSize).fill().map((_, index) => {
        if (index < allData.length) {
          return {
            distance: allData[index].distance,
            concentration: allData[index].concentration
          };
        }
        return {
          distance: '',
          concentration: ''
        };
      });

      return newData;
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error('Invalid file format');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedData = parseFileContent(content);
        setTableData(parsedData);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please ensure it follows the correct format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    // Filter out empty rows
    const filledData = tableData.filter(row => row.concentration !== '' && row.distance !== '');
    
    // Find the midpoint of the data to separate into sections
    const midpoint = Math.ceil(filledData.length / 2);
    const firstSection = filledData.slice(0, midpoint);
    const secondSection = filledData.slice(midpoint);
    
    let content = 'Boost Time:\nDepth(mm),Concentration(Wt%)\n';
    content += firstSection.map(row => `${row.distance},${row.concentration}`).join('\n');
    content += '\n\nDiffusion Time:\nDepth(mm),Concentration(Wt%)\n';
    content += secondSection.map(row => `${row.distance},${row.concentration}`).join('\n');
    content += '\n';

    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setShowSaveDialog(false);
    setFileName('');
  };

  const handlePrint = () => {
    const printContent = document.createElement('div');
    
    // Filter out empty rows for printing
    const filledData = tableData.filter(row => row.concentration !== '' && row.distance !== '');
    const midpoint = Math.ceil(filledData.length / 2);
    
    printContent.innerHTML = `
      <style>
        @media print {
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid black; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
          .section-header { font-weight: bold; margin-top: 20px; }
          @page { size: landscape; }
        }
      </style>
      <h2 style="text-align: center;">Experimental Data</h2>
      
      <div class="section-header">Boost Time:</div>
      <table>
        <thead>
          <tr>
            <th>Depth (mm)</th>
            <th>Concentration (Wt%)</th>
          </tr>
        </thead>
        <tbody>
          ${filledData.slice(0, midpoint)
            .map(row => `
              <tr>
                <td>${row.distance}</td>
                <td>${row.concentration}</td>
              </tr>
            `).join('')}
        </tbody>
      </table>

      <div class="section-header">Diffusion Time:</div>
      <table>
        <thead>
          <tr>
            <th>Depth (mm)</th>
            <th>Concentration (Wt%)</th>
          </tr>
        </thead>
        <tbody>
          ${filledData.slice(midpoint)
            .map(row => `
              <tr>
                <td>${row.distance}</td>
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
    setTableData(Array(60).fill().map(() => ({
      concentration: '',
      distance: ''
    })));
  };

  const handleOk = () => {
    // Filter out empty rows before sending data
    const filledData = tableData.filter(row => row.concentration !== '' && row.distance !== '');
    
    navigate('/concentration-distance-experimental-graph', { 
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
      <h2 className="table-title">Input Distance-Concentration Data</h2>
      
      <div className="table-container">
        <table ref={tableRef}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Distance (mm)</th>
              <th>Concentration (Wt%)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="row-number">{index + 1}</td>
                <td>
                  <input
                    type="number"
                    value={row.distance}
                    onChange={(e) => handleInputChange(index, 'distance', e.target.value)}
                    step="0.001"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.concentration}
                    onChange={(e) => handleInputChange(index, 'concentration', e.target.value)}
                    step="0.001"
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
        {/* <button onClick={handleFileOpen}>Open</button> */}
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
                disabled={!fileName}
                className={!fileName ? 'disabled' : ''}
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

export default ConcentrationDistanceExperimental;