import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page page-wrapper">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            ✦ Powered by Google Gemini AI
          </div>

          <h1 className="hero-title">
            Beat the ATS.<br />
            <span className="gradient-text">Land the Interview.</span>
          </h1>

          <p className="hero-subtitle">
            Upload your resume, paste any job description, and get an instant AI-powered
            match score, missing keywords, and actionable feedback — in seconds.
          </p>

          <div className="hero-cta">
            <Link to={user ? '/analyze' : '/register'} className="btn btn-primary btn-lg">
              🚀 Analyze My Resume
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">ATS Pass Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4x</div>
              <div className="stat-label">More Interviews</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">&lt;10s</div>
              <div className="stat-label">Analysis Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Features</div>
            <h2 className="section-title">
              Everything you need to <span className="gradient-text">get hired</span>
            </h2>
            <p className="section-subtitle">
              One tool that does the job of a career coach, ATS scanner, and resume writer.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon purple">🎯</div>
              <div className="feature-title">ATS Match Score</div>
              <p className="feature-desc">
                Get an instant percentage score showing how well your resume matches the job.
                Know exactly where you stand before applying.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon cyan">🔍</div>
              <div className="feature-title">Missing Keywords</div>
              <p className="feature-desc">
                Instantly see which specific skills, tools, and terms the job requires
                that are missing from your resume.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">🤖</div>
              <div className="feature-title">AI Feedback</div>
              <p className="feature-desc">
                Get personalized advice from a Gemini AI acting as a senior recruiter —
                specific, actionable, and tailored to your resume.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon coral">📝</div>
              <div className="feature-title">Cover Letter Generator</div>
              <p className="feature-desc">
                Automatically generate a professional, tailored cover letter
                using your resume and job description.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">🎤</div>
              <div className="feature-title">Interview Prep</div>
              <p className="feature-desc">
                Predict the 10 most likely interview questions for any role
                with suggested answer frameworks for each.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon cyan">📊</div>
              <div className="feature-title">Progress Dashboard</div>
              <p className="feature-desc">
                Track your score improvements over time with a visual dashboard.
                See how your resume gets stronger with each revision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Process</div>
            <h2 className="section-title">How it works</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-title">Upload Your Resume</div>
              <p className="step-desc">
                Drop your PDF resume into the analyzer. Our system extracts the text automatically.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-title">Paste Job Description</div>
              <p className="step-desc">
                Copy the full job description from LinkedIn, Indeed, or any job portal.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-title">AI Analyzes</div>
              <p className="step-desc">
                Gemini AI compares your resume against the JD like a senior recruiter would.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-title">Get Results</div>
              <p className="step-desc">
                Receive your score, missing keywords, and actionable feedback instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">
              Ready to beat the <span className="gradient-text">ATS?</span>
            </h2>
            <p className="cta-subtitle">
              Join thousands of job seekers who have improved their resume score and landed more interviews.
            </p>
            <Link to={user ? '/analyze' : '/register'} className="btn btn-primary btn-lg">
              🚀 Start for Free — No Credit Card
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
