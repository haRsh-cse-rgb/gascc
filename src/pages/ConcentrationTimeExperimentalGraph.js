import React from 'react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
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

const ConcentrationTimeExperimentalGraph = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructure all state parameters
  const {
    experimentalData,
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

  // Store all parameters for passing to other components
  const params = {
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
    experimentalData
  };

  // Convert experimental data to chart format
  const chartData = {
    datasets: [
      {
        label: 'Experimental Carbon Concentration',
        data: experimentalData?.map(point => ({
          x: Number(point.time),
          y: Number(point.concentration)
        })) || [],
        borderColor: 'rgba(255,99,132,1)',
        backgroundColor: 'rgba(255,99,132,0.2)',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Experimental Carbon Concentration (Wt%) vs Time (Minutes) at Depth of ${depth || 1.0}mm`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const useReducedPrecision = parseFloat(thickness) > 10 || parseFloat(depth) > 10;
            const yValue = useReducedPrecision 
              ? context.parsed.y.toFixed(3)
              : context.parsed.y.toFixed(6);
            return `Concentration: ${yValue} Wt%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Time (Minutes)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: 0,
        ticks: {
          callback: function(value) {
            return Math.round(value);
          }
        }
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
        min: Number(concentration) || 0,
      },
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate('/logged-off');
  };

  const handleGraphOptions = () => {
    navigate('/graph-options', { 
      state: {
        ...params,
        previousGraph: '/concentration-time-experimental-graph'
      }
    });
  };

  const handleBack = () => {
    navigate('/concentration-time-experimental', {
      state: params
    });
  };

  const handleSaveData = () => {
    if (!experimentalData) return;

    const useReducedPrecision = parseFloat(thickness) > 10 || parseFloat(depth) > 10;
    const content = "TIME (minutes),CONCENTRATION (wt%)\n" +
      experimentalData.map(point => {
        const concentration = useReducedPrecision 
          ? Number(point.concentration).toFixed(3) 
          : Number(point.concentration).toFixed(6);
        return `${point.time},${concentration}`;
      }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'experimental_concentration_time_data.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="graph-container">
      <div className="graph-wrapper print-graph">
        {!experimentalData ? (
          <p className="error-text">No experimental data available</p>
        ) : (
          <Line data={chartData} options={options} />
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

export default ConcentrationTimeExperimentalGraph;