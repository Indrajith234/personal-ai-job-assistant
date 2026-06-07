import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/analyze');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✦ ResumeAI</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start landing more interviews — it's completely free</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button id="register-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creating account...' : '🚀 Create Free Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
