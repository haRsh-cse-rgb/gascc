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

const ConcentrationDistanceGraph = () => {
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

  const findIntersection = (boostData, diffusionData) => {
    for (let i = 0; i < boostData.length - 1; i++) {
      const boost1 = boostData[i].y;
      const boost2 = boostData[i + 1].y;
      const diff1 = diffusionData[i].y;
      const diff2 = diffusionData[i + 1].y;

      // Check if lines intersect between these points
      if ((boost1 >= diff1 && boost2 <= diff2) ||
        (boost1 <= diff1 && boost2 >= diff2)) {
        return true;
      }
    }
    return false;
  };

  const generateData = useCallback(() => {
    try {
      // console.log("Starting generateData with params:", params);

      const {
        concentration = 0.2,
        activationPeriod = 1.3,
        diffusionPeriod = 0.8,
        carburisingTemp = 1223,
        boostTime = 9,
        diffusionTime = 3,
        thickness = 8.0,
        gridPoints = 100,
        coordinateSystem = '1',
        depth = '8'
      } = params;

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

      // console.log("Parsed values:", { hrs, dhrs, m, r, c, temp, bcw, dcw, cld });

      if (isNaN(m) || m <= 0) {
        throw new Error(`Invalid gridPoints value: ${gridPoints}`);
      }

      const n = Math.floor((cld * m) / (r * 1000));
      // console.log("Calculated n:", n);

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
      const dt = Math.floor((dx * dx) / d);

      let con = new Array(m + 1).fill(c);
      const gphx = Array(3).fill().map(() => new Array(m + 1).fill(0));
      const gphy = Array(3).fill().map(() => new Array(m + 1).fill(0));

      gphx[1][0] = 0;
      gphx[2][0] = 0;
      gphy[1][0] = bcw;
      gphy[2][0] = dcw;

      for (let tm = 1; tm <= 2; tm++) {
        gphx[tm][1] = 0;
        for (let j = 2; j <= m; j++) {
          gphx[tm][j] = (j - 1) * r / m;
        }
      }

      const t = 3600 * hrs;
      const dp = (hrs - dhrs) * 3600;
      let l = 0;

      for (let A = dt; A <= t; A += dt) {
        if (A > dp && l === 0) {
          for (let j = 1; j <= m; j++) {
            gphy[1][j] = con[j];
          }
          l = 1;
        }

        const dia = new Array(m + 1).fill(0);
        const suc = new Array(m + 1).fill(0);
        const sup = new Array(m + 1).fill(0);
        const sor = new Array(m + 1).fill(0);
        const aij = new Array(m + 1).fill(0);
        const cij = new Array(m + 1).fill(0);

        for (let i = 1; i <= m; i++) {
          const currentD = (0.07 + 0.06 * con[i]) * (Math.exp(-32000 / (1.98 * temp))) * 0.0001;
          const rp = (i - 0.5) * dr;
          const re = rp + dr;
          const rw = rp - dr;
          const ae = (currentD / dx * car) + (rp * currentD / dr * cyn) + (Math.pow(rp, 2) * currentD / dr * sph);
          const aw = (currentD / dx * car) + (rp * currentD / dr * cyn) + (Math.pow(rp, 2) * currentD / dr * sph);
          const bw = ((2 * mc * car) + (2 * rp * mc * cyn) + (2 * rp * rp * mc * sph)) * (A > dp ? dcw : bcw);
          const spw = -((2 * mc * car) + (2 * rp * mc * cyn) + (2 * rp * rp * mc * sph));
          const ap0 = (dx / dt * car) + ((Math.pow(re, 2) - Math.pow(rw, 2)) / (2 * dt)) * cyn +
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
      }

      for (let j = 1; j <= m; j++) {
        gphy[2][j] = con[j];
      }

      const gph = new Array(n).fill().map(() => new Array(4).fill(0));
      for (let i = 0; i < n; i++) {
        gph[i][0] = gphx[1][i] * 1000;
        gph[i][1] = gphy[1][i];
        gph[i][2] = gphx[1][i] * 1000;
        gph[i][3] = gphy[2][i];
      }

      // Create data points for intersection check
      const boostData = gph.map(point => ({ x: point[0], y: point[1] }));
      const diffusionData = gph.map(point => ({ x: point[2], y: point[3] }));

      // Check for intersection
      const hasIntersection = findIntersection(boostData, diffusionData);

      // If no intersection, return empty datasets
      if (!hasIntersection) {
        return {
          labels: gph.map(point => point[0]),
          datasets: [
            {
              label: 'Boost Time',
              data: [],
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              pointRadius: 2,
              pointHoverRadius: 5,
              borderWidth: 2,
              tension: 0.1,
            },
            {
              label: 'Diffusion Time',
              data: [],
              borderColor: 'rgba(192,75,75,1)',
              backgroundColor: 'rgba(192,75,75,0.2)',
              pointRadius: 2,
              pointHoverRadius: 5,
              borderWidth: 2,
              tension: 0.1,
            },
          ],
        };
      }

      // If intersection exists, return complete data
      return {
        labels: gph.map(point => point[0]),
        datasets: [
          {
            label: 'Boost Time',
            data: boostData,
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.1,
          },
          {
            label: 'Diffusion Time',
            data: diffusionData,
            borderColor: 'rgba(192,75,75,1)',
            backgroundColor: 'rgba(192,75,75,0.2)',
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.1,
          },
        ],
      };

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
        text: 'Carbon Concentration (Wt%) vs Depth (mm)',
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
        max: params.depth,
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
          callback: (value) => value.toFixed(1),
        },
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
        previousGraph: '/concentration-distance-graph'
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
    if (!graphData) return;

    const content = graphData.datasets.map(dataset => {
      return `${dataset.label}:\nDepth(mm),Concentration(Wt%)\n${dataset.data.map(point => `${point.x.toFixed(3)},${point.y.toFixed(3)}`).join('\n')}\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'concentration_distance_data.txt';
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

export default ConcentrationDistanceGraph;