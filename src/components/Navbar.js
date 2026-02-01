import React from 'react';
import { authService } from '../api';

const Navbar = ({ user, onLogout }) => {
  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>📅 Meeting Scheduler</h1>
        <div className="navbar-actions">
          <div className="navbar-user">
            <span className="navbar-name">{user.name}</span>
            <span className="navbar-role">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
