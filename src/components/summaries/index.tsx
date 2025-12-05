import React, { useState } from 'react';
import { Bell, User, Edit2, Trash2, ChevronDown } from 'lucide-react';

export default function PropertySummaries() {
  const [activeTab, setActiveTab] = useState('Summaries');
  const [isVerdictOpen, setIsVerdictOpen] = useState(false);

  const confidenceScores = [
    {
      title: 'Legal Verification',
      score: 95,
      description: 'All documents verified except pending Governor\'s Consent'
    },
    {
      title: 'Survey Verification',
      score: 100,
      description: 'GPS survey confirms 100% accuracy of measurements'
    },
    {
      title: 'Seller Verification',
      score: 82,
      description: 'All documents verified except pending Governor\'s Consent'
    },
    {
      title: 'Site Verification',
      score: 85,
      description: 'Excellent condition with minor construction in progress'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Summaries</h1>
          <p className="text-gray-600">Enter and manage property due diligence information</p>
        </div>

        

        {/* Confidence Scores */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Confidence Scores</h2>
          
          <div className="space-y-8">
            {confidenceScores.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className="text-lg font-semibold text-gray-900">{item.score}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-900 rounded-full shadow-md transition-all duration-500"
                    style={{ left: `calc(${item.score}% - 8px)` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Verdict</h2>
          
          {/* Verdict Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verdict
            </label>
            <button
              onClick={() => setIsVerdictOpen(!isVerdictOpen)}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg flex justify-between items-center hover:bg-gray-200 transition"
            >
              <span className="font-medium text-gray-900">STRONG BUY</span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  isVerdictOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isVerdictOpen && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                {['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'].map((option) => (
                  <button
                    key={option}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setIsVerdictOpen(false)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inspector Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspector Notes
            </label>
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <p className="text-gray-900">Excellent build quality, no visible defects</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 transition">
              <Edit2 size={18} />
              <span className="font-medium">Edit</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 transition">
              <Trash2 size={18} />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}