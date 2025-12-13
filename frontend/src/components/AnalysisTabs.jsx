import React from "react";
import {
  FileText, AlertCircle, CheckCircle, Star, Layout,
  Copy, Download, Eye, XCircle, Briefcase, GraduationCap,
  Wrench, Award, Cpu, Search
} from "lucide-react";
import { Users } from "lucide-react";

function AnalysisTabs({
  activeTab,
  setActiveTab,
  resumeData = {},
  file,
  showPdfPreview,
  setShowPdfPreview,
  pdfUrl,
  copied,
  setCopied,
  downloadResumeText
}) {

  // SAFETY BLOCK → Prevent undefined errors
  const safeData = {
    analysis: resumeData.analysis || "",
    suggestions: resumeData.suggestions || [],
    strengths: resumeData.strengths || [],
    missingKeywords: resumeData.missingKeywords || [],
    sections: resumeData.sections || [],
    contactInfo: resumeData.contactInfo || {}
  };

  const tabs = [
    { id: "analysis", label: "Extracted Text", icon: FileText, count: safeData.analysis.length },
    { id: "suggestions", label: "Suggestions", icon: AlertCircle, count: safeData.suggestions.length },
    { id: "strengths", label: "Strengths", icon: CheckCircle, count: safeData.strengths.length },
    { id: "keywords", label: "Keywords", icon: Star, count: safeData.missingKeywords.length },
    { id: "sections", label: "Sections", icon: Layout, count: safeData.sections.length }
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(safeData.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { name: "Contact Information", icon: Users, found: safeData.contactInfo.email || safeData.contactInfo.phone },
    { name: "Professional Summary", icon: FileText, found: /summary|profile|objective/i.test(safeData.analysis) },
    { name: "Work Experience", icon: Briefcase, found: /experience|work history|employment/i.test(safeData.analysis) },
    { name: "Education", icon: GraduationCap, found: /education|degree|university|college/i.test(safeData.analysis) },
    { name: "Skills", icon: Wrench, found: /skills|technical|proficiencies/i.test(safeData.analysis) },
    { name: "Certifications", icon: Award, found: /certification|certified|license/i.test(safeData.analysis) },
    { name: "Projects", icon: Cpu, found: /projects|portfolio|github/i.test(safeData.analysis) },
    { name: "Achievements", icon: Star, found: /achievements|awards|honors/i.test(safeData.analysis) }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      
      {/* TABS HEADER */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6">
        <div className="flex overflow-x-auto py-2">
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
        
        {/* TAB 1 — ANALYSIS */}
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
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
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

                {!showPdfPreview && (
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

            {/* TEXT COUNTS */}
            <div className="mt-4 text-sm text-gray-500 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                
                {!showPdfPreview ? (
                  <>
                    <span>{safeData.analysis.length} characters</span>
                    <span className="mx-2">•</span>
                    <span>{safeData.analysis.split(/\s+/).length} words</span>
                  </>
                ) : (
                  <span>PDF Preview</span>
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

        {/* TAB 2 — SUGGESTIONS */}
        {activeTab === "suggestions" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Recommendations for Improvement
            </h3>

            {safeData.suggestions.length > 0 ? (
              safeData.suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-3"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-700 mr-3" />
                  <p>{suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No suggestions available.</p>
            )}
          </div>
        )}

        {/* TAB 3 — STRENGTHS */}
        {activeTab === "strengths" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Resume Strengths
            </h3>

            {safeData.strengths.length > 0 ? (
              safeData.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex items-start p-4 bg-green-50 border border-green-200 rounded-xl mb-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-700 mr-3" />
                  <p>{strength}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No strengths detected.</p>
            )}
          </div>
        )}

        {/* TAB 4 — KEYWORDS */}
        {activeTab === "keywords" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Missing Keywords
            </h3>

            {safeData.missingKeywords.length > 0 ? (
              safeData.missingKeywords.map((k, i) => (
                <div
                  key={i}
                  className="flex justify-between p-4 bg-red-50 border border-red-200 rounded-xl mb-3"
                >
                  <span>{k}</span>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              ))
            ) : (
              <p className="text-gray-600">All keywords found!</p>
            )}
          </div>
        )}

        {/* TAB 5 — SECTIONS */}
        {activeTab === "sections" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Resume Sections
            </h3>

            {sections.map((section, i) => (
              <div
                key={i}
                className={`flex items-center p-4 rounded-xl mb-3 border ${
                  section.found
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <section.icon className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">{section.name}</p>
                  <p className="text-sm">
                    {section.found ? "✓ Found" : "✗ Missing"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default AnalysisTabs;
