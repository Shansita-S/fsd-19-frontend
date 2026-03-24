import React from 'react';
import { authService } from '../api';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ user, onLogout }) => {
  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>Schedulify: Smart Meeting Organizer</h1>
        <div className="navbar-actions">
          <NotificationPanel user={user} />
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
