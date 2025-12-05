import React, { useState } from 'react';
import { Bell, User, Pencil, Trash2, ChevronDown, RefreshCw, XCircle } from 'lucide-react';

const SurveyVerification = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Land Size Verification",
      status: "Verified",
      details: "2,400 sqm confirmed via GPS survey"
    },
    {
      id: 2,
      name: "Boundary Demarcation",
      status: "Verified",
      details: "All corners properly beaconed."
    },
    {
      id: 3,
      name: "Encroachment Risk",
      status: "Pending",
      details: "No encroachments detected."
    },
    {
      id: 4,
      name: "Flood Risk Assessment",
      status: "Verified",
      details: "Low risk zone, good drainage"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleDelete = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey & Land Verification</h1>
          <p className="text-gray-600">Enter and manage property due diligence information</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Survey & Land Verification Items</h2>
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">Item Name</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-5 text-right">Actions</div>
            </div>
          </div>

          {/* Document List */}
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-4">
                {/* Document Row */}
                <div className="grid grid-cols-12 gap-4 items-center mb-3">
                  <div className="col-span-4">
                    <span className="text-gray-900 font-medium">{doc.name}</span>
                  </div>
                  <div className="col-span-3">
                    <button className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="col-span-5 flex items-center justify-end gap-3">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div className="bg-gray-50 rounded px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Details</span>
                      <p className="text-sm text-gray-600 mt-1">{doc.details}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-100 rounded transition-colors">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Property Survey Map Section */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Survey Map</h3>
            
            {/* Map Placeholder */}
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-12 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Property survey map will appear here</p>
              </div>
            </div>

            {/* Map Actions */}
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                Change
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                <XCircle className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>

          {/* Add Document Button */}
          <div className="px-6 py-6 border-t border-gray-200">
            <button className="w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors">
              Add Legal Document
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SurveyVerification;