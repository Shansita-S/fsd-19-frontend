import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './api';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import OrganizerDashboard from './components/OrganizerDashboard';
import ParticipantDashboard from './components/ParticipantDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        
        <Routes>
          {!user ? (
            <>
              <Route 
                path="/login" 
                element={<Login onLoginSuccess={handleLoginSuccess} />} 
              />
              <Route 
                path="/register" 
                element={<Register onRegisterSuccess={handleRegisterSuccess} />} 
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route 
                path="/" 
                element={
                  user.role === 'ORGANIZER' 
                    ? <OrganizerDashboard /> 
                    : <ParticipantDashboard />
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
