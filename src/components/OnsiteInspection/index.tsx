import React, { useState } from 'react';
import { Edit2, Trash2, Home, Bell, User } from 'lucide-react';

const InspectionReport = () => {
  const [inspections, setInspections] = useState([
    {
      id: 1,
      category: 'Structure',
      status: 'Verified',
      notes: 'Excellent build quality, no visible defects'
    },
    {
      id: 2,
      category: 'Electrical Systems',
      status: 'Verified',
      notes: 'Modern wiring, backup generator installed'
    },
    {
      id: 3,
      category: 'Plumbing',
      status: 'Verified',
      notes: 'High-quality fixtures, good water pressure'
    },
    {
      id: 4,
      category: 'Environment',
      status: 'Verified',
      notes: 'Clean neighborhood, well-maintained roads'
    },
    {
      id: 5,
      category: 'Security',
      status: 'Verified',
      notes: '24/7 security, CCTV coverage'
    },
    {
      id: 6,
      category: 'Amenities',
      status: 'Pending',
      notes: 'Swimming pool under construction'
    }
  ]);

  const [activeTab, setActiveTab] = useState('Inspection');

  

  const statusColors = {
    'Verified': 'bg-green-50 text-green-700 border-green-200',
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">On-Site Inspection Report</h1>
          <p className="text-gray-600 mt-1">Enter and manage property due diligence information</p>
        </div>

       

        {/* Inspection Items */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">On-Site Inspection Report</h2>
          
          {inspections.map((inspection) => (
            <div key={inspection.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200 text-gray-700">
                    {inspection.category}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={inspection.status}
                    onChange={(e) => {
                      const updated = inspections.map(item =>
                        item.id === inspection.id ? { ...item, status: e.target.value } : item
                      );
                      setInspections(updated);
                    }}
                    className={`w-full px-4 py-2 rounded border ${statusColors[inspection.status as keyof typeof statusColors] ?? ''} font-medium appearance-none cursor-pointer`}
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Notes
                </label>
                <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-700 min-h-[60px]">
                  {inspection.notes}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Inspection Item Button */}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors font-medium">
            Add Inspection Item
          </button>
        </div>

        {/* Photo Documentation */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Photo Documentation</h2>
          
          {/* Exterior View */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Exterior View</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-teal-50 border border-teal-200 rounded-lg p-8 flex items-center justify-center hover:bg-teal-100 transition-colors cursor-pointer">
                  <div className="text-center">
                    <User className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <span className="text-sm text-teal-600 font-medium">Click to upload image</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>

          {/* Interior View */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Interior View</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-teal-50 border border-teal-200 rounded-lg p-8 flex items-center justify-center hover:bg-teal-100 transition-colors cursor-pointer">
                  <div className="text-center">
                    <User className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <span className="text-sm text-teal-600 font-medium">Click to upload image</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>

          {/* Electrical Systems */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Electrical Systems</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-teal-50 border border-teal-200 rounded-lg p-8 flex items-center justify-center hover:bg-teal-100 transition-colors cursor-pointer">
                  <div className="text-center">
                    <User className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <span className="text-sm text-teal-600 font-medium">Click to upload image</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>

          {/* Neighborhood */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Neighborhood</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-teal-50 border border-teal-200 rounded-lg p-8 flex items-center justify-center hover:bg-teal-100 transition-colors cursor-pointer">
                  <div className="text-center">
                    <User className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <span className="text-sm text-teal-600 font-medium">Click to upload image</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InspectionReport;