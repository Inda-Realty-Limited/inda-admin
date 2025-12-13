import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Bell, User, Edit2, Trash2 } from "lucide-react";
import LegalVerification from "../LegalVerification";
import SurveyVerification from "../SurveyVerification";
import SellerVerification from "../SellerVerifcation";
import PropertySummaries from "../summaries";
import InspectionReport from "../OnsiteInspection";

export default function DeeperDiveAdminInput() {
  const router = useRouter();
  const { id: reportId } = router.query;

  const [activeTab, setActiveTab] = useState("Admin Inputs");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [findings, setFindings] = useState<any[]>([]);

  const tabs = ["Admin Inputs", "Legal", "Survey", "Seller", "Inspection", "Summaries"];

  // Fetch report and findings
  useEffect(() => {
    if (!reportId) return;

    const fetchReportAndFindings = async () => {
      try {
        setLoading(true);

        // Fetch report details
        const reportRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/questionnaires/${reportId}`);
        const reportJson = await reportRes.json();
        if (!reportRes.ok) throw new Error(reportJson.message || "Unable to fetch report");
        setReport(reportJson.data);

        // Fetch findings
        const findingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/${reportId}/findings`);
        const findingsJson = await findingsRes.json();
        if (!findingsRes.ok) throw new Error(findingsJson.message || "Unable to fetch findings");
        setFindings(findingsJson.data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportAndFindings();
  }, [reportId]);

  if (loading) return <div className="p-8 text-center">Loading report...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!report) return <div className="p-8 text-center">No report found.</div>;

  const rd = report.reportDetails;

  // Add new finding
  const addFinding = async () => {
    try {
      const newFinding = { text: "", status: "Positive" };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reports/${reportId}/findings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFinding),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create finding");

      setFindings([...findings, data.data]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update a finding
  const updateFindingBackend = async (id: string, text: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/findings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update finding");

      setFindings(findings.map(f => f._id === id ? data.data : f));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete a finding
  const deleteFindingBackend = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/findings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete finding");
      setFindings(findings.filter(f => f._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
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

        {/* Tab Content */}
        {activeTab === "Legal" && <LegalVerification />}
        {activeTab === "Survey" && <SurveyVerification />}
        {activeTab === "Seller" && <SellerVerification />}
        {activeTab === "Inspection" && <InspectionReport />}
        {activeTab === "Summaries" && <PropertySummaries />}

        {/* Admin Inputs Tab */}
        {activeTab === "Admin Inputs" && (
          <>
            {/* Report Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Report Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Report ID" value={rd.reportId} />
                <InfoField label="Report Date" value={new Date(rd.reportDate).toLocaleDateString()} />
                <InfoField label="Client Name" value={rd.clientName} />
                <InfoField label="Analyst" value={rd.analyst} />
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <InfoField label="Property Type" value={rd.propertyType} />
                <InfoField label="Location" value={rd.location} />
                <InfoField label="Land Size" value={rd.landSize || "N/A"} />
                <InfoField label="Year Built" value={rd.yearBuilt || "N/A"} />
              </div>
            </div>

            {/* Key Findings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Key Findings
              </h2>

              <div className="space-y-3">
                {findings.map((finding) => (
                  <div key={finding._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                    <select
                      value={finding.status}
                      onChange={e => {
                        const status = e.target.value;
                        setFindings(findings.map(f => f._id === finding._id ? { ...f, status } : f));
                        updateFindingBackend(finding._id, finding.text, status);
                      }}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-white"
                    >
                      <option>Positive</option>
                      <option>Warning</option>
                      <option>Negative</option>
                    </select>

                    <input
                      type="text"
                      value={finding.text}
                      onChange={e => setFindings(findings.map(f => f._id === finding._id ? { ...f, text: e.target.value } : f))}
                      onBlur={() => updateFindingBackend(finding._id, finding.text, finding.status)}
                      className="flex-1 text-sm text-gray-700 px-2 py-1 border rounded"
                    />

                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded">
                        <Edit2 size={14} /> Edit
                      </button>

                      <button
                        onClick={() => deleteFindingBackend(finding._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addFinding}
                className="mt-4 w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Add Finding
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded text-sm"
      />
    </div>
  );
}
