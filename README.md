# ResumeAI — Personal AI Job Assistant

A full-stack MERN application with Google Gemini AI integration that helps job seekers optimize their resumes for ATS systems.

## Features
- 🎯 ATS Match Score (0-100%)
- 🔍 Matched & Missing Keyword Analysis
- 🤖 AI Recruiter Feedback (Google Gemini)
- 📝 Cover Letter Generator
- 🎤 Interview Question Predictor
- ✏️ Resume Bullet Point Rewriter
- 💼 LinkedIn Summary Generator
- 📊 Progress Dashboard with Charts
- 🔐 JWT Authentication

## Tech Stack
- **Frontend:** React.js (Vite), Recharts, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **AI:** Google Gemini 1.5 Flash API
- **Auth:** JWT + bcryptjs

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API Key (free at https://aistudio.google.com)

### 1. Backend Setup
```bash
cd server
npm install
```

Edit `.env` and set your `MONGODB_URI` if using Atlas:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-job-assistant
```

```bash
npm run dev   # starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev   # starts on http://localhost:5173
```

### 3. Open App
Visit: http://localhost:5173
