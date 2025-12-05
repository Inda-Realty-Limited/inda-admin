import React, { useState } from "react";
import LegalVerification from "../LegalVerification";
import SurveyVerification from "../SurveyVerification";
import SellerVerification from "../SellerVerifcation";
import PropertySummaries from "../summaries";
import { Bell, User, Edit2, Trash2 } from "lucide-react";
import InspectionReport from "../OnsiteInspection";

export default function DeeperDiveAdminInput() {
  const [activeTab, setActiveTab] = useState("Admin Inputs");

  const [findings, setFindings] = useState([
    { id: 1, status: "Positive", text: "Perfect legal documentation (95% complete)" },
    { id: 2, status: "Positive", text: "Survey 100% accurate via GPS verification" },
    { id: 3, status: "Positive", text: "Seller has excellent track record" },
    { id: 4, status: "Positive", text: "Site inspection confirms premium quality" },
    { id: 5, status: "Warning", text: "Pool construction in progress" },
    { id: 6, status: "Positive", text: "Site 8% below Fair Market Value" },
  ]);

  const tabs = ["Admin Inputs", "Legal", "Survey", "Seller", "Inspection", "Summaries"];

  const deleteFinding = (id: number) => {
    setFindings(findings.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a2332] text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-teal-400"></div>
          <span className="text-xl font-semibold">inda</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 hover:text-teal-400 transition">
            <Bell size={20} />
            <span className="text-sm">Notifications</span>
          </button>
          <button className="flex items-center gap-2 hover:text-teal-400 transition">
            <User size={20} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Deeper Dive Report - Admin Input
          </h1>
          <p className="text-gray-600 text-sm">
            Enter and manage property due diligence information
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition relative ${
                activeTab === tab
                  ? "text-gray-900 border-b-2 border-teal-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}

        {/* ✅ LEGAL */}
        {activeTab === "Legal" && <LegalVerification />}

        {/* ✅ SURVEY */}
        {activeTab === "Survey" && <SurveyVerification />}

        {/* ✅ SELLER */}
        {activeTab === "Seller" && <SellerVerification />}
        {activeTab === "Inspection" && <InspectionReport />}
        {activeTab === "Summaries" && <PropertySummaries />}

        {/* ✅ ADMIN INPUTS */}
        {activeTab === "Admin Inputs" && (
          <>
            {/* Report Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Report Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report ID
                  </label>
                  <input
                    type="text"
                    value="IND-2024-0847"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Date
                  </label>
                  <input
                    type="text"
                    value="08/10/25"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value="Adebayo Investment Ltd"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analyst
                  </label>
                  <input
                    type="text"
                    value="Joshua Onoh"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Property Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <input
                    type="text"
                    value="4-Bedroom Duplex"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value="Lekki Phase 1, Lagos"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Land Size
                  </label>
                  <input
                    type="text"
                    value="2,400 sqm"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Built
                  </label>
                  <input
                    type="text"
                    value="2019"
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Key Findings
              </h2>

              <div className="space-y-3">
                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <select
                      value={finding.status}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-white"
                    >
                      <option>Positive</option>
                      <option>Warning</option>
                      <option>Negative</option>
                    </select>

                    <span className="flex-1 text-sm text-gray-700">
                      {finding.text}
                    </span>

                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded">
                        <Edit2 size={14} /> Edit
                      </button>

                      <button
                        onClick={() => deleteFinding(finding.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                Add Finding
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
