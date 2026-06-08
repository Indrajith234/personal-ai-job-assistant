const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');
const Analysis = require('../models/Analysis');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper: Extract text from PDF
const extractTextFromPDF = async (filePath) => {
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

// Helper: Clean JSON from Gemini response
const parseGeminiJSON = (text) => {
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();
  return JSON.parse(cleaned);
};

// Helper: Extract job title and company from JD
const extractJobInfo = (jobDescription) => {
  const lines = jobDescription.split('\n').slice(0, 5).join(' ');
  return lines.substring(0, 100);
};

// @route   POST /api/analyze
// @desc    Analyze resume against job description
// @access  Private
router.post('/', authMiddleware, upload.single('resume'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF resume.',
      });
    }

    const { jobDescription, jobTitle, company } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed job description (at least 50 characters).',
      });
    }

    filePath = req.file.path;

    // Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromPDF(filePath);
    } catch (pdfError) {
      return res.status(400).json({
        success: false,
        message: 'Could not read the PDF. Please make sure it contains selectable text (not a scanned image).',
      });
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'The PDF appears to be empty or contains very little text. Please upload a text-based PDF.',
      });
    }

    // Gemini Prompt
    const prompt = `
You are an expert ATS (Applicant Tracking System) and senior corporate recruiter with 15+ years of experience at top tech companies.

Carefully analyze the following resume against the job description provided.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

Perform a thorough analysis and return ONLY a valid JSON object (no markdown, no explanation) with exactly this structure:
{
  "matchScore": <number between 0-100 representing % match>,
  "jobTitle": "<extracted job title from the JD>",
  "company": "<extracted company name from the JD, or 'Not Specified'>",
  "matchedKeywords": [<array of specific keywords/skills/tools found in BOTH resume and JD>],
  "missingKeywords": [<array of specific keywords/skills/tools in JD but NOT in resume>],
  "feedback": "<2-3 paragraph personalized feedback explaining the match, strengths, and key gaps>",
  "improvementTips": [<array of 4-6 specific, actionable improvement tips>],
  "strengths": [<array of 3-4 strengths the candidate has for this role>]
}

Rules:
- matchScore must be an integer (e.g., 72, not 72.5)
- Keywords should be specific (e.g., "React.js", "Docker", "REST APIs") not generic
- Feedback must be personalized to THIS specific resume and JD
- improvementTips must be concrete and actionable
- Return ONLY the JSON, no other text
`;

    let analysisResult;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      analysisResult = parseGeminiJSON(responseText);
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      return res.status(500).json({
        success: false,
        message: 'AI analysis failed. Please check your API key or try again.',
        error: aiError.message,
      });
    }

    // Save to MongoDB
    const analysis = await Analysis.create({
      userId: req.user._id,
      jobTitle: analysisResult.jobTitle || jobTitle || 'Unknown Position',
      company: analysisResult.company || company || 'Unknown Company',
      matchScore: analysisResult.matchScore,
      matchedKeywords: analysisResult.matchedKeywords || [],
      missingKeywords: analysisResult.missingKeywords || [],
      feedback: analysisResult.feedback,
      improvementTips: analysisResult.improvementTips || [],
      resumeText: resumeText.substring(0, 5000), // Store first 5000 chars
      jobDescription: jobDescription.substring(0, 3000),
    });

    res.json({
      success: true,
      message: 'Resume analyzed successfully!',
      data: {
        analysisId: analysis._id,
        matchScore: analysisResult.matchScore,
        jobTitle: analysis.jobTitle,
        company: analysis.company,
        matchedKeywords: analysisResult.matchedKeywords,
        missingKeywords: analysisResult.missingKeywords,
        feedback: analysisResult.feedback,
        improvementTips: analysisResult.improvementTips,
        strengths: analysisResult.strengths || [],
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during analysis. Please try again.',
      error: error.message,
    });
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// Multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 10MB.',
      });
    }
  }
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed. Please upload a .pdf file.',
    });
  }
  next(error);
});

module.exports = router;
