import React, { useState } from 'react';
import './AuthPage.css';

function AuthPage({ onLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Optimistic UI: Immediately let the user in
    // We create a temporary user object locally
    const tempUser = { 
      name: formData.name, 
      email: formData.email,
      entryTime: new Date().toISOString()
    };
    
    // 1. Immediately log the user in (Client-side)
    onLogin(tempUser);

    // 2. Fire-and-Forget request to the backend
    // This runs in the background and doesn't block the UI
    const API_URL = 'https://gascc.onrender.com' || 'http://localhost:5000';
    
    fetch(`${API_URL}/api/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      keepalive: true // Ensure request survives if page unloads (though unlikely here)
    }).catch(err => {
      // Silently fail or log to analytics
      console.error('Background entry sync failed:', err);
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Welcome</h1>
        <p>Enter your details to proceed.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
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
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="auth-btn">
            Try Now
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
