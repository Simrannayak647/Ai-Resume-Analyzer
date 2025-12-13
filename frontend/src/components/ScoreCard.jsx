import React from "react";
import { Target } from "lucide-react";

function ScoreCard({ atsScore, getScoreColor, getScoreLabel, getScoreGradient }) {
  const ScoreBreakdown = ({ range, label, color, currentScore }) => {
    const isActive = currentScore >= range[0] && currentScore <= range[1];
    return (
      <div
        className={`text-center p-3 rounded-xl transition-all duration-300 ${
          isActive
            ? `bg-${color}-50 border-2 border-${color}-200`
            : "bg-gray-50"
        }`}
      >
        <div className="text-xs font-medium text-gray-500">{label}</div>
        <div className={`text-lg font-bold text-${color}-600`}>
          {range[0]}-{range[1]}
        </div>
      </div>
    );
  };

  if (atsScore === null) return null;

  return (
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
        <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getScoreGradient(atsScore)} text-white`}>
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
                <div className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getScoreGradient(atsScore)} text-white`}>
                  {atsScore >= 85 ? "🏆 Excellent" : atsScore >= 70 ? "👍 Good" : atsScore >= 60 ? "⚠️ Fair" : "📝 Needs Work"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          <ScoreBreakdown range={[0, 59]} label="Poor" color="red" currentScore={atsScore} />
          <ScoreBreakdown range={[60, 69]} label="Fair" color="yellow" currentScore={atsScore} />
          <ScoreBreakdown range={[70, 84]} label="Good" color="blue" currentScore={atsScore} />
          <ScoreBreakdown range={[85, 100]} label="Excellent" color="green" currentScore={atsScore} />
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;