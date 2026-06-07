import React from 'react';

const KeywordChips = ({ matchedKeywords = [], missingKeywords = [] }) => {
  return (
    <div className="card keywords-card">
      {matchedKeywords.length > 0 && (
        <div className="keywords-section">
          <div className="keywords-header matched">
            <span>✅</span>
            <span>Matched Keywords ({matchedKeywords.length})</span>
          </div>
          <div className="keywords-chips">
            {matchedKeywords.map((kw, i) => (
              <span key={i} className="keyword-chip matched">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {matchedKeywords.length > 0 && missingKeywords.length > 0 && (
        <div className="divider" />
      )}

      {missingKeywords.length > 0 && (
        <div className="keywords-section">
          <div className="keywords-header missing">
            <span>❌</span>
            <span>Missing Keywords ({missingKeywords.length}) — Add these to your resume</span>
          </div>
          <div className="keywords-chips">
            {missingKeywords.map((kw, i) => (
              <span key={i} className="keyword-chip missing">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordChips;
