import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

function AuthPage({ onLogin }) {
  const [view, setView] = useState('selection'); // selection, login, register
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_URL = 'https://gascc.onrender.com' || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else if (response.status === 404) {
        setError('Email not found. Redirecting to registration...');
        setTimeout(() => {
            setView('register');
            setError('');
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_URL = 'https://gascc.onrender.com' || 'http://localhost:5000';

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'selection') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Welcome</h1>
          <p>Please select an option to continue</p>
          <div className="button-group">
            <button onClick={() => setView('login')} className="auth-btn">Login</button>
            <button onClick={() => setView('register')} className="auth-btn secondary">Register</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Checking...' : 'Login'}
            </button>
            <button type="button" className="link-btn" onClick={() => setView('register')}>
              Need an account? Register
            </button>
            <button type="button" className="link-btn" onClick={() => setView('selection')}>
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            <button type="button" className="link-btn" onClick={() => setView('login')}>
              Already have an account? Login
            </button>
            <button type="button" className="link-btn" onClick={() => setView('selection')}>
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

export default AuthPage;
