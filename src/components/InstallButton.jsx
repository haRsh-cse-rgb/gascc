import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import './InstallButton.css';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const alreadyInstalled =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true ||
      (() => {
        try {
          return localStorage.getItem('pwaInstalled') === 'true';
        } catch (e) {
          return false;
        }
      })();

    if (alreadyInstalled) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS instructions
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        try {
          localStorage.setItem('pwaInstalled', 'true');
        } catch (e) {
          // ignore storage errors
        }
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show button if no install prompt available and not iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <button 
        className="install-button" 
        onClick={handleInstallClick}
        aria-label="Install App"
      >
        <Download size={18} />
        <span>Install App</span>
      </button>

      {showIOSInstructions && (
        <div className="ios-instructions-overlay" onClick={() => setShowIOSInstructions(false)}>
          <div className="ios-instructions-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="ios-instructions-close" 
              onClick={() => setShowIOSInstructions(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <div className="ios-instructions-content">
              <Smartphone size={48} className="ios-icon" />
              <h2>Install GasCarb App</h2>
              <p>To install this app on your iOS device:</p>
              <ol>
                <li>Tap the <strong>Share</strong> button <span className="share-icon">□↑</span> at the bottom of your screen</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the top right corner</li>
              </ol>
              <p className="ios-note">The app will appear on your home screen like a native app!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallButton;
