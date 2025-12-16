import React from "react";
import { BarChart3, Hash, Cpu, Users, Zap, Layout } from "lucide-react";

function StatsCard({ stats }) {
  const statItems = [
    { icon: Hash, label: "Word Count", value: stats.wordCount || 0, color: "blue" },
    { icon: Layout, label: "Sections Found", value: `${stats.sectionsFound || 0}/${stats.totalSections || 4}`, color: "indigo" }
  ];

  return (
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
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 bg-gradient-to-r from-${item.color}-50 to-${item.color}-50 rounded-xl`}
          >
            <div className="flex items-center">
              <item.icon className={`w-4 h-4 text-${item.color}-600 mr-3`} />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className={`font-bold text-${item.color}-700`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsCard;