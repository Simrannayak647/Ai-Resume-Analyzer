import React, { useState } from "react";
import {
  FileText, AlertCircle, CheckCircle, Star, Layout,
  Copy, Download, Code, Users, Briefcase, GraduationCap,
  Wrench, Award, Cpu, User, MessageSquare
} from "lucide-react";

function AnalysisTabs({
  activeTab,
  setActiveTab,
  resumeData = {},
  downloadResumeText
}) {
  const [copied, setCopied] = useState(false);

  // Safe data extraction
  const safeData = {
    suggestions: resumeData.suggestions || [],
    strengths: resumeData.strengths || [],
    missingKeywords: resumeData.missingKeywords || [],
    analysis: resumeData.analysis || "No analysis available yet.",
    skills: resumeData.skills || { technical: [], soft: [], missing: [] },
    sections: resumeData.sections || {}
  };

  const tabs = [
    { id: "analysis", label: "Summary", icon: FileText },
    { id: "strengths", label: "Strengths", icon: CheckCircle, count: safeData.strengths.length },
    { id: "weaknesses", label: "Areas to Improve", icon: AlertCircle, count: safeData.missingKeywords.length },
    { id: "suggestions", label: "Suggestions", icon: Star, count: safeData.suggestions.length },
    { id: "skills", label: "Skills Analysis", icon: Code },
    { id: "sections", label: "Sections", icon: Layout }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(safeData.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Section configuration with icons
  const sectionConfig = [
    { key: "contactInfo", name: "Contact Information", icon: User },
    { key: "summary", name: "Professional Summary", icon: FileText },
    { key: "experience", name: "Work Experience", icon: Briefcase },
    { key: "education", name: "Education", icon: GraduationCap },
    { key: "skills", name: "Skills", icon: Wrench },
    { key: "projects", name: "Projects", icon: Cpu },
    { key: "certifications", name: "Certifications", icon: Award },
    { key: "achievements", name: "Achievements", icon: Star }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* TABS HEADER */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6">
        <div className="flex overflow-x-auto py-2 scrollbar-hide">
          {tabs.map((tab) => (
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
              {tab.count !== undefined && tab.count > 0 && (
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
        
        {/* TAB 1 — SUMMARY */}
        {activeTab === "analysis" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Resume Analysis Summary
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Comprehensive analysis powered by Gemini AI
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-300"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </button>

                <button
                  onClick={downloadResumeText}
                  className="flex items-center px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {safeData.analysis}
              </p>
            </div>

            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              <span>{safeData.analysis.length} characters</span>
              <span className="mx-2">•</span>
              <span>{safeData.analysis.split(/\s+/).length} words</span>
            </div>
          </div>
        )}

        {/* TAB 2 — STRENGTHS */}
        {activeTab === "strengths" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Resume Strengths ({safeData.strengths.length})
            </h3>

            {safeData.strengths.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {safeData.strengths.map((strength, i) => (
                  <div
                    key={i}
                    className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No strengths detected</p>
                <p className="text-sm mt-2">Upload a resume to see analysis</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3 — AREAS TO IMPROVE */}
        {activeTab === "weaknesses" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Areas to Improve ({safeData.missingKeywords.length})
            </h3>

            {safeData.missingKeywords.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {safeData.missingKeywords.map((weakness, i) => (
                  <div
                    key={i}
                    className="flex items-start p-4 bg-red-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{weakness}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-green-500">
                <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                <p className="text-lg font-medium">Excellent! No major issues found</p>
                <p className="text-sm mt-2 text-gray-500">Your resume looks well-optimized</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4 — SUGGESTIONS */}
        {activeTab === "suggestions" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Actionable Suggestions ({safeData.suggestions.length})
            </h3>

            {safeData.suggestions.length > 0 ? (
              <div className="space-y-4">
                {safeData.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Star className="w-5 h-5 text-yellow-700 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700 font-medium">Suggestion {i + 1}</p>
                      <p className="text-gray-600 mt-1">{suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">No suggestions available</p>
                <p className="text-sm mt-2">Try analyzing a resume first</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5 — SKILLS ANALYSIS */}
        {activeTab === "skills" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Skills Breakdown
            </h3>

            <div className="space-y-6">
              {/* Technical Skills */}
              <div>
                <div className="flex items-center mb-3">
                  <Code className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="text-md font-semibold text-gray-800">
                    Technical Skills ({safeData.skills.technical.length})
                  </h4>
                </div>
                {safeData.skills.technical.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {safeData.skills.technical.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No technical skills detected</p>
                )}
              </div>

              {/* Soft Skills */}
              <div>
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="text-md font-semibold text-gray-800">
                    Soft Skills ({safeData.skills.soft.length})
                  </h4>
                </div>
                {safeData.skills.soft.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {safeData.skills.soft.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No soft skills detected</p>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="text-md font-semibold text-gray-800">
                    Skills to Add ({safeData.skills.missing.length})
                  </h4>
                </div>
                {safeData.skills.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {safeData.skills.missing.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600 text-sm font-medium">No missing skills - great job!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6 — SECTIONS */}
        {activeTab === "sections" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Resume Sections Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionConfig.map((section) => {
                const isFound = safeData.sections[section.key] === true;
                return (
                  <div
                    key={section.key}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all ${
                      isFound
                        ? "bg-green-50 border-green-300 hover:shadow-lg"
                        : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <section.icon className={`w-6 h-6 mr-3 ${
                      isFound ? "text-green-600" : "text-gray-400"
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isFound ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {section.name}
                      </p>
                      <p className={`text-sm ${
                        isFound ? "text-green-600" : "text-gray-400"
                      }`}>
                        {isFound ? "✓ Present" : "✗ Missing"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">
                  {Object.values(safeData.sections).filter(Boolean).length} of {sectionConfig.length}
                </span>{" "}
                sections detected in your resume
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AnalysisTabs;