// backend/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite'
    });

    this.generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 3500
    };
  }

  async analyzeResume(resumeText, jobDescription = '') {
    try {
      const truncatedResume = resumeText.substring(0, 30000);
      const truncatedJD = jobDescription.substring(0, 10000);

      let prompt;

      if (jobDescription.trim()) {
        // Job-matched analysis
        prompt = `You are an expert ATS (Applicant Tracking System) analyzer and HR specialist.

RESUME TEXT:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}

Perform a COMPREHENSIVE analysis and return ONLY valid JSON with this EXACT structure:

{
  "atsScore": 85,
  "summary": "Detailed 3-4 sentence analysis of the resume...",
  "strengths": [
    "Strong experience in React and Node.js",
    "5+ years of full-stack development",
    "Led teams of 3-5 developers"
  ],
  "areasToImprove": [
    "Missing cloud platform experience (AWS/Azure)",
    "No mention of CI/CD practices",
    "Limited quantifiable achievements"
  ],
  "suggestions": [
    "Add specific metrics (e.g., 'Improved performance by 40%')",
    "Include cloud certifications if available",
    "Expand on leadership accomplishments"
  ],
  "missingSkills": ["AWS", "Docker", "Kubernetes", "CI/CD"],
  "technicalSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "softSkills": ["Leadership", "Team Collaboration", "Problem Solving"],
  "sections": {
    "contactInfo": true,
    "summary": true,
    "experience": true,
    "education": true,
    "skills": true,
    "projects": true,
    "certifications": false,
    "achievements": true
  },
  "recommendation": "Strong Match"
}

SCORING CRITERIA (0-100):
- Skills match: 40%
- Experience relevance: 30%
- Education fit: 15%
- Keywords presence: 15%`;

      } else {
        // General resume analysis
        prompt = `You are an expert resume analyzer and career coach.

RESUME TEXT:
${truncatedResume}

Perform a COMPREHENSIVE analysis and return ONLY valid JSON with this EXACT structure:

{
  "atsScore": 75,
  "summary": "Comprehensive 3-4 sentence overview of the candidate's profile, highlighting key strengths and career trajectory...",
  "strengths": [
    "Well-structured resume with clear sections",
    "Strong technical skill portfolio",
    "Consistent career progression",
    "Good balance of technical and soft skills"
  ],
  "areasToImprove": [
    "Lack of quantifiable achievements with metrics",
    "Missing certifications section",
    "Could expand on project details",
    "Limited keywords for ATS optimization"
  ],
  "suggestions": [
    "Add numbers and metrics to achievements (e.g., 'Increased efficiency by 30%')",
    "Include relevant certifications and courses",
    "Add GitHub/portfolio links",
    "Use more industry-standard keywords",
    "Format consistently throughout"
  ],
  "missingSkills": ["Cloud platforms (AWS/Azure)", "DevOps tools", "Agile methodologies"],
  "technicalSkills": ["Python", "Java", "SQL", "Git", "React"],
  "softSkills": ["Communication", "Teamwork", "Problem Solving", "Time Management"],
  "sections": {
    "contactInfo": true,
    "summary": true,
    "experience": true,
    "education": true,
    "skills": true,
    "projects": false,
    "certifications": false,
    "achievements": true
  },
  "recommendation": "Strong Resume"
}

ATS SCORE CALCULATION (0-100):
- Format & Structure: 25%
- Keyword optimization: 25%
- Content quality: 25%
- Completeness: 25%`;
      }

      console.log('📤 Sending comprehensive analysis to Gemini...');

      const result = await this.model.generateContent(prompt, this.generationConfig);
      const text = result.response.text();

      console.log('📥 Gemini response received');

      return this.parseResponse(text);

    } catch (error) {
      console.error('❌ Gemini API Error:', error.message || error);

      return {
        success: false,
        error: error.message || 'AI service unavailable',
        atsScore: 0,
        strengths: [],
        areasToImprove: ['AI analysis unavailable'],
        suggestions: ['Please try again'],
        missingSkills: [],
        technicalSkills: [],
        softSkills: [],
        sections: {},
        recommendation: 'Analysis Failed',
        summary: 'Unable to analyze resume at this time.'
      };
    }
  }

  parseResponse(text) {
    try {
      // Remove markdown code blocks
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // Extract JSON object
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = cleaned.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonString);

      // Validate required fields
      const validated = {
        success: true,
        atsScore: typeof parsed.atsScore === 'number' ? parsed.atsScore : 0,
        summary: parsed.summary || 'No summary available',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        technicalSkills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills : [],
        softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
        sections: typeof parsed.sections === 'object' ? parsed.sections : {},
        recommendation: parsed.recommendation || 'No recommendation'
      };

      console.log('✅ Successfully parsed Gemini response');
      return validated;

    } catch (err) {
      console.error('❌ JSON parse error:', err.message);

      // Return fallback structure
      return {
        success: false,
        atsScore: 0,
        summary: 'Could not parse AI response',
        strengths: [],
        areasToImprove: [],
        suggestions: [],
        missingSkills: [],
        technicalSkills: [],
        softSkills: [],
        sections: {},
        recommendation: 'Parse Error',
        rawText: text.substring(0, 500)
      };
    }
  }

  async testConnection() {
    try {
      const result = await this.model.generateContent(
        'Reply with: Gemini Flash is working'
      );
      return result.response.text();
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }
}

export default new GeminiService();