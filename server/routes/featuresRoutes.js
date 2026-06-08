const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Helper: Clean JSON from Gemini response
const parseGeminiJSON = (text) => {
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();
  return JSON.parse(cleaned);
};

// Helper: Call Gemini with text response
const callGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 1: Cover Letter Generator
// ─────────────────────────────────────────────────────────
// @route   POST /api/features/cover-letter
// @access  Private
router.post('/cover-letter', authMiddleware, async (req, res) => {
  try {
    const { resumeText, jobDescription, userName, jobTitle, company } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Resume text and job description are required.',
      });
    }

    const prompt = `
You are a world-class professional cover letter writer with expertise in getting candidates noticed.

Write a compelling, personalized cover letter for ${userName || 'the applicant'} applying for the role of ${jobTitle || 'the position'} at ${company || 'the company'}.

CANDIDATE'S RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Requirements for the cover letter:
1. Start with a powerful, attention-grabbing opening (NOT "I am writing to apply for...")
2. Second paragraph: Match 2-3 specific experiences from the resume to key JD requirements
3. Third paragraph: Show genuine enthusiasm and cultural fit
4. Closing: Strong call-to-action with confidence
5. Professional but personable tone
6. Under 350 words
7. NO placeholders like [Your Name] — use the provided name or "I"

Return ONLY the cover letter text, nothing else.
`;

    const coverLetter = await callGemini(prompt);

    res.json({
      success: true,
      data: { coverLetter: coverLetter.trim() },
    });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cover letter. Please try again.',
    });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 2: Interview Questions Predictor
// ─────────────────────────────────────────────────────────
// @route   POST /api/features/interview-questions
// @access  Private
router.post('/interview-questions', authMiddleware, async (req, res) => {
  try {
    const { jobDescription, resumeText, jobTitle, company } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required.',
      });
    }

    const prompt = `
You are a senior hiring manager at ${company || 'a top company'} hiring for ${jobTitle || 'this position'}.

Based on this job description and the candidate's resume, predict the 10 most likely interview questions they will face.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S RESUME:
${resumeText || 'Not provided'}

Return ONLY a valid JSON array with exactly this structure:
[
  {
    "category": "<Technical/Behavioral/Situational/Role-Specific>",
    "question": "<the interview question>",
    "whyAsked": "<brief explanation of why interviewers ask this>",
    "answerFramework": "<how to structure a strong answer, mention STAR method where applicable>",
    "difficulty": "<Easy/Medium/Hard>"
  }
]

Make the questions realistic and specific to the JD. Return ONLY the JSON array.
`;

    const responseText = await callGemini(prompt);
    const questions = parseGeminiJSON(responseText);

    res.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate interview questions. Please try again.',
    });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 3: Bullet Point Rewriter
// ─────────────────────────────────────────────────────────
// @route   POST /api/features/rewrite-bullet
// @access  Private
router.post('/rewrite-bullet', authMiddleware, async (req, res) => {
  try {
    const { bulletPoint, missingKeywords, jobTitle } = req.body;

    if (!bulletPoint || bulletPoint.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume bullet point to rewrite.',
      });
    }

    const prompt = `
You are an expert resume writer who specializes in crafting ATS-optimized, impactful resume bullet points.

ORIGINAL BULLET POINT:
"${bulletPoint}"

TARGET ROLE: ${jobTitle || 'the target position'}
KEYWORDS TO INCORPORATE NATURALLY: ${missingKeywords ? missingKeywords.join(', ') : 'general professional keywords'}

Rewrite this bullet point into 3 progressively stronger versions:

Rules for each version:
1. Start with a strong action verb (quantify results if possible)
2. Be specific and achievement-focused, not task-focused
3. Incorporate relevant keywords naturally (don't force them)
4. Keep each under 2 lines
5. Sound authentic, not generic

Return ONLY a valid JSON object:
{
  "versions": [
    {
      "level": "Good",
      "text": "<rewritten bullet point>",
      "improvement": "<what was improved>"
    },
    {
      "level": "Better",
      "text": "<stronger rewritten bullet point>",
      "improvement": "<what was improved>"
    },
    {
      "level": "Best",
      "text": "<strongest rewritten bullet point>",
      "improvement": "<what was improved>"
    }
  ]
}
`;

    const responseText = await callGemini(prompt);
    const result = parseGeminiJSON(responseText);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Bullet rewrite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rewrite bullet point. Please try again.',
    });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 4: LinkedIn Summary Generator
// ─────────────────────────────────────────────────────────
// @route   POST /api/features/linkedin-summary
// @access  Private
router.post('/linkedin-summary', authMiddleware, async (req, res) => {
  try {
    const { resumeText, targetRole, userName } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is required.',
      });
    }

    const prompt = `
You are a LinkedIn personal branding expert who has helped thousands of professionals get noticed.

Based on this resume, write a compelling LinkedIn "About" section for ${userName || 'this professional'} targeting roles in ${targetRole || 'their field'}.

RESUME:
${resumeText}

Requirements:
1. Open with a powerful hook that is NOT "I am a developer/engineer/professional"
2. 2nd paragraph: Top 3 achievements or strengths with specific impact
3. 3rd paragraph: What drives them professionally (infer from resume)
4. Closing line: What opportunities they're open to
5. Written in first person, conversational yet professional tone
6. Include relevant industry keywords naturally
7. 250-300 words maximum
8. Should make a recruiter want to reach out immediately

Return ONLY the LinkedIn summary text, no labels or extra text.
`;

    const linkedinSummary = await callGemini(prompt);

    res.json({
      success: true,
      data: { linkedinSummary: linkedinSummary.trim() },
    });
  } catch (error) {
    console.error('LinkedIn summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate LinkedIn summary. Please try again.',
    });
  }
});

module.exports = router;
