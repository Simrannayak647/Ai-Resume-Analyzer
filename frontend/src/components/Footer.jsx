import React from "react";
import { FileCheck, CheckCircle, Zap, Shield } from "lucide-react";

function Footer() {
  return (
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
  );
}

export default Footer;