const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Analysis = require('../models/Analysis');

const router = express.Router();

// @route   GET /api/history
// @desc    Get all analyses for current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-resumeText -jobDescription'); // Exclude large fields for list view

    const total = await Analysis.countDocuments({ userId: req.user._id });

    // Stats for dashboard
    const allScores = await Analysis.find({ userId: req.user._id })
      .select('matchScore createdAt')
      .sort({ createdAt: 1 });

    const stats = {
      totalAnalyses: total,
      averageScore:
        allScores.length > 0
          ? Math.round(allScores.reduce((sum, a) => sum + a.matchScore, 0) / allScores.length)
          : 0,
      bestScore: allScores.length > 0 ? Math.max(...allScores.map((a) => a.matchScore)) : 0,
      scoreHistory: allScores.map((a) => ({
        score: a.matchScore,
        date: a.createdAt,
      })),
    };

    res.json({
      success: true,
      data: {
        analyses,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history. Please try again.',
    });
  }
});

// @route   GET /api/history/:id
// @desc    Get a specific analysis by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.',
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analysis.',
    });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a specific analysis
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.',
      });
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully.',
    });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete analysis.',
    });
  }
});

module.exports = router;
