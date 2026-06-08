const express = require('express');
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Groq AI (free, no credit card needed)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Helper: Parse JSON from AI response
const parseAIJSON = (text) => {
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();
  return JSON.parse(cleaned);
};

// Helper: Call Groq AI
const callGroq = async (prompt, maxTokens = 2048) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return completion.choices[0].message.content;
};

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 1: Cover Letter Generator
// ─────────────────────────────────────────────────────────
router.post('/cover-letter', authMiddleware, async (req, res) => {
  try {
    const { resumeText, jobDescription, userName, jobTitle, company } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Resume text and job description are required.' });
    }

    const prompt = `You are a world-class professional cover letter writer with expertise in getting candidates noticed.

Write a compelling, personalized cover letter for ${userName || 'the applicant'} applying for the role of ${jobTitle || 'the position'} at ${company || 'the company'}.

CANDIDATE'S RESUME:
${resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 1500)}

Requirements:
1. Start with a powerful, attention-grabbing opening (NOT "I am writing to apply for...")
2. Second paragraph: Match 2-3 specific experiences from the resume to key JD requirements
3. Third paragraph: Show genuine enthusiasm and cultural fit
4. Closing: Strong call-to-action with confidence
5. Professional but personable tone
6. Under 350 words
7. NO placeholders like [Your Name] — use the provided name or "I"

Return ONLY the cover letter text, nothing else.`;

    const coverLetter = await callGroq(prompt, 1024);

    res.json({ success: true, data: { coverLetter: coverLetter.trim() } });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate cover letter. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 2: Interview Questions Predictor
// ─────────────────────────────────────────────────────────
router.post('/interview-questions', authMiddleware, async (req, res) => {
  try {
    const { jobDescription, resumeText, jobTitle, company } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required.' });
    }

    const prompt = `You are a senior hiring manager at ${company || 'a top company'} hiring for ${jobTitle || 'this position'}.

Based on this job description, predict the 10 most likely interview questions.

JOB DESCRIPTION:
${jobDescription.substring(0, 1500)}

CANDIDATE RESUME:
${resumeText ? resumeText.substring(0, 1000) : 'Not provided'}

Return ONLY a valid JSON array with exactly this structure (no markdown):
[
  {
    "category": "<Technical/Behavioral/Situational/Role-Specific>",
    "question": "<the interview question>",
    "whyAsked": "<brief explanation of why interviewers ask this>",
    "answerFramework": "<how to structure a strong answer>",
    "difficulty": "<Easy/Medium/Hard>"
  }
]

Return ONLY the JSON array, no other text.`;

    const responseText = await callGroq(prompt, 2048);
    const questions = parseAIJSON(responseText);

    res.json({ success: true, data: { questions } });
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate interview questions. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 3: Bullet Point Rewriter
// ─────────────────────────────────────────────────────────
router.post('/rewrite-bullet', authMiddleware, async (req, res) => {
  try {
    const { bulletPoint, missingKeywords, jobTitle } = req.body;

    if (!bulletPoint || bulletPoint.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a resume bullet point to rewrite.' });
    }

    const prompt = `You are an expert resume writer who specializes in crafting ATS-optimized, impactful resume bullet points.

ORIGINAL BULLET POINT:
"${bulletPoint}"

TARGET ROLE: ${jobTitle || 'the target position'}
KEYWORDS TO INCORPORATE: ${missingKeywords ? missingKeywords.join(', ') : 'general professional keywords'}

Rewrite this into 3 progressively stronger versions. Return ONLY this JSON (no markdown):
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
}`;

    const responseText = await callGroq(prompt, 1024);
    const result = parseAIJSON(responseText);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Bullet rewrite error:', error);
    res.status(500).json({ success: false, message: 'Failed to rewrite bullet point. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────
// BONUS FEATURE 4: LinkedIn Summary Generator
// ─────────────────────────────────────────────────────────
router.post('/linkedin-summary', authMiddleware, async (req, res) => {
  try {
    const { resumeText, targetRole, userName } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Resume text is required.' });
    }

    const prompt = `You are a LinkedIn personal branding expert who helps professionals get noticed by recruiters.

Based on this resume, write a compelling LinkedIn "About" section for ${userName || 'this professional'} targeting roles in ${targetRole || 'their field'}.

RESUME:
${resumeText.substring(0, 2000)}

Requirements:
1. Open with a powerful hook — NOT "I am a developer/engineer"
2. 2nd paragraph: Top 3 achievements or strengths with specific impact
3. 3rd paragraph: What drives them professionally
4. Closing line: What opportunities they're open to
5. Written in first person, conversational yet professional
6. Include relevant industry keywords naturally
7. 250-300 words maximum

Return ONLY the LinkedIn summary text, no labels or extra text.`;

    const linkedinSummary = await callGroq(prompt, 1024);

    res.json({ success: true, data: { linkedinSummary: linkedinSummary.trim() } });
  } catch (error) {
    console.error('LinkedIn summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate LinkedIn summary. Please try again.' });
  }
});

module.exports = router;
