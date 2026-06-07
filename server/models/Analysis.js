const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobTitle: {
      type: String,
      default: 'Unknown Position',
      trim: true,
    },
    company: {
      type: String,
      default: 'Unknown Company',
      trim: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      required: true,
    },
    improvementTips: {
      type: [String],
      default: [],
    },
    resumeText: {
      type: String,
      default: '',
    },
    jobDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by userId and date
AnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);
