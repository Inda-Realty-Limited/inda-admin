import React, { useState } from 'react';
import { Bell, User, Pencil, Trash2, ChevronDown } from 'lucide-react';

const LegalVerification = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Certificate of Occupancy (C of O)",
      status: "Verified",
      details: "Valid until 2054, clean title"
    },
    {
      id: 2,
      name: "Deed of Assignment",
      status: "Verified",
      details: "Properly executed, stamped."
    },
    {
      id: 3,
      name: "Governor's Consent",
      status: "Pending",
      details: "Application submitted, awaiting approval."
    },
    {
      id: 4,
      name: "Zoning Compliance",
      status: "Verified",
      details: "Residential zoning confirmed"
    },
    {
      id: 5,
      name: "Litigation Check",
      status: "Verified",
      details: "No pending cases found"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Verification</h1>
          <p className="text-gray-600">Enter and manage property due diligence information</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Legal Verification Items</h2>
          </div>

          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">Document Name</div>
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
                  <div className="flex items-center justify-end space-x-2">
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
                <div className="flex items-center justify-end space-x-2">
  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-100 rounded transition-colors">
    <Pencil className="w-4 h-4" />
    Edit
  </button>
  <button 
    onClick={() => handleDelete(doc.id)}
    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
  >
    <Trash2 className="w-4 h-4" />
    Delete
  </button>
</div>

                  </div>
               
             
            ))}
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

export default LegalVerification;