import React, { useState } from 'react';
import { Bell, User, Edit2, Trash2, Star } from 'lucide-react';

export default function SellerVerification() {
  const [activeTab, setActiveTab] = useState('Seller');
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Marina Heights',
      deliveryDate: '2019',
      duration: '24',
      feedback: 'Delivered on time',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Lekki Gardens Phase 3',
      deliveryDate: '2021',
      duration: '18',
      feedback: 'Delivered early',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Victoria Bay Homes',
      deliveryDate: '2022',
      duration: '36',
      feedback: 'Delivered on time',
      rating: 4.7
    }
  ]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Verification</h1>
          <p className="text-gray-600">Enter and manage property due diligence information</p>
        </div>

        

        {/* Seller Information Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Seller Information</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Years in Business */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Business
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* CAC Registration Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAC Registration Status
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                <option>Verified</option>
                <option>Pending</option>
                <option>Not Verified</option>
              </select>
            </div>

            {/* REDAN Membership */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                REDAN Membership
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          {/* Seller Confidence Score */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seller Confidence Score
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value="83"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex flex-col space-y-1">
                <button className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs">
                  +
                </button>
                <button className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs">
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition">
              <Edit2 size={18} />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Recent Project History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Project History</h2>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-700 pb-2 border-b">
            <div className="col-span-2">Project Title</div>
            <div className="col-span-2">Delivery Date</div>
            <div className="col-span-1"></div>
            <div className="col-span-3">Feedback</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Project Rows */}
          {projects.map((project) => (
            <div key={project.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100">
              <div className="col-span-2">
                <input
                  type="text"
                  value={project.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white">
                  <option>{project.deliveryDate}</option>
                </select>
              </div>
              <div className="col-span-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={project.duration}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    readOnly
                  />
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={project.feedback}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  readOnly
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{project.rating}</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="col-span-2 flex items-center space-x-3">
                <button className="flex items-center space-x-1 text-teal-600 hover:bg-teal-50 px-2 py-1 rounded transition">
                  <Edit2 size={16} />
                  <span className="text-sm">Edit</span>
                </button>
                <button className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition">
                  <Trash2 size={16} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add New Project Button */}
          <button className="mt-6 px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition">
            Add New Project
          </button>
        </div>
      </main>
    </div>
  );
}