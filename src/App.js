// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import InstallButton from './components/InstallButton';
import HomePage from './pages/HomePage';
import LoggedOff from './pages/LoggedOff';
import MaterialSelection from './pages/MaterialSelection';
import OperatingParameters from './pages/OperatingParameters';
import CalculationMode from './pages/CalculationMode';
import ModelFormulation from './pages/ModelFormulation';
import GraphSelection from './pages/GraphSelection';
import GraphTypeSelection from './pages/GraphTypeSelection';
import ConcentrationDistanceGraph from './pages/ConcentrationDistanceGraph';
import GraphOptions from './pages/GraphOptions';
import ConcentrationTimeGraph from './pages/ConcentrationTimeGraph';
import ConcentrationDistanceExperimental from './pages/ConcentrationDistanceExperimental';
import ConcentrationDistanceExperimentalGraph from './pages/ConcentrationDistanceExperimentalGraph';
import ConcentrationTimeExperimental from './pages/ConcentrationTimeExperimental';
import ConcentrationTimeExperimentalGraph from './pages/ConcentrationTimeExperimentalGraph';
import AuthPage from './pages/AuthPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful:', registration.scope);
          })
          .catch((error) => {
            console.log('ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  // Detect if app is installed and hide NavBar accordingly
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true;
      const isMarkedInstalled = localStorage.getItem('pwaInstalled') === 'true';
      setIsAppInstalled(isStandalone || isMarkedInstalled);
    };

    checkInstalled();

    const onAppInstalled = () => {
      try {
        localStorage.setItem('pwaInstalled', 'true');
      } catch (e) {
        // ignore storage errors
      }
      setIsAppInstalled(true);
    };
    window.addEventListener('appinstalled', onAppInstalled);
    return () => window.removeEventListener('appinstalled', onAppInstalled);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      {/* Layout-level Install button (only shows when not installed) */}
      {!isAppInstalled && <InstallButton />}
      
      {!user ? (
        <Routes>
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <>
          {!isAppInstalled && <NavBar onLogout={handleLogout} />}
          <Routes>
            <Route path="/" element={<HomePage onLogout={handleLogout} />} />
            <Route path="/logged-off" element={<LoggedOff />} />
            <Route path="/material-selection" element={<MaterialSelection />} />
            <Route path="/operating-parameters" element={<OperatingParameters />} />
            <Route path="/calculation-mode" element={<CalculationMode />} />
            <Route path="/model-formulation" element={<ModelFormulation />} />
            <Route path="/graph-selection" element={<GraphSelection />} />
            <Route path="/graph-type-selection" element={<GraphTypeSelection />} />
            <Route path="/concentration-distance-graph" element={<ConcentrationDistanceGraph />} />
            <Route path="/graph-options" element={<GraphOptions />} />
            <Route path="/concentration-time-graph" element={<ConcentrationTimeGraph />} />
            <Route path="/concentration-distance-experimental" element={<ConcentrationDistanceExperimental />} />
            <Route path="/concentration-distance-experimental-graph" element={<ConcentrationDistanceExperimentalGraph />} />
            <Route path="/concentration-time-experimental" element={<ConcentrationTimeExperimental />} />
            <Route path="/concentration-time-experimental-graph" element={<ConcentrationTimeExperimentalGraph />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
