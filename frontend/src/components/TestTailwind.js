import React from 'react';

const TestTailwind = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tailwind Test
        </h1>
        <p className="text-gray-600 mb-6">
          If you see colors, rounded corners, and shadows, Tailwind is working!
        </p>
        <div className="space-y-4">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Test Button
          </button>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-100 p-4 rounded-lg">Box 1</div>
            <div className="bg-green-100 p-4 rounded-lg">Box 2</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;