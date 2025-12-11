import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Now import icons
import {
  Upload,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Star,
  Target,
  Users,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Globe,
  Shield,
  Zap,
  Cpu,
  Wrench,
  Download,
  Copy,
  Eye,
  BarChart3,
  Clock,
  FileCheck,
  Hash,
  Layout,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



function UploadResume() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("analysis");
  const [copied, setCopied] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [sections, setSections] = useState([]);
  const [analysisTime, setAnalysisTime] = useState(null);
  
  // PDF preview states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const fileInputRef = useRef(null);
  const pdfContainerRef = useRef(null);

  const industries = [
    { id: "technology", label: "Technology", color: "bg-blue-100 text-blue-800" },
    { id: "business", label: "Business", color: "bg-green-100 text-green-800" },
    { id: "healthcare", label: "Healthcare", color: "bg-red-100 text-red-800" },
    { id: "education", label: "Education", color: "bg-purple-100 text-purple-800" },
    { id: "finance", label: "Finance", color: "bg-yellow-100 text-yellow-800" },
    { id: "marketing", label: "Marketing", color: "bg-pink-100 text-pink-800" }
  ];

  // PDF handling functions
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF preview.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages || 1));
    });
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = pdfContainerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload PDF, DOCX, or TXT files only");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setAnalysis("");
    setAtsScore(null);
    setSuggestions([]);
    setStrengths([]);
    setMissingKeywords([]);
    setContactInfo({});
    setStats({});
    setSections([]);
    setAnalysisTime(null);
    setShowPdfPreview(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
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
    formData.append("file", file);
    if (jobTitle) formData.append("jobTitle", jobTitle);
    if (industry) formData.append("industry", industry);

    try {
      const res = await axios.post("http://localhost:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.success) {
        setAnalysis(res.data.analysis || "");
        setAtsScore(res.data.atsScore || null);
        setSuggestions(res.data.suggestions || []);
        setStrengths(res.data.strengths || []);
        setMissingKeywords(res.data.missingKeywords || []);
        setContactInfo(res.data.contactInfo || {});
        setStats(res.data.stats || {});
        setSections(res.data.sections || []);
        setUploadProgress(100);
        
        if (file.type === "application/pdf") {
          const url = URL.createObjectURL(file);
          setPdfUrl(url);
          setPdfError(null);
          setShowPdfPreview(true);
        }
        
        const endTime = Date.now();
        setAnalysisTime(((endTime - startTime) / 1000).toFixed(2));
      } else {
        setError(res.data.error || "Analysis failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze resume. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getScoreGradient = (score) => {
    if (score >= 85) return "from-emerald-500 to-green-600";
    if (score >= 70) return "from-blue-500 to-indigo-600";
    if (score >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResumeText = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([analysis], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "resume_analysis.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      const event = {
        target: {
          files: [selectedFile]
        }
      };
      handleFileChange(event);
    }
  };

  const handleRetry = () => {
    setFile(null);
    setAnalysis("");
    setAtsScore(null);
    setSuggestions([]);
    setStrengths([]);
    setMissingKeywords([]);
    setContactInfo({});
    setStats({});
    setSections([]);
    setError("");
    setShowPdfPreview(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Toggle PDF preview
  const togglePdfPreview = () => {
    setShowPdfPreview(!showPdfPreview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <FileCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Resume Analyzer
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get comprehensive AI-powered analysis of your resume with exact content extraction,
            ATS compatibility scoring, and personalized improvement suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Score */}
          <div className="lg:col-span-1 space-y-8">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    Upload Resume
                  </h2>
                </div>
                {analysis && (
                  <button
                    onClick={handleRetry}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <span>New Analysis</span>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Job Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>

                {/* Industry Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <button
                        key={ind.id}
                        onClick={() => setIndustry(ind.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                          industry === ind.id
                            ? `${ind.color} ring-2 ring-offset-2 ring-opacity-50`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Area */}
                <div
                  className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    file
                      ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                      : "border-gray-300 hover:border-blue-500 hover:bg-gradient-to-br from-blue-50 to-cyan-50"
                  }`}
                  onClick={() => document.getElementById("resume-upload").click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="resume-upload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl mb-4 shadow-inner">
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-gray-800 font-semibold text-lg">
                      {file ? file.name : "Drop your resume here or click to upload"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports PDF, DOCX, TXT • Max 5MB
                    </p>
                    {file && (
                      <div className="mt-4 flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="font-medium">Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    loading || !file
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-3 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-3" />
                      <span>Analyze Resume</span>
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-pulse">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-semibold">Analysis Error</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Time */}
                {analysisTime && (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Analysis completed in {analysisTime} seconds</span>
                  </div>
                )}
              </div>
            </div>

            {/* ATS Score Card */}
            {atsScore !== null && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 ml-4">
                      ATS Score
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreGradient(atsScore).replace('from-', 'bg-gradient-to-r ')} text-white`}>
                    {getScoreLabel(atsScore)}
                  </span>
                </div>

                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="relative">
                      <svg className="w-52 h-52" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={getScoreColor(atsScore)}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${atsScore * 2.83} 283`}
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-gray-900">
                          {atsScore}
                        </span>
                        <span className="text-sm text-gray-500">out of 100</span>
                        <div className="mt-2">
                          <div className={`text-xs px-2 py-1 rounded-full ${getScoreGradient(atsScore).replace('from-', 'bg-gradient-to-r ')} text-white`}>
                            {atsScore >= 85 ? "🏆 Excellent" : atsScore >= 70 ? "👍 Good" : atsScore >= 60 ? "⚠️ Fair" : "📝 Needs Work"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-6 grid grid-cols-4 gap-3">
                    <div className={`text-center p-3 rounded-xl transition-all duration-300 ${atsScore < 60 ? "bg-red-50 border-2 border-red-200" : "bg-gray-50"}`}>
                      <div className="text-xs font-medium text-gray-500">Poor</div>
                      <div className="text-lg font-bold text-red-600">0-59</div>
                    </div>
                    <div className={`text-center p-3 rounded-xl transition-all duration-300 ${atsScore >= 60 && atsScore < 70 ? "bg-yellow-50 border-2 border-yellow-200" : "bg-gray-50"}`}>
                      <div className="text-xs font-medium text-gray-500">Fair</div>
                      <div className="text-lg font-bold text-yellow-600">60-69</div>
                    </div>
                    <div className={`text-center p-3 rounded-xl transition-all duration-300 ${atsScore >= 70 && atsScore < 85 ? "bg-blue-50 border-2 border-blue-200" : "bg-gray-50"}`}>
                      <div className="text-xs font-medium text-gray-500">Good</div>
                      <div className="text-lg font-bold text-blue-600">70-84</div>
                    </div>
                    <div className={`text-center p-3 rounded-xl transition-all duration-300 ${atsScore >= 85 ? "bg-green-50 border-2 border-green-200" : "bg-gray-50"}`}>
                      <div className="text-xs font-medium text-gray-500">Excellent</div>
                      <div className="text-lg font-bold text-green-600">85-100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            {stats && Object.keys(stats).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    Resume Analytics
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 text-blue-600 mr-3" />
                      <span className="text-gray-700">Word Count</span>
                    </div>
                    <span className="font-bold text-gray-900">{stats.wordCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center">
                      <Cpu className="w-4 h-4 text-green-600 mr-3" />
                      <span className="text-gray-700">Technical Keywords</span>
                    </div>
                    <span className="font-bold text-green-700">
                      {stats.techKeywordsFound || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-yellow-600 mr-3" />
                      <span className="text-gray-700">Soft Skills</span>
                    </div>
                    <span className="font-bold text-yellow-700">
                      {stats.softSkillsFound || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-purple-600 mr-3" />
                      <span className="text-gray-700">Action Verbs</span>
                    </div>
                    <span className="font-bold text-purple-700">
                      {stats.actionVerbsFound || 0}
                    </span>
                  </div>
                  {stats.sectionsFound && (
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                      <div className="flex items-center">
                        <Layout className="w-4 h-4 text-indigo-600 mr-3" />
                        <span className="text-gray-700">Sections Found</span>
                      </div>
                      <span className="font-bold text-indigo-700">
                        {stats.sectionsFound}/{stats.totalSections || 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            {contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.linkedin) && (
              <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    Contact Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contactInfo.email && (
                    <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Email</p>
                        <p className="font-semibold text-gray-900 truncate">{contactInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {contactInfo.phone && (
                    <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-300">
                      <Phone className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Phone</p>
                        <p className="font-semibold text-gray-900">{contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {contactInfo.linkedin && (
                    <div className="flex items-center p-4 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-300">
                      <Globe className="w-5 h-5 text-blue-700 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">LinkedIn</p>
                        <p className="font-semibold text-gray-900 truncate">{contactInfo.linkedin}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Tabs */}
            {analysis && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6">
                  <div className="flex overflow-x-auto py-2">
                    {[
                      { id: "analysis", label: "Extracted Text", icon: FileText, count: analysis.length },
                      { id: "suggestions", label: "Suggestions", icon: AlertCircle, count: suggestions.length },
                      { id: "strengths", label: "Strengths", icon: CheckCircle, count: strengths.length },
                      { id: "keywords", label: "Keywords", icon: Star, count: missingKeywords.length },
                      { id: "sections", label: "Sections", icon: Layout, count: sections?.length || 0 }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-300 rounded-lg mx-1 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                        {tab.count !== undefined && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            activeTab === tab.id 
                              ? "bg-white text-blue-600" 
                              : "bg-gray-200 text-gray-700"
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "analysis" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {file?.type === "application/pdf" && showPdfPreview 
                              ? "PDF Preview" 
                              : "Extracted Resume Content"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {file?.type === "application/pdf" && showPdfPreview
                              ? "View your resume exactly as it appears"
                              : "This is the exact text extracted from your resume"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {file?.type === "application/pdf" && (
                            <button
                              onClick={togglePdfPreview}
                              className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 rounded-lg transition-colors duration-300 border border-blue-200"
                            >
                              {showPdfPreview ? (
                                <>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Show Extracted Text
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Show PDF Preview
                                </>
                              )}
                            </button>
                          )}
                          
                          {(!showPdfPreview || file?.type !== "application/pdf") && (
                            <>
                              <button
                                onClick={copyToClipboard}
                                className="flex items-center px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-300"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                {copied ? "Copied!" : "Copy Text"}
                              </button>
                              <button
                                onClick={downloadResumeText}
                                className="flex items-center px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-300"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* PDF Preview Section */}
                      {file?.type === "application/pdf" && showPdfPreview && pdfUrl ? (
                        <div 
                          id="pdf-preview-container"
                          ref={pdfContainerRef}
                          className="relative bg-gray-900 rounded-xl border-2 border-gray-800 overflow-hidden max-h-[600px]"
                        >
                          {/* PDF Controls */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                            <button
                              onClick={() => changePage(-1)}
                              disabled={pageNumber <= 1}
                              className={`p-2 rounded-lg ${pageNumber <= 1 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <span className="text-white text-sm font-medium px-2">
                              Page {pageNumber} of {numPages || '--'}
                            </span>
                            
                            <button
                              onClick={() => changePage(1)}
                              disabled={pageNumber >= (numPages || 1)}
                              className={`p-2 rounded-lg ${pageNumber >= (numPages || 1) ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            
                            <div className="w-px h-6 bg-gray-600 mx-2"></div>
                            
                            <button
                              onClick={zoomOut}
                              disabled={scale <= 0.5}
                              className={`p-2 rounded-lg ${scale <= 0.5 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
                            >
                              <ZoomOut className="w-4 h-4" />
                            </button>
                            
                            <span className="text-white text-sm font-medium min-w-[60px] text-center">
                              {Math.round(scale * 100)}%
                            </span>
                            
                            <button
                              onClick={zoomIn}
                              disabled={scale >= 3}
                              className={`p-2 rounded-lg ${scale >= 3 ? 'text-gray-500 cursor-not-allowed' : 'text-white hover:bg-gray-700'}`}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={resetZoom}
                              className="p-2 text-white hover:bg-gray-700 rounded-lg text-sm font-medium"
                            >
                              Reset
                            </button>
                            
                            <div className="w-px h-6 bg-gray-600 mx-2"></div>
                            
                            <button
                              onClick={toggleFullscreen}
                              className="p-2 text-white hover:bg-gray-700 rounded-lg"
                            >
                              {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                              ) : (
                                <Maximize2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* PDF Document */}
                          <div className="overflow-auto h-[600px] p-8 flex justify-center">
                            <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
                              <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading={
                                  <div className="flex items-center justify-center h-[600px]">
                                    <div className="text-center">
                                      <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                                      <p className="text-gray-600">Loading PDF preview...</p>
                                    </div>
                                  </div>
                                }
                                error={
                                  <div className="flex items-center justify-center h-[600px] bg-red-50">
                                    <div className="text-center p-8">
                                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                      <p className="text-red-700 font-semibold">Failed to load PDF</p>
                                      <p className="text-red-600 text-sm mt-2">Please try uploading the file again</p>
                                    </div>
                                  </div>
                                }
                              >
                                <Page 
                                  pageNumber={pageNumber} 
                                  scale={scale}
                                  renderAnnotationLayer={false}
                                  renderTextLayer={false}
                                  className="shadow-lg"
                                />
                              </Document>
                            </div>
                          </div>

                          {/* Page Navigation Footer */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                            <div className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                              {Array.from({ length: Math.min(numPages || 0, 5) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setPageNumber(pageNum)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                      pageNumber === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              
                              {numPages && numPages > 5 && (
                                <span className="text-gray-400 text-sm px-2">
                                  ... of {numPages}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Text Content Section */
                        <div className="bg-white rounded-xl p-6 border border-gray-200 max-h-[600px] overflow-y-auto">
                          <pre className="text-gray-800 font-mono whitespace-pre-wrap text-sm leading-relaxed">
                            {analysis}
                          </pre>
                        </div>
                      )}

                      {/* File Info */}
                      <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {file?.type === "application/pdf" && showPdfPreview ? (
                            <>
                              <span>PDF Preview • Page {pageNumber} of {numPages || '--'}</span>
                              <span className="mx-2">•</span>
                              <span>Zoom: {Math.round(scale * 100)}%</span>
                            </>
                          ) : (
                            <>
                              <span>{analysis.length} characters</span>
                              <span className="mx-2">•</span>
                              <span>{analysis.split(/\s+/).length} words</span>
                            </>
                          )}
                        </div>
                        
                        {file && (
                          <div className="flex items-center text-gray-600">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              file.type === "application/pdf" 
                                ? "bg-red-100 text-red-800" 
                                : file.type.includes("wordprocessingml") 
                                  ? "bg-blue-100 text-blue-800" 
                                  : "bg-gray-100 text-gray-800"
                            }`}>
                              {file.type === "application/pdf" ? "PDF" : 
                               file.type.includes("wordprocessingml") ? "DOCX" : "TXT"}
                            </div>
                            <span className="ml-2 text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "suggestions" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Recommendations for Improvement
                      </h3>
                      {suggestions.length > 0 ? (
                        <div className="space-y-4">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="flex items-start p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl hover:shadow-sm transition-shadow duration-300"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-yellow-800 font-bold text-sm">{index + 1}</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-800">{suggestion}</p>
                                <div className="mt-2 flex items-center text-sm text-yellow-700">
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Priority: {index < 3 ? "High" : "Medium"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                          </div>
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Excellent Resume!</h4>
                          <p className="text-gray-600 max-w-md mx-auto">
                            Your resume meets all our ATS optimization criteria. No major suggestions at this time.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "strengths" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Resume Strengths
                      </h3>
                      {strengths.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {strengths.map((strength, index) => (
                            <div
                              key={index}
                              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-sm transition-shadow duration-300"
                            >
                              <div className="flex-shrink-0 mr-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{strength}</p>
                                <div className="mt-1 flex items-center text-sm text-green-700">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  Strong Point
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-gray-600">No specific strengths identified yet. Try adding more industry keywords and quantifiable achievements.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "keywords" && (
                    <div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center mb-4">
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                            <h4 className="text-md font-semibold text-gray-900">Missing Keywords</h4>
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              {missingKeywords.length} missing
                            </span>
                          </div>
                          {missingKeywords.length > 0 ? (
                            <div className="space-y-3">
                              {missingKeywords.map((keyword, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 rounded-lg hover:shadow-sm transition-shadow duration-300"
                                >
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-red-700 text-xs font-bold">{index + 1}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{keyword}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const text = `${keyword} - Consider adding this keyword to your resume`;
                                      navigator.clipboard.writeText(text);
                                    }}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    Copy
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                              <p className="font-semibold text-gray-900 mb-1">All Recommended Keywords Found!</p>
                              <p className="text-sm text-gray-600">Your resume includes all the important industry keywords.</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center mb-4">
                            <Layout className="w-5 h-5 text-blue-600 mr-2" />
                            <h4 className="text-md font-semibold text-gray-900">Recommended Sections</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-sm transition-shadow duration-300">
                              <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <span className="font-medium text-gray-900">Professional Experience</span>
                                <p className="text-sm text-gray-600 mt-1">Detail your work history with achievements</p>
                              </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-sm transition-shadow duration-300">
                              <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <span className="font-medium text-gray-900">Education</span>
                                <p className="text-sm text-gray-600 mt-1">Include degrees, institutions, and dates</p>
                              </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-sm transition-shadow duration-300">
                              <Wrench className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <span className="font-medium text-gray-900">Skills Section</span>
                                <p className="text-sm text-gray-600 mt-1">Technical and soft skills relevant to your industry</p>
                              </div>
                            </div>
                            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-sm transition-shadow duration-300">
                              <Award className="w-5 h-5 text-blue-600 mr-3" />
                              <div>
                                <span className="font-medium text-gray-900">Certifications</span>
                                <p className="text-sm text-gray-600 mt-1">Professional certifications and licenses</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sections" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Resume Sections Analysis
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: "Contact Information", icon: Users, found: contactInfo.email || contactInfo.phone },
                          { name: "Professional Summary", icon: FileText, found: /summary|profile|objective/i.test(analysis) },
                          { name: "Work Experience", icon: Briefcase, found: /experience|work history|employment/i.test(analysis) },
                          { name: "Education", icon: GraduationCap, found: /education|degree|university|college/i.test(analysis) },
                          { name: "Skills", icon: Wrench, found: /skills|technical|proficiencies/i.test(analysis) },
                          { name: "Certifications", icon: Award, found: /certification|certified|license/i.test(analysis) },
                          { name: "Projects", icon: Cpu, found: /projects|portfolio|github/i.test(analysis) },
                          { name: "Achievements", icon: Star, found: /achievements|awards|honors/i.test(analysis) }
                        ].map((section, index) => (
                          <div
                            key={index}
                            className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                              section.found
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                            }`}
                          >
                            <div className={`p-3 rounded-lg ${
                              section.found ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                            }`}>
                              <section.icon className="w-5 h-5" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{section.name}</p>
                              <p className={`text-sm ${section.found ? "text-green-600" : "text-gray-500"}`}>
                                {section.found ? "✓ Found in resume" : "✗ Not detected"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white transform hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">ATS Optimization Mastery</h3>
                  <p className="text-blue-100 mt-1">Pro tips to get your resume noticed</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Keyword Strategy</h4>
                      <p className="text-blue-100">Use 20-30 industry-specific keywords from job descriptions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Quantifiable Results</h4>
                      <p className="text-blue-100">Include numbers: "Increased revenue by 40%" beats "Increased revenue"</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Formatting</h4>
                      <p className="text-blue-100">Use standard fonts (Arial, Calibri, Times New Roman), 10-12pt size</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">File Type</h4>
                      <p className="text-blue-100">Always submit as PDF to preserve formatting across all devices</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Section Headers</h4>
                      <p className="text-blue-100">Use standard headers: "Work Experience", "Education", "Skills"</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-white font-bold">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Length Control</h4>
                      <p className="text-blue-100">Keep to 1-2 pages (500-800 words) for optimal ATS parsing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-800">
                AI Resume Analyzer
              </p>
            </div>
            <p className="mb-2 text-gray-700">
              Get your resume ATS-ready in seconds • Real-time analysis • Industry-specific feedback
            </p>
            <p className="max-w-2xl mx-auto text-sm text-gray-500">
              Note: This AI-powered tool provides suggestions based on industry best practices. 
              Always customize your resume for each specific job application and review carefully.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                Secure & Private
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1 text-blue-500" />
                Instant Results
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Shield className="w-3 h-3 mr-1 text-purple-500" />
                No Data Storage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResume;