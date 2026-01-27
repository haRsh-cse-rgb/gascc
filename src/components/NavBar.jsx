import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './NavBar.css';

function NavBar({ onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Add/remove class to body when menu opens/closes
    if (isMenuOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
  }, [isMenuOpen]);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    if (window.innerWidth <= 768) {
      setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    }
  };

  const handleMouseEnter = (dropdownName) => {
    if (window.innerWidth > 768) {
      setActiveDropdown(dropdownName);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setActiveDropdown(null);
    }
  };

  // Function to determine if a nav item should be inactive
  const getNavLinkClass = (index) => {
    return index >= 1 && index <= 7 ? 'nav-link inactive' : 'nav-link';
  };

  const isFileButtonInactive = location.pathname === '/logged-off';

  return (
    <nav className="navbar">
      <button className="mobile-menu-button" onClick={toggleMenu}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`nav-list ${isMenuOpen ? 'show' : ''}`}>
        {/* File Dropdown */}
        <li
          className={`nav-item dropdown ${isFileButtonInactive ? 'inactive' : ''} ${activeDropdown === 'file' ? 'active' : ''}`}
          onMouseEnter={() => !isFileButtonInactive && handleMouseEnter('file')}
          onMouseLeave={handleMouseLeave}
          onClick={() => !isFileButtonInactive && toggleDropdown('file')}
        >
          <span className={`nav-link ${isFileButtonInactive ? 'inactive' : ''}`}>File</span>
          {!isFileButtonInactive && activeDropdown === 'file' && (
            <ul className="dropdown-menu">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => { 
                    toggleMenu(); 
                    if (onLogout) onLogout(); 
                  }}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}
                >
                  Exit
                </button>
              </li>
            </ul>
          )}
        </li>

        <li><Link to="/material-selection" className={getNavLinkClass(1)}>Material Selection</Link></li>
        <li><Link to="/coordinate-system" className={getNavLinkClass(2)}>Coordinate System</Link></li>
        <li><Link to="/visualizations" className={getNavLinkClass(3)}>Visualizations</Link></li>
        <li><Link to="/theoretical-profile" className={getNavLinkClass(4)}>Theoretical Profile</Link></li>
        <li><Link to="/experimental-profile" className={getNavLinkClass(5)}>Experimental Profile</Link></li>
        <li><Link to="/execute-process" className={getNavLinkClass(6)}>Execute Process</Link></li>
        <li><Link to="/show" className={getNavLinkClass(7)}>Show</Link></li>

        <li
          className={`nav-item dropdown ${activeDropdown === 'help' ? 'active' : ''}`}
          onMouseEnter={() => handleMouseEnter('help')}
          onMouseLeave={handleMouseLeave}
          onClick={() => toggleDropdown('help')}
        >
          <span className="nav-link">Help</span>
          {activeDropdown === 'help' && (
            <ul className="dropdown-menu">
              <li>
                <a
                  href="https://support.microsoft.com/en-us/topic/error-opening-help-in-windows-based-programs-feature-not-included-or-help-not-supported-3c841463-d67c-6062-0ee7-1a149da3973b"
                  className="dropdown-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={toggleMenu}
                >
                  Content
                </a>
              </li>
              <li>
                <a
                  href="https://www.rescons.in/gasCarburising.html"
                  className="dropdown-item"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={toggleMenu}
                >
                  About
                </a>
              </li>
            </ul>
          )}
        </li>

        <li>
          <a
            href="https://www.rescons.in/contact.html"
            className="nav-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;