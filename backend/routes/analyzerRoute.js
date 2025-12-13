// backend/routes/analyzerRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import geminiService from '../services/geminiService.js';

const router = express.Router();

/* ===========================
   Ensure uploads directory
=========================== */
const ensureUploadsDir = async () => {
  try {
    await fs.access('uploads');
  } catch {
    await fs.mkdir('uploads', { recursive: true });
  }
};

/* ===========================
   Multer configuration
=========================== */
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

/* ===========================
   Analyze Resume
=========================== */
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const pdfResult = await extractTextFromPDF(req.file.path);

    if (!pdfResult.text?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract text from PDF'
      });
    }

    const jobDescription = req.body.jobDescription || '';

    const analysisResult = await geminiService.analyzeResume(
      pdfResult.text,
      jobDescription
    );

    await fs.unlink(req.file.path);

    // In your POST /analyze route, replace the response section:
res.json({
    success: true,
    atsScore: analysisResult.matchScore || 0, // Frontend expects atsScore
    strengths: analysisResult.strengths || [],
    weaknesses: analysisResult.missingSkills || [], // Map missingSkills to weaknesses
    missingKeywords: [], // Empty array if not provided
    sections: [], // Empty array if not provided
    stats: {
        wordCount: pdfResult.text.split(/\s+/).length,
        skillsFound: analysisResult.strengths?.length || 0,
        sectionsFound: 0
    },
    parsedData: {
        contact: {}, // Empty contact info
        ...analysisResult // Include all Gemini data
    },
    metadata: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        numPages: pdfResult.numPages,
        hasJobDescription: Boolean(jobDescription.trim())
    }
});


  } catch (error) {
    console.error('Analysis error:', error);

    if (req.file?.path) {
      try { await fs.unlink(req.file.path); } catch {}
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

/* ===========================
   Test Route
=========================== */
router.get('/test', (req, res) => {
  res.json({
    message: 'Resume Analyzer API is working!',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

export default router;
