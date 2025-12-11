// analyzerRoute.cjs
const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");

// pdf-parse import
const pdfParsePackage = require("pdf-parse");

const router = express.Router();

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Please upload PDF, DOCX, or TXT files."), false);
  },
});

// Get the pdf-parse function
let pdfParseFunc;
if (typeof pdfParsePackage === "function") {
  pdfParseFunc = pdfParsePackage;
} else if (pdfParsePackage && typeof pdfParsePackage.pdf === "function") {
  pdfParseFunc = pdfParsePackage.pdf;
} else if (pdfParsePackage && typeof pdfParsePackage.default === "function") {
  pdfParseFunc = pdfParsePackage.default;
} else {
  pdfParseFunc = pdfParsePackage;
}

async function parsePDF(buffer) {
  try {
    const data = await pdfParseFunc(buffer);
    return data && data.text ? data.text : "";
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

// AI Analysis function - calculates ATS score and generates suggestions
function analyzeResumeText(text) {
  console.log("Analyzing resume text...");
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 65; // Base score
  
  // Industry-specific keyword banks
  const techKeywords = [
    'javascript', 'react', 'node', 'python', 'java', 'aws', 'docker', 
    'kubernetes', 'sql', 'mongodb', 'express', 'typescript', 'html', 
    'css', 'git', 'rest', 'api', 'angular', 'vue', 'php', 'c#', 'c++',
    'ruby', 'go', 'swift', 'kotlin', 'android', 'ios', 'linux', 'unix'
  ];
  
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 
    'critical thinking', 'time management', 'adaptability', 'creativity',
    'collaboration', 'analytical', 'presentation', 'negotiation'
  ];
  
  const businessKeywords = [
    'project management', 'agile', 'scrum', 'kanban', 'budget', 
    'strategy', 'marketing', 'sales', 'customer service', 'finance',
    'analysis', 'planning', 'development', 'implementation', 'optimization'
  ];
  
  // Check for keywords
  const foundTechKeywords = techKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  const foundSoftSkills = softSkills.filter(skill => 
    text.toLowerCase().includes(skill)
  );
  
  const foundBusinessKeywords = businessKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  // Score adjustments based on keywords
  score += Math.min(foundTechKeywords.length * 2, 15);
  score += Math.min(foundSoftSkills.length * 1, 10);
  score += Math.min(foundBusinessKeywords.length * 1, 5);
  
  // Check for contact information
  const hasEmail = /\S+@\S+\.\S+/.test(text);
  const hasPhone = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\/\S+/.test(text) || text.toLowerCase().includes('linkedin');
  
  if (hasEmail) score += 5;
  if (hasPhone) score += 5;
  if (hasLinkedIn) score += 3;
  
  // Check for education
  const hasEducation = /bachelor|master|phd|degree|university|college|education/i.test(text);
  if (hasEducation) score += 5;
  
  // Check for experience indicators
  const hasExperience = /experience|worked|years|responsibilities|duties|achievements/i.test(text);
  if (hasExperience) score += 5;
  
  // Check for achievements (numbers indicate quantifiable results)
  const hasNumbers = /\d+/.test(text.replace(/\s+/g, ''));
  if (hasNumbers) score += 5;
  
  // Check resume length
  const wordCount = words.length;
  if (wordCount >= 300 && wordCount <= 700) {
    score += 5; // Optimal length
  } else if (wordCount < 150) {
    score -= 10; // Too short
  } else if (wordCount > 1000) {
    score -= 5; // Too long
  }
  
  // Check for action verbs
  const actionVerbs = [
    'developed', 'created', 'implemented', 'managed', 'led', 
    'improved', 'increased', 'decreased', 'reduced', 'achieved',
    'designed', 'built', 'optimized', 'transformed', 'delivered'
  ];
  
  const foundActionVerbs = actionVerbs.filter(verb => 
    text.toLowerCase().includes(verb)
  );
  score += Math.min(foundActionVerbs.length, 5);
  
  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Generate suggestions based on analysis
  const suggestions = [];
  
  if (!hasEmail) suggestions.push("Add your email address");
  if (!hasPhone) suggestions.push("Include a phone number");
  if (!hasLinkedIn) suggestions.push("Add your LinkedIn profile URL");
  
  if (wordCount < 250) {
    suggestions.push("Add more details about your work experience and achievements");
  } else if (wordCount > 800) {
    suggestions.push("Consider making your resume more concise (1-2 pages recommended)");
  }
  
  if (foundTechKeywords.length < 3) {
    suggestions.push("Include more technical keywords relevant to your field");
  }
  
  if (foundSoftSkills.length < 2) {
    suggestions.push("Add soft skills like communication, teamwork, or leadership");
  }
  
  if (!hasNumbers) {
    suggestions.push("Quantify achievements with numbers (e.g., 'increased sales by 20%')");
  }
  
  if (foundActionVerbs.length < 3) {
    suggestions.push("Use more action verbs to start bullet points");
  }
  
  if (!hasEducation) {
    suggestions.push("Include your education section");
  }
  
  // Extract strengths
  const strengths = [];
  if (foundTechKeywords.length >= 5) strengths.push("Strong technical keyword usage");
  if (hasEmail && hasPhone) strengths.push("Complete contact information");
  if (hasLinkedIn) strengths.push("Professional social media presence");
  if (hasNumbers) strengths.push("Quantifiable achievements");
  if (foundActionVerbs.length >= 3) strengths.push("Strong action-oriented language");
  if (wordCount >= 300 && wordCount <= 700) strengths.push("Optimal resume length");
  
  // Missing keywords (top 5 not found)
  const allKeywords = [...techKeywords, ...softSkills, ...businessKeywords];
  const missingKeywords = allKeywords
    .filter(keyword => !text.toLowerCase().includes(keyword))
    .slice(0, 5);
  
  // Extract contact information
  const emailMatch = text.match(/\S+@\S+\.\S+/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
  const linkedInMatch = text.match(/linkedin\.com\/in\/\S+/);
  
  return {
    atsScore: score,
    suggestions,
    strengths,
    missingKeywords,
    contactInfo: {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      linkedin: linkedInMatch ? linkedInMatch[0] : null
    },
    stats: {
      wordCount,
      techKeywordsFound: foundTechKeywords.length,
      softSkillsFound: foundSoftSkills.length,
      actionVerbsFound: foundActionVerbs.length
    }
  };
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded" 
      });
    }

    console.log("Processing file:", req.file.originalname, "Type:", req.file.mimetype);

    let resumeText = "";
    const fileType = req.file.mimetype;

    if (fileType === "application/pdf") {
      console.log("Parsing PDF...");
      resumeText = await parsePDF(req.file.buffer);
      console.log("PDF parsed successfully. Text length:", resumeText.length);
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("Parsing DOCX...");
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = result.value;
      console.log("DOCX parsed successfully. Text length:", resumeText.length);
    } else if (fileType === "text/plain") {
      console.log("Parsing text...");
      resumeText = req.file.buffer.toString("utf-8");
      console.log("Text file parsed successfully. Text length:", resumeText.length);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT files.` 
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "No text could be extracted from the file. The file might be empty or contain only images." 
      });
    }

    // Clean the text
    resumeText = resumeText.trim();
    
    // Perform AI analysis
    console.log("Performing AI analysis...");
    const analysisResults = analyzeResumeText(resumeText);
    console.log("Analysis complete. ATS Score:", analysisResults.atsScore);

    return res.json({
      success: true,
      analysis: resumeText,
      ...analysisResults,
      fileType: fileType,
      fileName: req.file.originalname,
      textLength: resumeText.length
    });
    
  } catch (error) {
    console.error("Error processing file:", error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || "Failed to process the file" 
    });
  }
});

module.exports = router;