import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏥</span>
          <span>Doctor Appointments</span>
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Available Slots
              </Link>
              <Link
                to="/bookings"
                className={location.pathname === '/bookings' ? 'active' : ''}
              >
                My Bookings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  Admin
                </Link>
              )}
              <div className="user-info">
                <span className="user-name">{user?.name || user?.email}</span>
                <button
                  className="logout-button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className={location.pathname === '/login' ? 'active' : ''}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

