import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">✦</div>
          ResumeAI
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/analyze" className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}>
                🔍 Analyze
              </Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                📊 Dashboard
              </Link>
              <div className="nav-user">
                <span className="nav-user-name">Hi, {user.name.split(' ')[0]} 👋</span>
                <button className="btn-nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started →
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
