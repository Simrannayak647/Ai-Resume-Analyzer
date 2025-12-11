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

// Enhanced AI Analysis function with more realistic scoring
function analyzeResumeText(text) {
  console.log("Analyzing resume text...");
  
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  let score = 50; // Start at 50 for basic resume
  
  // Industry-specific keyword banks
  const techKeywords = [
    'javascript', 'react', 'node', 'python', 'java', 'aws', 'docker', 
    'kubernetes', 'sql', 'mongodb', 'express', 'typescript', 'html', 
    'css', 'git', 'rest', 'api', 'angular', 'vue', 'php', 'c#', 'c++',
    'ruby', 'go', 'swift', 'kotlin', 'android', 'ios', 'linux', 'unix',
    'azure', 'gcp', 'ci/cd', 'devops', 'agile', 'scrum', 'backend', 'frontend'
  ];
  
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 
    'critical thinking', 'time management', 'adaptability', 'creativity',
    'collaboration', 'analytical', 'presentation', 'negotiation',
    'mentoring', 'training', 'project management', 'strategic planning'
  ];
  
  const businessKeywords = [
    'project management', 'agile', 'scrum', 'kanban', 'budget', 
    'strategy', 'marketing', 'sales', 'customer service', 'finance',
    'analysis', 'planning', 'development', 'implementation', 'optimization',
    'roi', 'kpi', 'metrics', 'growth', 'revenue', 'profit'
  ];
  
  // Check for keywords
  const foundTechKeywords = techKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const foundSoftSkills = softSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  const foundBusinessKeywords = businessKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Score adjustments based on keywords (more realistic)
  score += Math.min(foundTechKeywords.length * 1.5, 20);
  score += Math.min(foundSoftSkills.length * 1, 10);
  score += Math.min(foundBusinessKeywords.length * 0.5, 5);
  
  // Check for contact information
  const hasEmail = /\S+@\S+\.\S+/.test(text);
  const hasPhone = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\/\S+/i.test(text) || /linkedin\.com\/company\/\S+/i.test(text);
  
  if (hasEmail) score += 8;
  if (hasPhone) score += 7;
  if (hasLinkedIn) score += 5;
  
  // Check for sections
  const sections = {
    education: /education|academic|degree|university|college|school|bachelor|master|phd/i.test(text),
    experience: /experience|work history|employment|professional experience|career/i.test(text),
    skills: /skills|technical skills|competencies|proficiencies/i.test(text),
    summary: /summary|profile|objective|about me|professional summary/i.test(text)
  };
  
  Object.values(sections).forEach(hasSection => {
    if (hasSection) score += 3;
  });
  
  // Check for achievements (quantifiable results)
  const achievementPatterns = [
    /increased by \d+%/, /reduced by \d+%/, /saved \$\d+/, /improved by \d+/,
    /managed \$\d+/, /led \d+/, /achieved \d+/, /exceeded target by \d+%/
  ];
  
  const achievementsFound = achievementPatterns.filter(pattern => pattern.test(text)).length;
  score += Math.min(achievementsFound * 3, 15);
  
  // Check resume length
  if (wordCount >= 300 && wordCount <= 700) {
    score += 10; // Optimal length
  } else if (wordCount >= 200 && wordCount < 300) {
    score += 5; // Good but could be more detailed
  } else if (wordCount > 700 && wordCount <= 1000) {
    score += 3; // A bit long but acceptable
  } else if (wordCount < 150) {
    score -= 15; // Too short
  } else if (wordCount > 1000) {
    score -= 10; // Too long
  }
  
  // Check for action verbs
  const actionVerbs = [
    'developed', 'created', 'implemented', 'managed', 'led', 
    'improved', 'increased', 'decreased', 'reduced', 'achieved',
    'designed', 'built', 'optimized', 'transformed', 'delivered',
    'initiated', 'spearheaded', 'coordinated', 'facilitated', 'mentored',
    'analyzed', 'evaluated', 'streamlined', 'automated', 'launched'
  ];
  
  const foundActionVerbs = actionVerbs.filter(verb => 
    text.toLowerCase().includes(verb.toLowerCase())
  );
  score += Math.min(foundActionVerbs.length, 10);
  
  // Check for formatting issues (negative points)
  const hasTables = /<table>|\|{3,}|\t{2,}/.test(text); // Simple table detection
  const hasColumns = /column|multicolumn|text\-align/i.test(text);
  const hasGraphics = /\.(jpg|jpeg|png|gif|svg)/i.test(text);
  
  if (hasTables || hasColumns || hasGraphics) {
    score -= 5; // ATS may have trouble with these
  }
  
  // Ensure score is within 0-100 range
  score = Math.max(10, Math.min(98, Math.round(score)));
  
  // Generate suggestions based on analysis
  const suggestions = [];
  
  if (!hasEmail) suggestions.push("Add your email address for recruiters to contact you");
  if (!hasPhone) suggestions.push("Include a professional phone number");
  if (!hasLinkedIn) suggestions.push("Add your LinkedIn profile URL to showcase your professional network");
  
  if (!sections.summary) {
    suggestions.push("Add a professional summary at the top to highlight your key qualifications");
  }
  
  if (!sections.skills) {
    suggestions.push("Create a dedicated skills section to showcase your technical and soft skills");
  }
  
  if (wordCount < 250) {
    suggestions.push("Add more details about your work experience, achievements, and responsibilities");
  } else if (wordCount > 800) {
    suggestions.push("Consider condensing your resume to 1-2 pages for better readability");
  }
  
  if (foundTechKeywords.length < 5) {
    suggestions.push("Include more industry-specific keywords relevant to your target job");
  }
  
  if (foundSoftSkills.length < 3) {
    suggestions.push("Highlight 3-5 soft skills that are valuable in your industry");
  }
  
  if (achievementsFound < 2) {
    suggestions.push("Quantify at least 2-3 achievements with numbers and percentages");
  }
  
  if (foundActionVerbs.length < 5) {
    suggestions.push("Start bullet points with strong action verbs to demonstrate initiative");
  }
  
  if (!sections.education) {
    suggestions.push("Include your education background with degrees, institutions, and dates");
  }
  
  // Extract strengths
  const strengths = [];
  if (foundTechKeywords.length >= 8) strengths.push("Excellent technical keyword optimization");
  if (foundTechKeywords.length >= 5 && foundTechKeywords.length < 8) strengths.push("Good technical keyword usage");
  if (hasEmail && hasPhone && hasLinkedIn) strengths.push("Complete professional contact information");
  if (hasLinkedIn) strengths.push("Professional online presence with LinkedIn");
  if (achievementsFound >= 3) strengths.push("Strong quantifiable achievements");
  if (foundActionVerbs.length >= 5) strengths.push("Powerful action-oriented language");
  if (wordCount >= 300 && wordCount <= 700) strengths.push("Optimal resume length for ATS");
  if (Object.values(sections).filter(Boolean).length >= 3) strengths.push("Well-structured with key sections");
  
  // Missing keywords (top industry-relevant not found)
  const allKeywords = [...techKeywords, ...softSkills, ...businessKeywords];
  const missingKeywords = allKeywords
    .filter(keyword => !text.toLowerCase().includes(keyword.toLowerCase()))
    .slice(0, 8);
  
  // Extract contact information
  const emailMatch = text.match(/\S+@\S+\.\S+/);
  const phoneMatch = text.match(/(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
  const linkedInMatch = text.match(/linkedin\.com\/in\/\S+/i) || text.match(/linkedin\.com\/company\/\S+/i);
  
  // Calculate section presence
  const sectionsFound = Object.keys(sections).filter(key => sections[key]);
  
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
      actionVerbsFound: foundActionVerbs.length,
      achievementsFound,
      sectionsFound: sectionsFound.length,
      totalSections: Object.keys(sections).length
    },
    sections: sectionsFound
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

    // Clean the text but preserve formatting
    resumeText = resumeText.trim();
    
    // Perform AI analysis
    console.log("Performing AI analysis...");
    const analysisResults = analyzeResumeText(resumeText);
    console.log("Analysis complete. ATS Score:", analysisResults.atsScore);

    return res.json({
      success: true,
      analysis: resumeText, // Returns exact text as extracted
      ...analysisResults,
      fileType: fileType,
      fileName: req.file.originalname,
      textLength: resumeText.length,
      processedAt: new Date().toISOString()
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