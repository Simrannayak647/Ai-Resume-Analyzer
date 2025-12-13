import React from "react";
import { Upload, FileText, CheckCircle, Loader, TrendingUp, AlertCircle } from "lucide-react";
import { Clock } from "lucide-react";  // Add this line
function UploadSection({
  file,
  jobTitle,
  setJobTitle,
  industry,
  setIndustry,
  industries,
  loading,
  error,
  uploadProgress,
  onFileChange,
  onSubmit,
  onRetry,
  onDragOver,
  onDrop,
  fileInputRef,
  analysisTime
}) {
  return (
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
        {file && (
          <button
            onClick={onRetry}
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
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <input
            type="file"
            id="resume-upload"
            ref={fileInputRef}
            onChange={onFileChange}
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
          onClick={onSubmit}
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
  );
}

export default UploadSection;