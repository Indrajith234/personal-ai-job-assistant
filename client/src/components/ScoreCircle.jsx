import React, { useEffect, useRef } from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return { stroke: '#10b981', grade: 'excellent', label: '🌟 Excellent Match' };
  if (score >= 60) return { stroke: '#06b6d4', grade: 'good', label: '👍 Good Match' };
  if (score >= 40) return { stroke: '#f59e0b', grade: 'average', label: '⚡ Average Match' };
  return { stroke: '#ef4444', grade: 'poor', label: '⚠️ Needs Work' };
};

const ScoreCircle = ({ score, jobTitle, company }) => {
  const circleRef = useRef(null);
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const { stroke, grade, label } = getScoreColor(score);

  useEffect(() => {
    if (circleRef.current) {
      const offset = circumference - (score / 100) * circumference;
      circleRef.current.style.strokeDashoffset = offset;
    }
  }, [score, circumference]);

  return (
    <div className="card score-card">
      <div className="score-circle-wrapper">
        <svg className="score-circle-svg" width="180" height="180" viewBox="0 0 180 180">
          <circle className="score-circle-bg" cx="90" cy="90" r={radius} />
          <circle
            ref={circleRef}
            className="score-circle-fill"
            cx="90"
            cy="90"
            r={radius}
            stroke={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 8px ${stroke}60)` }}
          />
        </svg>
        <div className="score-circle-content">
          <span className="score-number" style={{ color: stroke }}>
            {score}
          </span>
          <span className="score-percent">/ 100</span>
        </div>
      </div>

      <div className="score-label">ATS Match Score</div>
      {jobTitle && (
        <div className="score-sublabel">
          {jobTitle}
          {company && company !== 'Unknown Company' && ` at ${company}`}
        </div>
      )}
      <div className={`score-grade ${grade}`}>{label}</div>
    </div>
  );
};

export default ScoreCircle;
