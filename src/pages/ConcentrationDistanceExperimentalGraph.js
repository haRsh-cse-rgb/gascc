import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConcentrationDistanceGraph.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConcentrationDistanceExperimentalGraph = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({});
  const [xMax, setXMax] = useState(undefined);

  const findDataSplitPoint = (data) => {
    // Sort data by distance first to ensure we can properly detect the cycle
    const sortedData = [...data].sort((a, b) =>
      parseFloat(a.distance) - parseFloat(b.distance)
    );

    // Find where the depth values start increasing again after decreasing
    // This indicates the start of the second cycle (diffusion time)
    let previousDepth = -1;
    let isDecreasing = false;

    for (let i = 0; i < sortedData.length; i++) {
      const currentDepth = parseFloat(sortedData[i].distance);

      // Skip invalid entries
      if (isNaN(currentDepth)) continue;

      // If we were decreasing and now start increasing, we found the split point
      if (isDecreasing && currentDepth < previousDepth) {
        return i;
      }

      // Update our tracking of the trend
      if (currentDepth > previousDepth) {
        isDecreasing = false;
      } else if (currentDepth < previousDepth) {
        isDecreasing = true;
      }

      previousDepth = currentDepth;
    }

    // If no clear split point is found, return the midpoint
    return Math.floor(sortedData.length / 2);
  };

  const processExperimentalData = useCallback((experimentalData) => {
    try {
      // Filter out empty and invalid rows
      const filledData = experimentalData.filter(row =>
        row.concentration !== '' &&
        row.distance !== '' &&
        !isNaN(parseFloat(row.concentration)) &&
        !isNaN(parseFloat(row.distance))
      );

      if (filledData.length === 0) {
        throw new Error("No valid data points found");
      }

      // Find the split point between boost and diffusion time data
      const splitIndex = findDataSplitPoint(filledData);

      // Split the data into boost and diffusion time
      const boostTimeData = filledData.slice(0, splitIndex).map(row => ({
        x: parseFloat(row.distance),
        y: parseFloat(row.concentration)
      }));

      const diffusionTimeData = filledData.slice(splitIndex).map(row => ({
        x: parseFloat(row.distance),
        y: parseFloat(row.concentration)
      }));

      // Sort both datasets by distance
      boostTimeData.sort((a, b) => a.x - b.x);
      diffusionTimeData.sort((a, b) => a.x - b.x);

      const data = {
        labels: [...new Set([...boostTimeData, ...diffusionTimeData].map(point => point.x))].sort((a, b) => a - b),
        datasets: [
          {
            label: 'Boost Time',
            data: boostTimeData,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.1,
          },
          {
            label: 'Diffusion Time',
            data: diffusionTimeData,
            borderColor: 'rgba(192,75,75,1)',
            backgroundColor: 'rgba(192,75,75,0.2)',
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      };

      // Calculate the maximum depth value for the x-axis
      const maxDepth = Math.max(
        ...boostTimeData.map(point => point.x),
        ...diffusionTimeData.map(point => point.x)
      );
      // Store calculated maxDepth for use in chart options
      setXMax(Math.ceil(maxDepth));

      setGraphData(data);
    } catch (err) {
      console.error("Error processing experimental data:", err);
      setError(`Error processing experimental data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      // console.log("Received state:", location.state);
      setParams(location.state);
      processExperimentalData(location.state.experimentalData);
    } else {
      // console.warn("No state received in location");
      setError("No data received");
    }
  }, [location.state, processExperimentalData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Experimental Carbon Concentration (Wt%) vs Depth (mm)',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Depth (mm)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: 0,
        max: xMax,
        ticks: {
          callback: (value) => value.toFixed(1),
        },
      },
      y: {
        title: {
          display: true,
          text: 'Carbon Concentration (Wt%)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          callback: (value) => value.toFixed(2),
        },
      },
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGraphOptions = () => {
    navigate('/graph-options', {
      state: {
        ...params,
        previousGraph: '/concentration-distance-experimental-graph'
      }
    });
  };

  const handleClose = () => {
    navigate('/logged-off');
  };

  const handleBack = () => {
    navigate('/concentration-distance-experimental', {
      state: params
    });
  };

  const handleSaveData = () => {
    if (!graphData) return;

    const content = graphData.datasets.map(dataset => {
      return `${dataset.label}:\nDepth(mm),Concentration(Wt%)\n${dataset.data.map(point => `${point.x.toFixed(3)},${point.y.toFixed(3)}`).join('\n')}\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conc_distance_experimental_data.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="graph-container">
      <div className="graph-wrapper print-graph">
        {error ? (
          <p className="error-text">{error}</p>
        ) : graphData ? (
          <Line data={graphData} options={options} />
        ) : (
          <p className="loading-text">Loading graph...</p>
        )}
      </div>
      <div className="button-group">
        <button className="button back" onClick={handleBack}>Back</button>
        <button className="button graph-options" onClick={handleGraphOptions}>Graph Options</button>
        <button className="button save-data" onClick={handleSaveData}>Save Data</button>
        <button className="button print" onClick={handlePrint}>Print</button>
        <button className="button close" onClick={handleClose}>Exit</button>
      </div>
    </div>
  );
};

export default ConcentrationDistanceExperimentalGraph;