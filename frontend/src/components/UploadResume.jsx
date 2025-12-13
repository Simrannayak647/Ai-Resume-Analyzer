import React, { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import axios from "axios";
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Components
import UploadSection from './UploadSection';
import ScoreCard from './ScoreCard';
import StatsCard from './StatsCard';
import ContactInfo from './ContactInfo';
import AnalysisTabs from './AnalysisTabs';
import PdfPreview from './PdfPreview';
import TipsSection from './TipsSection';
import Footer from './Footer';

// Utils
import { getScoreColor, getScoreLabel, getScoreGradient } from '../utils/helper';

// PDF worker - SIMPLE FIX
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    sections: [],
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

  // PDF states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const fileInputRef = useRef(null);
  const pdfContainerRef = useRef(null);

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
      sections: [],
      stats: {},
      parsedData: {}
    });
    setAnalysisTime(null);
    setShowPdfPreview(false);

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // --- Submit resume ---
  const handleSubmit = async () => {
  if (!file) {
    setError("Select a file first");
    return;
  }

  setLoading(true);
  setError("");
  setUploadProgress(0);
  setShowPdfPreview(false);
  const startTime = Date.now();

  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobTitle || "");

  console.log("📤 Sending to:", `${API_URL}/analyze`); // ✅ CORRECT: Log before API call

  try {
    const res = await axios.post(`${API_URL}/analyze`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        setUploadProgress(percentCompleted);
      },
    });

    // ✅ CORRECT: Log AFTER getting response
    console.log("📥 Full Server Response:", JSON.stringify(res.data, null, 2));
    console.log("📊 Response data structure:", res.data);

    if (res.data.success) {
      // Access data correctly - your backend returns res.data.data
      const analysisData = res.data.data || {};
      
      console.log("🔍 Analysis Data:", analysisData);

      setResumeData({
        atsScore: analysisData.matchScore || 0,
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.missingSkills || [],
        missingKeywords: [],
        sections: [],
        stats: {
          wordCount: analysisData.text?.split(/\s+/).length || 0,
          skillsFound: analysisData.strengths?.length || 0,
          sectionsFound: 0
        },
        parsedData: {
          contact: {},
          ...analysisData
        }
      });

      setUploadProgress(100);

      if (file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        setShowPdfPreview(true);
      }

      const endTime = Date.now();
      setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
    } else {
      const errorMsg = res.data.error || "Analysis failed";
      setError(`Server error: ${errorMsg}`);
      console.error("Server error response:", res.data);
    }
  } catch (err) {
    console.error("❌ Upload error:", err);
    
    let errorMessage = "Failed to analyze resume";
    if (err.response) {
      errorMessage = err.response.data?.error || 
                    err.response.data?.message || 
                    `Server error (${err.response.status})`;
    } else if (err.request) {
      errorMessage = "No response from server. Check your connection.";
    } else {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
    setTimeout(() => setUploadProgress(0), 2000);
  }
};

  // --- Retry / Reset ---
  const handleRetry = () => {
    setFile(null);
    setResumeData({
      atsScore: null,
      strengths: [],
      weaknesses: [],
      missingKeywords: [],
      sections: [],
      stats: {},
      parsedData: {}
    });
    setError("");
    setShowPdfPreview(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Download analyzed resume text ---
  const downloadResumeText = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([JSON.stringify(resumeData.parsedData, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "resume_analysis.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- PDF preview handlers ---
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  const onDocumentLoadError = (error) => console.error('PDF load error', error);
  const changePage = (offset) => setPageNumber(prev => Math.max(1, Math.min(prev + offset, numPages || 1)));
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = pdfContainerRef.current;
      elem?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    return () => pdfUrl && URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Resume Analyzer
            </h1>
            <p className="text-gray-600">Get ATS score, strengths, weaknesses, missing keywords, and section-wise analysis.</p>
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

              {showPdfPreview && pdfUrl && file?.type === "application/pdf" ? (
                <PdfPreview
                  pdfUrl={pdfUrl}
                  pageNumber={pageNumber}
                  numPages={numPages}
                  scale={scale}
                  isFullscreen={isFullscreen}
                  onDocumentLoadSuccess={onDocumentLoadSuccess}
                  onDocumentLoadError={onDocumentLoadError}
                  changePage={changePage}
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  resetZoom={resetZoom}
                  toggleFullscreen={toggleFullscreen}
                  setPageNumber={setPageNumber}
                  pdfContainerRef={pdfContainerRef}
                />
              ) : (
                <AnalysisTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  resumeData={resumeData}
                  downloadResumeText={downloadResumeText}
                />
              )}

              <TipsSection strengths={resumeData.strengths} missingKeywords={resumeData.missingKeywords} />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  );
}
