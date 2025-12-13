// utils/helper.js

export const getScoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Improvement";
};

export const getScoreGradient = (score) => {
  if (score >= 80) return "from-green-400 to-green-600";
  if (score >= 60) return "from-yellow-300 to-yellow-500";
  return "from-red-400 to-red-600";
};
