import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="logo-icon">✦</div>
          ResumeAI
        </Link>

        {/* Desktop Nav Links */}
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
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
            </>
          )}
        </div>

        {/* Hamburger Button (mobile only) */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <div className="mobile-user-greeting">Hi, {user.name.split(' ')[0]} 👋</div>
            <Link to="/analyze" className={`mobile-nav-link ${isActive('/analyze') ? 'active' : ''}`} onClick={closeMenu}>
              🔍 Analyze Resume
            </Link>
            <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeMenu}>
              📊 Dashboard
            </Link>
            <button className="mobile-logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="mobile-nav-link" onClick={closeMenu}>Home</Link>
            <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="mobile-nav-link primary" onClick={closeMenu}>Get Started →</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
