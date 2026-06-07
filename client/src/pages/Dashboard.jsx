import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13,13,26,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.85rem',
      }}>
        <p style={{ color: '#a0a0b8', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#8b5cf6', fontWeight: 700 }}>Score: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      setData(res.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      alert('Failed to delete. Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const chartData = data?.stats?.scoreHistory?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.score,
  })) || [];

  return (
    <div className="page-wrapper dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Your Dashboard</h1>
          <p>Track your progress and see how your resume score improves over time</p>
        </div>

        {/* ── Stats Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">📋</div>
            <div className="stat-card-value">{data?.stats?.totalAnalyses || 0}</div>
            <div className="stat-card-label">Total Analyses</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🎯</div>
            <div className="stat-card-value">{data?.stats?.averageScore || 0}%</div>
            <div className="stat-card-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🏆</div>
            <div className="stat-card-value">{data?.stats?.bestScore || 0}%</div>
            <div className="stat-card-label">Best Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📈</div>
            <div className="stat-card-value">
              {chartData.length >= 2
                ? `${chartData[chartData.length - 1].score - chartData[0].score > 0 ? '+' : ''}${chartData[chartData.length - 1].score - chartData[0].score}%`
                : 'N/A'}
            </div>
            <div className="stat-card-label">Score Change</div>
          </div>
        </div>

        {/* ── Score Chart ── */}
        {chartData.length > 1 && (
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">📈 Score Progress Over Time</div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b6b85" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#6b6b85" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#scoreGradient)"
                  dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#a78bfa' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── History Table ── */}
        <div className="history-card">
          <div className="history-header">
            <div className="history-title">📋 Analysis History</div>
            <Link to="/analyze" className="btn btn-primary btn-sm">
              + New Analysis
            </Link>
          </div>

          {data?.analyses?.length === 0 ? (
            <div className="history-empty">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <h3 style={{ marginBottom: 8 }}>No analyses yet</h3>
              <p style={{ marginBottom: 20, fontSize: '0.9rem' }}>
                Upload your first resume to see your results here
              </p>
              <Link to="/analyze" className="btn btn-primary">
                🚀 Analyze My Resume
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Score</th>
                    <th>Matched</th>
                    <th>Missing</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.analyses?.map((analysis) => (
                    <tr key={analysis._id}>
                      <td>
                        <div className="history-job-title">{analysis.jobTitle}</div>
                        <div className="history-company">{analysis.company}</div>
                      </td>
                      <td>
                        <span className={`history-score-badge ${getScoreClass(analysis.matchScore)}`}>
                          {analysis.matchScore}%
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                          ✅ {analysis.matchedKeywords?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#f87171', fontWeight: 600 }}>
                          ❌ {analysis.missingKeywords?.length || 0}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(analysis.createdAt)}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(analysis._id)}
                          disabled={deletingId === analysis._id}
                        >
                          {deletingId === analysis._id ? '...' : '🗑'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
