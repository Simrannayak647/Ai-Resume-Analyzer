// backend/routes/analyzerRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/* Ensure uploads directory exists */
const ensureUploadsDir = async () => {
  try {
    await fs.access('uploads');
  } catch {
    await fs.mkdir('uploads', { recursive: true });
  }
};

/* Multer configuration */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadsDir();
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

/* Main analyze endpoint */
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    console.log('📄 Processing PDF:', req.file.originalname);

    // Extract text from PDF
    const pdfResult = await extractTextFromPDF(req.file.path);

    if (!pdfResult.text?.trim()) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from PDF. Ensure the PDF contains readable text.'
      });
    }

    console.log('✅ Text extracted:', pdfResult.text.length, 'characters');

    // Get job description (if provided)
    const jobDescription = req.body.jobDescription || '';

    // Analyze with Gemini AI
    const analysisResult = await geminiService.analyzeResume(
      pdfResult.text,
      jobDescription
    );

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    // Check if AI analysis succeeded
    if (!analysisResult || analysisResult.success === false) {
      return res.status(500).json({
        success: false,
        error: analysisResult.error || 'AI analysis failed. Please try again.'
      });
    }

    console.log('🤖 AI Analysis completed successfully');

    // Calculate statistics
    const words = pdfResult.text.split(/\s+/).filter(w => w.length > 0);
    const stats = {
      wordCount: words.length,
      characterCount: pdfResult.text.length,
      skillsFound: (analysisResult.technicalSkills?.length || 0) + 
                   (analysisResult.softSkills?.length || 0),
      sectionsFound: Object.values(analysisResult.sections || {}).filter(Boolean).length,
      technicalSkillsCount: analysisResult.technicalSkills?.length || 0,
      softSkillsCount: analysisResult.softSkills?.length || 0
    };

    // Build comprehensive response
    const response = {
      success: true,

      // ATS Score
      atsScore: analysisResult.atsScore || 0,

      // Main analysis sections
      strengths: analysisResult.strengths || [],
      weaknesses: analysisResult.areasToImprove || [],
      suggestions: analysisResult.suggestions || [],
      missingKeywords: analysisResult.missingSkills || [],

      // Skills breakdown
      skills: {
        technical: analysisResult.technicalSkills || [],
        soft: analysisResult.softSkills || [],
        missing: analysisResult.missingSkills || []
      },

      // Sections detected
      sections: analysisResult.sections || {
        contactInfo: false,
        summary: false,
        experience: false,
        education: false,
        skills: false,
        projects: false,
        certifications: false,
        achievements: false
      },

      // Statistics
      stats,

      // Parsed data for detailed view
      parsedData: {
        summary: analysisResult.summary || '',
        recommendation: analysisResult.recommendation || '',
        suggestions: analysisResult.suggestions || []
      }
    };

    console.log('📊 Response prepared:', {
      atsScore: response.atsScore,
      strengthsCount: response.strengths.length,
      weaknessesCount: response.weaknesses.length,
      technicalSkills: response.skills.technical.length,
      softSkills: response.skills.soft.length
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Analysis error:', error);

    // Clean up file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed. Please try again.'
    });
  }
});

/* Health check endpoint */
router.get('/test', (req, res) => {
  res.json({
    message: 'Resume Analyzer API is working!',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      analyze: '/api/analyze (POST)',
      test: '/api/test (GET)'
    }
  });
});

/* Test Gemini connection */
router.get('/test-gemini', async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json({
      success: true,
      message: 'Gemini connection successful',
      response: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;