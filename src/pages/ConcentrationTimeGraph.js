import React, { useState, useEffect, useCallback } from 'react';
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

const ConcentrationTimeGraph = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({});

  useEffect(() => {
    if (location.state) {
      // console.log("Received state:", location.state);
      setParams(location.state);
    } else {
      // console.warn("No state received in location");
    }
  }, [location.state]);

  const generateData = useCallback(() => {
    try {
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
        coordinateSystem = '1'
      } = params;

      // Check if we should use reduced precision
      const useReducedPrecision = parseFloat(thickness) > 10 || parseFloat(depth) > 10;

      // Convert parameters  
      const hrs = parseFloat(boostTime);
      const dhrs = parseFloat(diffusionTime);
      const m = parseInt(gridPoints);
      const r = parseFloat(thickness) / 1000;
      const c = parseFloat(concentration);
      const temp = parseFloat(carburisingTemp);
      const bcw = parseFloat(activationPeriod);
      const dcw = parseFloat(diffusionPeriod);
      const cld = parseFloat(depth);

      // Calculate n  
      const n = Math.floor((cld * m) / (r * 1000));

      // Initialize coordinate system
      let car = 0, cyn = 0, sph = 0;
      switch (String(coordinateSystem)) {
        case '1':
          car = 1;
          break;
        case '2':
          cyn = 1;
          break;
        case '3':
          sph = 1;
          break;
        default:
          car = 1;
      }

      const dr = r / m;
      const dx = dr;
      const d = (0.07 + 0.06 * c) * (Math.exp(-32000 / (1.98 * temp))) * 0.0001;
      const mc = 0.000000088;

      // Initialize arrays  
      const con = new Array(m + 1).fill(c);
      const dia = new Array(2500).fill(0);
      const suc = new Array(2500).fill(0);
      const sup = new Array(2500).fill(0);
      const sor = new Array(2500).fill(0);
      const aij = new Array(2500).fill(0);
      const cij = new Array(2500).fill(0);

      const t = Math.max(3600 * hrs, 42000);
      const dp = (hrs - dhrs) * 3600;
      const dt = 1800;
      const p = Math.ceil(t / dt) + 1;

      // Initialize graph data array  
      const gr = Array(p + 1).fill().map(() => Array(2).fill(0));
      let currentP = 1;

      // Main time loop
      for (let A = dt; A <= t; A += dt) {
        for (let i = 1; i <= m; i++) {
          const rp = (i - 0.5) * dr;
          const re = rp + dr;
          const rw = rp - dr;
          const ae = (d / dx * car) + (rp * d / dr * cyn) + (Math.pow(rp, 2) * d / dr * sph);
          const aw = (d / dx * car) + (rp * d / dr * cyn) + (Math.pow(rp, 2) * d / dr * sph);
          let bw = ((2 * mc * car) + (2 * rp * mc * cyn) + (2 * rp * rp * mc * sph)) * bcw;
          const spw = -((2 * mc * car) + (2 * rp * mc * cyn) + (2 * rp * rp * mc * sph));

          if (A > dp) {
            bw = ((2 * mc * car) + (2 * rp * mc * cyn) + (2 * rp * rp * mc * sph)) * dcw;
          }

          const ap0 = (dx / dt * car) +
            ((Math.pow(re, 2) - Math.pow(rw, 2)) / (2 * dt)) * cyn +
            ((Math.pow(re, 3) - Math.pow(rw, 3)) / (3 * dt)) * sph;

          if (i === 1) {
            dia[i] = ae + ap0 - spw;
            suc[i] = 0;
            sup[i] = ae;
            sor[i] = bw + ap0 * con[i];
          } else if (i === m) {
            dia[i] = aw + ap0;
            suc[i] = aw;
            sup[i] = 0;
            sor[i] = ap0 * con[i];
          } else {
            dia[i] = ae + aw + ap0;
            suc[i] = aw;
            sup[i] = ae;
            sor[i] = ap0 * con[i];
          }

          if (i === 1) {
            aij[i] = sup[i] / dia[i];
            cij[i] = sor[i] / dia[i];
          } else {
            aij[i] = sup[i] / (dia[i] - (suc[i] * aij[i - 1]));
            cij[i] = (suc[i] * cij[i - 1] + sor[i]) / (dia[i] - (suc[i] * aij[i - 1]));
          }
        }

        for (let k = m; k >= 1; k--) {
          if (k === m) {
            con[k] = cij[k];
          } else {
            con[k] = aij[k] * con[k + 1] + cij[k];
            if (con[k] < c) {
              con[k] = c;
            }
          }
        }

        // Round values based on precision setting
        const timeValue = useReducedPrecision
          ? Math.round((A - dt) / 60)
          : ((A - dt) / 60).toFixed(1);
        const concentrationValue = useReducedPrecision
          ? Number(con[n].toFixed(3))
          : con[n];

        gr[currentP][0] = timeValue;
        gr[currentP][1] = concentrationValue;
        currentP++;
      }

      const chartData = {
        datasets: [
          {
            label: 'Carbon Concentration',
            data: gr.slice(1, currentP).map(point => ({
              x: Number(point[0]),
              y: Number(point[1])
            })),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointRadius: useReducedPrecision ? 3 : 2,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      };

      return chartData;
    } catch (err) {
      console.error("Error details:", err);
      setError(`Error generating graph data: ${err.message}`);
      return null;
    }
  }, [params]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Carbon Concentration (Wt%) vs Time (Minutes) at Depth of ${params.depth || 1.0}mm`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const useReducedPrecision = parseFloat(params.thickness) > 10 || parseFloat(params.depth) > 10;
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
        max: 700,
        ticks: {
          stepSize: 100,
          callback: function (value) {
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
        min: Number(params.concentration) || 0,
        // ticks: {
        //   callback: function(value) {
        //     const useReducedPrecision = parseFloat(params.thickness) > 10 || parseFloat(params.depth) > 10;
        //     return useReducedPrecision ? value.toFixed(3) : value.toFixed(3);
        //   }
        // }
      },
    },
  };

  useEffect(() => {
    const data = generateData();
    if (data) {
      setGraphData(data);
    }
  }, [generateData]);

  const handlePrint = () => {
    window.print();
  };

  const handleGraphOptions = () => {
    navigate('/graph-options', {
      state: {
        ...params,
        previousGraph: '/concentration-time-graph'
      }
    });
  };

  const handleClose = () => {
    navigate('/logged-off');
  };

  const handleBack = () => {
    navigate(-1, {
      state: params
    });
  };

  const handleSaveData = () => {
    if (!graphData || !graphData.datasets || !graphData.datasets[0].data) return;

    const useReducedPrecision = parseFloat(params.thickness) > 10 || parseFloat(params.depth) > 10;
    const data = graphData.datasets[0].data;
    const content = "TIME (minutes),CONCENTRATION (wt%)\n" +
      data.map(point => `${point.x},${useReducedPrecision ? point.y.toFixed(3) : point.y.toFixed(6)}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'concentration_time_data.txt';
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

export default ConcentrationTimeGraph;