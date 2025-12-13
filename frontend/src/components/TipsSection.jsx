import React from "react";
import { Shield } from "lucide-react";

function TipsSection() {
  const tips = [
    { number: 1, title: "Keyword Strategy", desc: "Use 20-30 industry-specific keywords from job descriptions" },
    { number: 2, title: "Quantifiable Results", desc: 'Include numbers: "Increased revenue by 40%" beats "Increased revenue"' },
    { number: 3, title: "Formatting", desc: "Use standard fonts (Arial, Calibri, Times New Roman), 10-12pt size" },
    { number: 4, title: "File Type", desc: "Always submit as PDF to preserve formatting across all devices" },
    { number: 5, title: "Section Headers", desc: 'Use standard headers: "Work Experience", "Education", "Skills"' },
    { number: 6, title: "Length Control", desc: "Keep to 1-2 pages (500-800 words) for optimal ATS parsing" }
  ];

  return (
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
          {tips.slice(0, 3).map((tip) => (
            <TipItem key={tip.number} tip={tip} />
          ))}
        </div>
        <div className="space-y-4">
          {tips.slice(3, 6).map((tip) => (
            <TipItem key={tip.number} tip={tip} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TipItem({ tip }) {
  return (
    <div className="flex items-start">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
        <span className="text-white font-bold">{tip.number}</span>
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-1">{tip.title}</h4>
        <p className="text-blue-100">{tip.desc}</p>
      </div>
    </div>
  );
}

export default TipsSection;