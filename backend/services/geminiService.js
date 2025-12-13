// backend/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    // LINE 12 - CRITICAL FIX:
this.model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest'  // ✅ Change from 'gemini-1.5-flash'
});

    this.generationConfig = {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048
    };
  }

 

  async analyzeResume(resumeText, jobDescription = '') {
  try {
    const truncatedResume = resumeText.substring(0, 30000);
    const truncatedJD = jobDescription.substring(0, 10000);

    let prompt;

    if (jobDescription.trim()) {
      prompt = `You are an expert HR analyst specialized in technical recruiting.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}

ANALYSIS TASKS:
1. Calculate match score (0-100%) based on skills, experience, and qualifications match
2. List 3-5 key strengths from resume relevant to this job
3. Identify 2-4 missing skills or qualifications
4. Provide 2-3 actionable suggestions to improve the resume
5. Give overall recommendation: "Strong Match", "Moderate Match", or "Needs Improvement"
6. Write a brief 2-3 sentence summary

RETURN ONLY VALID JSON with this exact structure:
{
  "matchScore": 85,
  "strengths": ["JavaScript", "React", "TypeScript"],
  "missingSkills": ["AWS", "Docker"],
  "suggestions": ["Add more quantifiable achievements", "Include specific project details"],
  "recommendation": "Strong Match",
  "summary": "Candidate has strong frontend skills with 3+ years of React experience..."
}`;
    } else {
      prompt = `You are an expert career coach analyzing a resume.

RESUME:
${truncatedResume}

ANALYSIS TASKS:
1. Write a 2-3 sentence summary
2. Extract all technical and soft skills
3. List 3-5 main strengths
4. List 2-3 areas for improvement
5. Suggest 2-3 relevant courses or certifications
6. Provide 3-5 general tips to improve the resume

RETURN ONLY VALID JSON with this exact structure:
{
  "summary": "Experienced software developer with 5 years in web development...",
  "skills": ["JavaScript", "React", "Node.js", "Team Leadership"],
  "strengths": ["Strong project portfolio", "Clear career progression"],
  "improvements": ["Lack of quantifiable metrics", "Could add more technical details"],
  "courses": ["AWS Certified Solutions Architect", "Advanced React Patterns"],
  "tips": ["Add more numbers to quantify achievements", "Include GitHub links to projects"]
}`;
    }

    console.log('📤 Sending to Gemini Flash...');
    
    // ✅ CORRECT API CALL
    const result = await this.model.generateContent(prompt, this.generationConfig);
    const text = result.response.text();
    
    console.log('📥 Raw Gemini response:', text.substring(0, 200) + '...');
    
    return this.parseResponse(text);

  } catch (error) {
    console.error('❌ Gemini API Error:', error.message || error);

    // Better error response
    return {
      success: false,
      error: error.message || 'AI service unavailable',
      matchScore: 0,
      strengths: [],
      missingSkills: ['AI analysis failed'],
      suggestions: ['Please try again with a different resume'],
      recommendation: 'Analysis Failed',
      summary: 'Unable to analyze resume. Please ensure your PDF contains text and try again.'
    };
  }
}



  parseResponse(text) {
    try {
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}') + 1;

      const jsonString = cleaned.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonString);

      return { success: true, ...parsed };

    } catch (err) {
      console.error('JSON parse failed:', err);

      return {
        success: false,
        rawText: text.slice(0, 500),
        summary: 'Response could not be parsed.'
      };
    }
  }

  async testConnection() {
    const result = await this.model.generateContent(
      'Reply with: Gemini Flash is working'
    );

    return result.response.text();
  }
}

export default new GeminiService();
