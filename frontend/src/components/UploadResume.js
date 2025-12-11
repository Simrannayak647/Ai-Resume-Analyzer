import React, { useState } from "react";
import axios from "axios";
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
  Wrench
} from "lucide-react";

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      setFile(null);
      return;
    }

    // Validate file type
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
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

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
        setUploadProgress(100);
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
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Analyzer
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and get instant AI-powered feedback on ATS compatibility,
            keyword optimization, and improvement suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Score */}
          <div className="lg:col-span-1 space-y-8">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 ml-4">
                  Upload Resume
                </h2>
              </div>

              <div className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={() => document.getElementById("resume-upload").click()}
                >
                  <input
                    type="file"
                    id="resume-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-700 font-medium">
                      {file ? file.name : "Click to upload"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports PDF, DOCX, TXT (Max 5MB)
                    </p>
                    {file && (
                      <div className="mt-4 flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">File selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                    loading || !file
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-3" />
                      Analyze Resume
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ATS Score Card */}
            {atsScore !== null && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    ATS Compatibility Score
                  </h2>
                </div>

                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="relative">
                      <svg className="w-48 h-48" viewBox="0 0 100 100">
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
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-gray-900">
                          {atsScore}
                        </span>
                        <span className="text-sm text-gray-500">out of 100</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${getScoreGradient(atsScore)} text-white`}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      {getScoreLabel(atsScore)}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-gray-500">Needs Work</div>
                      <div className="text-lg font-bold text-red-600">0-59</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xs text-gray-500">Good</div>
                      <div className="text-lg font-bold text-yellow-600">60-79</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-gray-500">Excellent</div>
                      <div className="text-lg font-bold text-green-600">80-100</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            {stats && Object.keys(stats).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    Resume Stats
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Word Count</span>
                    <span className="font-semibold">{stats.wordCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Technical Keywords</span>
                    <span className="font-semibold text-blue-600">
                      {stats.techKeywordsFound || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Soft Skills</span>
                    <span className="font-semibold text-green-600">
                      {stats.softSkillsFound || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Action Verbs</span>
                    <span className="font-semibold text-purple-600">
                      {stats.actionVerbsFound || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            {contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.linkedin) && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 ml-4">
                    Contact Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contactInfo.email && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 truncate">{contactInfo.email}</p>
                      </div>
                    </div>
                  )}
                  {contactInfo.phone && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{contactInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  {contactInfo.linkedin && (
                    <div className="flex items-center p-3 bg-blue-100 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-700 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <p className="font-medium text-gray-900 truncate">{contactInfo.linkedin}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Tabs */}
            {analysis && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {[
                      { id: "analysis", label: "Extracted Text", icon: FileText },
                      { id: "suggestions", label: "Suggestions", icon: AlertCircle },
                      { id: "strengths", label: "Strengths", icon: CheckCircle },
                      { id: "keywords", label: "Keywords", icon: Star }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.id
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === "analysis" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Extracted Resume Content
                        </h3>
                        <div className="text-sm text-gray-500">
                          {analysis.length} characters
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-gray-800 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                          {analysis}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === "suggestions" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Areas for Improvement
                      </h3>
                      {suggestions.length > 0 ? (
                        <div className="space-y-4">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-800">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <p className="text-gray-600">Great! No major suggestions at this time.</p>
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
                              className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                              <span className="text-gray-800">{strength}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600">No strengths identified yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "keywords" && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                            Missing Keywords
                          </h4>
                          {missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {missingKeywords.map((keyword, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-medium"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">All recommended keywords found!</p>
                          )}
                        </div>

                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-4">
                            Recommended Sections
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                              <Briefcase className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-gray-800">Professional Experience</span>
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-gray-800">Education</span>
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                              <Wrench className="w-5 h-5 text-blue-600 mr-3" />
                              <span className="text-gray-800">Skills Section</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 mr-4" />
                <h3 className="text-2xl font-bold">ATS Optimization Tips</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span>Use keywords from the job description throughout your resume</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span>Quantify achievements with numbers and percentages</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span>Use standard section headers like "Work Experience", "Education", "Skills"</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span>Avoid tables, columns, and graphics that ATS systems can't read</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span>Save your resume as a PDF to preserve formatting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p className="mb-2">
            <span className="font-semibold text-gray-700">AI Resume Analyzer</span> • 
            Get your resume ATS-ready in seconds
          </p>
          <p className="max-w-2xl mx-auto">
            Note: This tool provides AI-powered suggestions. Always review and customize your resume for each application.
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadResume;