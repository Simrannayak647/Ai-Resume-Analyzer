import React, { useState, useRef } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import axios from "axios";

// Components
import UploadSection from './UploadSection';
import ScoreCard from './ScoreCard';
import StatsCard from './StatsCard';
import ContactInfo from './ContactInfo';
import AnalysisTabs from './AnalysisTabs';
import TipsSection from './TipsSection';
import Footer from './Footer';

// Utils
import { getScoreColor, getScoreLabel, getScoreGradient } from '../utils/helper';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState({
    atsScore: null,
    strengths: [],
    weaknesses: [],
    missingKeywords: [],
    skills: { technical: [], soft: [], missing: [] },
    sections: {},
    stats: {},
    parsedData: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("analysis");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [analysisTime, setAnalysisTime] = useState(null);

  const fileInputRef = useRef(null);

  const industries = [
    { id: "technology", label: "Technology" },
    { id: "business", label: "Business" },
    { id: "healthcare", label: "Healthcare" },
    { id: "education", label: "Education" },
    { id: "finance", label: "Finance" },
    { id: "marketing", label: "Marketing" }
  ];

  // --- File change ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB");
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Upload PDF, DOCX, or TXT only");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setResumeData({
      atsScore: null,
      strengths: [],
      weaknesses: [],
      missingKeywords: [],
      skills: { technical: [], soft: [], missing: [] },
      sections: {},
      stats: {},
      parsedData: {}
    });
    setAnalysisTime(null);
  };

  /* ---------------- Submit Resume ---------------- */
  const handleSubmit = async () => {
    if (!file) {
      setError("Select a file first");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);
    const startTime = Date.now();

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobTitle || "");

    try {
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(
            Math.round((e.loaded * 100) / (e.total || 100))
          );
        }
      });

      if (res.data.success) {
        const serverData = res.data;

        console.log('📥 Received data from server:', {
          atsScore: serverData.atsScore,
          strengthsCount: serverData.strengths?.length,
          weaknessesCount: serverData.weaknesses?.length,
          skillsData: serverData.skills
        });

        // ✅ Map server response to component state
        const newResumeData = {
          atsScore: serverData.atsScore ?? null,
          strengths: serverData.strengths || [],
          weaknesses: serverData.weaknesses || [],
          missingKeywords: serverData.missingKeywords || [],
          
          // Skills breakdown
          skills: {
            technical: serverData.skills?.technical || [],
            soft: serverData.skills?.soft || [],
            missing: serverData.skills?.missing || []
          },
          
          // Sections detected
          sections: serverData.sections || {},
          
          // Statistics
          stats: serverData.stats || {},
          
          // Parsed data (summary, recommendation, suggestions)
          parsedData: {
            summary: serverData.parsedData?.summary || "",
            recommendation: serverData.parsedData?.recommendation || "",
            suggestions: serverData.parsedData?.suggestions || []
          }
        };

        setResumeData(newResumeData);
        setUploadProgress(100);

        const endTime = Date.now();
        setAnalysisTime(
          ((endTime - startTime) / 1000).toFixed(2)
        );

        console.log('✅ Resume data updated successfully');
      } else {
        setError(res.data.error || "Analysis failed");
      }
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(
        err.response?.data?.error ||
          "Server error. Please try again."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  /* ---------------- Retry ---------------- */
  const handleRetry = () => {
    setFile(null);
    setError("");
    setResumeData({
      atsScore: null,
      strengths: [],
      weaknesses: [],
      missingKeywords: [],
      skills: { technical: [], soft: [], missing: [] },
      sections: {},
      stats: {},
      parsedData: {}
    });
    setAnalysisTime(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------------- Download Analysis ---------------- */
  const downloadResumeText = () => {
    const analysisData = {
      atsScore: resumeData.atsScore,
      summary: resumeData.parsedData.summary,
      recommendation: resumeData.parsedData.recommendation,
      strengths: resumeData.strengths,
      areasToImprove: resumeData.weaknesses,
      suggestions: resumeData.parsedData.suggestions,
      skills: resumeData.skills,
      sections: resumeData.sections,
      stats: resumeData.stats,
      analyzedAt: new Date().toISOString()
    };

    const blob = new Blob(
      [JSON.stringify(analysisData, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `resume_analysis_${Date.now()}.json`;
    a.click();
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Resume Analyzer
            </h1>
            <p className="text-gray-600">
              Get comprehensive ATS score, skills analysis, strengths, weaknesses, and actionable suggestions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-8">
              <UploadSection
                file={file}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                industry={industry}
                setIndustry={setIndustry}
                industries={industries}
                loading={loading}
                error={error}
                uploadProgress={uploadProgress}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                onRetry={handleRetry}
                fileInputRef={fileInputRef}
                analysisTime={analysisTime}
              />

              {resumeData.atsScore !== null && (
                <ScoreCard
                  atsScore={resumeData.atsScore}
                  getScoreColor={getScoreColor}
                  getScoreLabel={getScoreLabel}
                  getScoreGradient={getScoreGradient}
                />
              )}

              {resumeData.stats && Object.keys(resumeData.stats).length > 0 && (
                <StatsCard stats={resumeData.stats} />
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-8">
              {resumeData.parsedData && Object.keys(resumeData.parsedData).length > 0 && (
                <ContactInfo contactInfo={resumeData.parsedData.contact || {}} />
              )}

              <AnalysisTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                resumeData={{
                  strengths: resumeData.strengths,
                  missingKeywords: resumeData.missingKeywords,
                  suggestions: resumeData.parsedData.suggestions || [],
                  analysis: resumeData.parsedData.summary || "No summary available",
                  skills: resumeData.skills,
                  sections: resumeData.sections
                }}
                downloadResumeText={downloadResumeText}
              />

              <TipsSection 
                strengths={resumeData.strengths} 
                missingKeywords={resumeData.missingKeywords} 
              />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  );
}