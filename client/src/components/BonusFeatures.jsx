import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TABS = [
  { id: 'cover-letter', label: '📝 Cover Letter', emoji: '📝' },
  { id: 'interview-qs', label: '🎤 Interview Qs', emoji: '🎤' },
  { id: 'bullet-rewriter', label: '✏️ Bullet Rewriter', emoji: '✏️' },
  { id: 'linkedin', label: '💼 LinkedIn Bio', emoji: '💼' },
];

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? '✅ Copied!' : '📋 Copy'}
    </button>
  );
};

const BonusFeatures = ({ analysisData, resumeText, jobDescription }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cover-letter');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [bulletInput, setBulletInput] = useState('');
  const [openQuestion, setOpenQuestion] = useState(null);

  const callFeature = async (endpoint, payload) => {
    setLoading(true);
    try {
      const res = await api.post(`/features/${endpoint}`, payload);
      setResults((prev) => ({ ...prev, [endpoint]: res.data.data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Cover Letter ────────────────────────────────────────
  const generateCoverLetter = () => {
    callFeature('cover-letter', {
      resumeText,
      jobDescription,
      userName: user?.name,
      jobTitle: analysisData?.jobTitle,
      company: analysisData?.company,
    });
  };

  // ── Interview Questions ──────────────────────────────────
  const generateInterviewQs = () => {
    callFeature('interview-questions', {
      jobDescription,
      resumeText,
      jobTitle: analysisData?.jobTitle,
      company: analysisData?.company,
    });
  };

  // ── Bullet Rewriter ──────────────────────────────────────
  const rewriteBullet = () => {
    if (!bulletInput.trim()) return alert('Please paste a resume bullet point first.');
    callFeature('rewrite-bullet', {
      bulletPoint: bulletInput,
      missingKeywords: analysisData?.missingKeywords,
      jobTitle: analysisData?.jobTitle,
    });
  };

  // ── LinkedIn ──────────────────────────────────────────────
  const generateLinkedIn = () => {
    callFeature('linkedin-summary', {
      resumeText,
      targetRole: analysisData?.jobTitle,
      userName: user?.name,
    });
  };

  return (
    <div className="bonus-features">
      <div className="bonus-title">
        ✨ Bonus AI Tools
        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          — Powered by your analysis
        </span>
      </div>

      {/* Tabs */}
      <div className="bonus-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`bonus-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Cover Letter ─────────────────────────────── */}
      {activeTab === 'cover-letter' && (
        <div className="bonus-content">
          <div className="bonus-section">
            <div className="bonus-section-header">
              <div className="bonus-section-info">
                <h3>📝 Cover Letter Generator</h3>
                <p>Generate a tailored cover letter based on your resume and this job</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={generateCoverLetter}
                disabled={loading}
              >
                {loading ? '⏳ Generating...' : '✨ Generate'}
              </button>
            </div>
            {results['cover-letter'] && (
              <div className="bonus-output" style={{ position: 'relative' }}>
                <CopyButton text={results['cover-letter'].coverLetter} />
                {results['cover-letter'].coverLetter}
              </div>
            )}
            {!results['cover-letter'] && !loading && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Click Generate to create your personalized cover letter ✨
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Interview Questions ───────────────────────── */}
      {activeTab === 'interview-qs' && (
        <div className="bonus-content">
          <div className="bonus-section">
            <div className="bonus-section-header">
              <div className="bonus-section-info">
                <h3>🎤 Interview Question Predictor</h3>
                <p>10 likely questions based on this job description + how to answer them</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={generateInterviewQs}
                disabled={loading}
              >
                {loading ? '⏳ Predicting...' : '🎯 Predict'}
              </button>
            </div>
            {results['interview-questions'] && (
              <div className="questions-list">
                {results['interview-questions'].questions?.map((q, i) => (
                  <div key={i} className="question-card">
                    <div
                      className="question-header"
                      onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                    >
                      <div className="question-num">{i + 1}</div>
                      <div className="question-text">{q.question}</div>
                      <div className="question-meta">
                        <span className="question-category">{q.category}</span>
                        <span className={`question-difficulty ${q.difficulty}`}>{q.difficulty}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                          {openQuestion === i ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                    <div className={`question-body ${openQuestion === i ? 'open' : ''}`}>
                      <p><strong>Why they ask:</strong> {q.whyAsked}</p>
                      <p><strong>How to answer:</strong> {q.answerFramework}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!results['interview-questions'] && !loading && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Click Predict to see likely interview questions 🎯
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bullet Rewriter ───────────────────────────── */}
      {activeTab === 'bullet-rewriter' && (
        <div className="bonus-content">
          <div className="bonus-section">
            <div className="bonus-section-header">
              <div className="bonus-section-info">
                <h3>✏️ Resume Bullet Point Rewriter</h3>
                <p>Paste a weak bullet point and get 3 stronger, ATS-optimized versions</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your existing bullet point</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder='e.g. "I worked on the company website and fixed some bugs"'
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-sm mt-4"
              onClick={rewriteBullet}
              disabled={loading}
            >
              {loading ? '⏳ Rewriting...' : '✨ Rewrite'}
            </button>
            {results['rewrite-bullet'] && (
              <div className="bullet-versions">
                {results['rewrite-bullet'].versions?.map((v, i) => (
                  <div key={i} className="bullet-version">
                    <div className={`bullet-version-level ${v.level}`}>
                      {v.level === 'Good' && '⭐'} {v.level === 'Better' && '⭐⭐'} {v.level === 'Best' && '⭐⭐⭐'} {v.level}
                    </div>
                    <div className="bullet-version-text">• {v.text}</div>
                    <div className="bullet-version-improvement">↑ {v.improvement}</div>
                    <CopyButton text={v.text} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LinkedIn Summary ──────────────────────────── */}
      {activeTab === 'linkedin' && (
        <div className="bonus-content">
          <div className="bonus-section">
            <div className="bonus-section-header">
              <div className="bonus-section-info">
                <h3>💼 LinkedIn Summary Generator</h3>
                <p>Generate a compelling LinkedIn About section from your resume</p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={generateLinkedIn}
                disabled={loading}
              >
                {loading ? '⏳ Writing...' : '✨ Generate'}
              </button>
            </div>
            {results['linkedin-summary'] && (
              <div className="bonus-output" style={{ position: 'relative' }}>
                <CopyButton text={results['linkedin-summary'].linkedinSummary} />
                {results['linkedin-summary'].linkedinSummary}
              </div>
            )}
            {!results['linkedin-summary'] && !loading && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Click Generate to create your LinkedIn About section 💼
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-overlay" style={{ padding: '40px' }}>
          <div className="loading-spinner" />
          <p className="loading-text">AI is working its magic...</p>
        </div>
      )}
    </div>
  );
};

export default BonusFeatures;
