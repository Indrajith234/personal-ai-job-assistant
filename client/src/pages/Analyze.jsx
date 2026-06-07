import React, { useState, useRef } from 'react';
import api from '../utils/api';
import ScoreCircle from '../components/ScoreCircle';
import KeywordChips from '../components/KeywordChips';
import FeedbackPanel from '../components/FeedbackPanel';
import BonusFeatures from '../components/BonusFeatures';

const LOADING_STEPS = [
  '📄 Reading your PDF resume...',
  '🔍 Extracting text and structure...',
  '🤖 AI recruiter analyzing job match...',
  '📊 Calculating ATS score...',
  '✨ Generating personalized feedback...',
];

const Analyze = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const startLoadingAnimation = () => {
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 900);
    return interval;
  };

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload your PDF resume.');
    if (!jobDescription.trim()) return setError('Please paste the job description.');
    if (jobDescription.trim().length < 50) return setError('Job description seems too short. Please paste the full JD.');

    setError('');
    setResult(null);
    setLoading(true);
    setLoadingStep(0);
    const interval = startLoadingAnimation();

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);

      const res = await api.post('/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data.data);
      // Store resume text extracted by server — we'll re-extract from the JD text for bonus features
      setResumeText(jobDescription); // placeholder; bonus features use analysisData
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper analyze-page">
      <div className="container">
        <div className="analyze-header">
          <h1>🔍 Analyze Your Resume</h1>
          <p>Upload your PDF and paste the job description to get your instant ATS score</p>
        </div>

        <div className="analyze-layout">
          {/* ── Left: Input Panel ── */}
          <div className="input-panel">
            {/* Upload Zone */}
            <div className="input-card">
              <div className="input-card-header">
                <div className="input-card-icon">📄</div>
                <div className="input-card-title">Upload Resume (PDF)</div>
              </div>
              <div
                className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="file-input-hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                  id="resume-upload"
                />
                <div className="upload-icon">{file ? '✅' : '📤'}</div>
                <div className="upload-title">
                  {file ? 'Resume uploaded!' : 'Drop your PDF here'}
                </div>
                <div className="upload-subtitle">
                  {file ? 'Click to change file' : 'or click to browse — PDF only, max 10MB'}
                </div>
                {file && (
                  <div className="upload-file-info">
                    📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="input-card">
              <div className="input-card-header">
                <div className="input-card-icon">💼</div>
                <div className="input-card-title">Job Description</div>
              </div>
              <div className="form-group">
                <textarea
                  id="job-description"
                  className="form-textarea"
                  rows={12}
                  placeholder="Paste the full job description here...&#10;&#10;Include everything: requirements, responsibilities, preferred qualifications. The more detail, the better your analysis."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <div className="text-sm text-muted mt-4">
                  {jobDescription.length} characters
                  {jobDescription.length > 0 && jobDescription.length < 50 && (
                    <span style={{ color: 'var(--red)' }}> — too short, paste full JD</span>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && <div className="auth-error">{error}</div>}

            {/* Analyze Button */}
            <button
              id="analyze-btn"
              className="btn btn-primary btn-lg"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? '⏳ Analyzing...' : '🚀 Analyze Resume'}
            </button>
          </div>

          {/* ── Right: Results Panel ── */}
          <div className="results-panel" ref={resultsRef}>
            {!loading && !result && (
              <div className="card results-empty">
                <div className="results-empty-icon">🎯</div>
                <h3 style={{ marginBottom: 8, fontSize: '1.1rem' }}>Your Results Appear Here</h3>
                <p className="text-muted text-sm">
                  Upload your resume and paste a job description, then click Analyze to see your ATS score, missing keywords, and AI feedback.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="card loading-overlay">
                <div className="loading-spinner" />
                <p className="loading-text" style={{ fontWeight: 600 }}>AI Recruiter at Work...</p>
                <div className="loading-steps">
                  {LOADING_STEPS.map((step, i) => (
                    <div key={i} className={`loading-step ${i <= loadingStep ? 'active' : ''}`}>
                      <div className="loading-step-dot" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ScoreCircle
                  score={result.matchScore}
                  jobTitle={result.jobTitle}
                  company={result.company}
                />
                <KeywordChips
                  matchedKeywords={result.matchedKeywords}
                  missingKeywords={result.missingKeywords}
                />
                <FeedbackPanel
                  feedback={result.feedback}
                  improvementTips={result.improvementTips}
                  strengths={result.strengths}
                />
                <BonusFeatures
                  analysisData={result}
                  resumeText={resumeText}
                  jobDescription={jobDescription}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyze;
