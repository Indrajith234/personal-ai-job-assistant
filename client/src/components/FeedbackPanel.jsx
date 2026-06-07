import React from 'react';

const FeedbackPanel = ({ feedback, improvementTips = [], strengths = [] }) => {
  return (
    <div className="card feedback-card">
      {/* AI Feedback */}
      {feedback && (
        <div className="feedback-section">
          <div className="feedback-section-title">
            <span>🤖</span> AI Recruiter Feedback
          </div>
          <p className="feedback-text">{feedback}</p>
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <>
          <div className="divider" />
          <div className="feedback-section">
            <div className="feedback-section-title">
              <span>💪</span> Your Strengths for This Role
            </div>
            <div className="strengths-list">
              {strengths.map((s, i) => (
                <div key={i} className="strength-item">
                  <span className="strength-bullet">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Improvement Tips */}
      {improvementTips.length > 0 && (
        <>
          <div className="divider" />
          <div className="feedback-section">
            <div className="feedback-section-title">
              <span>🎯</span> Actionable Improvement Tips
            </div>
            <div className="improvement-list">
              {improvementTips.map((tip, i) => (
                <div key={i} className="improvement-item">
                  <span className="improvement-bullet">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackPanel;
