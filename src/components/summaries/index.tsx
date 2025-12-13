import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Edit2, ChevronDown, Save, XCircle } from 'lucide-react';

type ConfidenceScore = {
  _id?: string;
  title: string;
  score: number;
  description: string;
};

type Verdict = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';

type ReportSummary = {
  verdict: Verdict;
  inspectorNotes: string;
};

const verdictOptions: Verdict[] = ['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'];

export default function PropertySummaries() {
  const router = useRouter();
  const { id: reportId } = router.query;

  // Build dynamic API endpoints
  const API_SCORES = useMemo(() => {
    if (!reportId) return null;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/summary/reports/${reportId}/confidence-scores`;
  }, [reportId]);

  const API_SUMMARY = useMemo(() => {
    if (!reportId) return null;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/summary/reports/${reportId}/summary`;
  }, [reportId]);

  const API_SCORE_ITEM = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/summary/confidence-scores`;

  const initialPresetScores: ConfidenceScore[] = [
    {
      title: 'Legal Verification',
      score: 95,
      description: "All documents verified except pending Governor's Consent"
    },
    {
      title: 'Survey Verification',
      score: 100,
      description: 'GPS survey confirms 100% accuracy of measurements'
    },
    {
      title: 'Seller Verification',
      score: 82,
      description: "All documents verified except pending Governor's Consent"
    },
    {
      title: 'Site Verification',
      score: 85,
      description: 'Excellent condition with minor construction in progress'
    }
  ];

  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScore[]>(initialPresetScores);
  const [summary, setSummary] = useState<ReportSummary>({
    verdict: 'STRONG BUY',
    inspectorNotes: 'Excellent build quality, no visible defects'
  });
  const [loading, setLoading] = useState(true);
  const [savingSummary, setSavingSummary] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editSummaryForm, setEditSummaryForm] = useState<ReportSummary>(summary);
  const [isVerdictOpen, setIsVerdictOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [savingScores, setSavingScores] = useState(false);

  // Load confidence scores and summary
  useEffect(() => {
    if (!API_SCORES || !API_SUMMARY) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Load confidence scores
        const scoresRes = await fetch(API_SCORES);
        if (scoresRes.ok) {
          const scoresJson = await scoresRes.json();
          const loadedScores = scoresJson.data || [];
          
          if (loadedScores.length > 0) {
            setConfidenceScores(loadedScores);
          }
        }

        // Load summary
        const summaryRes = await fetch(API_SUMMARY);
        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          if (summaryJson.data) {
            setSummary({
              verdict: summaryJson.data.verdict,
              inspectorNotes: summaryJson.data.inspectorNotes
            });
            setEditSummaryForm({
              verdict: summaryJson.data.verdict,
              inspectorNotes: summaryJson.data.inspectorNotes
            });
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_SCORES, API_SUMMARY]);

  // Handle score slider change
  const handleScoreChange = (index: number, newScore: number) => {
    setConfidenceScores((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, score: newScore } : item
      )
    );
  };

  // Save all confidence scores
  const saveAllScores = async () => {
    if (!API_SCORES) return alert('Invalid report ID');

    setSavingScores(true);
    try {
      // Save or update each score
      for (const score of confidenceScores) {
        if (score._id) {
          // UPDATE existing score
          await fetch(`${API_SCORE_ITEM}/${score._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: score.title,
              score: score.score,
              description: score.description
            })
          });
        } else {
          // CREATE new score
          const res = await fetch(API_SCORES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: score.title,
              score: score.score,
              description: score.description
            })
          });
          const created = await res.json();
          // Update with backend ID
          score._id = created.data._id;
        }
      }

      alert('All scores saved successfully!');
    } catch (err) {
      console.error('saveAllScores error:', err);
      alert('Failed to save scores');
    } finally {
      setSavingScores(false);
    }
  };

  // Save summary
  const saveSummary = async () => {
    if (!API_SUMMARY) return alert('Invalid report ID');

    setSavingSummary(true);
    try {
      const res = await fetch(API_SUMMARY, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: editSummaryForm.verdict,
          inspectorNotes: editSummaryForm.inspectorNotes
        })
      });

      const updated = await res.json();
      if (!res.ok) throw new Error('Failed to save summary');

      setSummary({
        verdict: updated.data.verdict,
        inspectorNotes: updated.data.inspectorNotes
      });
      setEditingSummary(false);
      alert('Summary saved successfully!');
    } catch (err) {
      console.error('saveSummary error:', err);
      alert('Failed to save summary');
    } finally {
      setSavingSummary(false);
    }
  };

  const startEditSummary = () => {
    setEditSummaryForm({ ...summary });
    setEditingSummary(true);
  };

  const cancelEditSummary = () => {
    setEditSummaryForm({ ...summary });
    setEditingSummary(false);
    setIsVerdictOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Summaries</h1>
          <p className="text-gray-600">Property ID: {reportId || 'Loading...'}</p>
        </div>

        {/* Confidence Scores */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Confidence Scores</h2>
            <button
              onClick={saveAllScores}
              disabled={savingScores}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4" />
              {savingScores ? 'Saving...' : 'Save All Scores'}
            </button>
          </div>

          <div className="space-y-8">
            {confidenceScores.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className="text-lg font-semibold text-gray-900">{item.score}%</span>
                </div>

                {/* Interactive Progress Bar / Slider */}
                <div className="relative h-8 mb-2 cursor-pointer">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full" />
                  </div>
                  
                  {/* Progress fill */}
                  <div
                    className="absolute inset-0 flex items-center pointer-events-none"
                  >
                    <div
                      className="h-2 bg-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  {/* Draggable slider handle */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.score}
                    onChange={(e) => handleScoreChange(index, Number(e.target.value))}
                    onMouseDown={() => setDraggingIndex(index)}
                    onMouseUp={() => setDraggingIndex(null)}
                    onTouchStart={() => setDraggingIndex(index)}
                    onTouchEnd={() => setDraggingIndex(null)}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    style={{ zIndex: 10 }}
                  />
                  
                  {/* Visual slider knob */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-900 rounded-full shadow-md transition-all duration-300 pointer-events-none"
                    style={{ 
                      left: `calc(${item.score}% - 10px)`,
                      transform: draggingIndex === index ? 'translateY(-50%) scale(1.2)' : 'translateY(-50%)'
                    }}
                  />
                </div>

                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Verdict</h2>

          {editingSummary ? (
            <>
              {/* Verdict Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verdict
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsVerdictOpen(!isVerdictOpen)}
                    className="w-full bg-gray-100 px-4 py-3 rounded-lg flex justify-between items-center hover:bg-gray-200 transition"
                  >
                    <span className="font-medium text-gray-900">{editSummaryForm.verdict}</span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${
                        isVerdictOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isVerdictOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {verdictOptions.map((option) => (
                        <button
                          key={option}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => {
                            setEditSummaryForm((s) => ({ ...s, verdict: option }));
                            setIsVerdictOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Inspector Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Notes
                </label>
                <textarea
                  value={editSummaryForm.inspectorNotes}
                  onChange={(e) => setEditSummaryForm((s) => ({ ...s, inspectorNotes: e.target.value }))}
                  rows={3}
                  className="w-full border px-4 py-3 rounded-lg focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelEditSummary}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <XCircle size={18} />
                  <span className="font-medium">Cancel</span>
                </button>
                <button
                  disabled={savingSummary}
                  onClick={saveSummary}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-teal-600 rounded hover:bg-teal-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span className="font-medium">{savingSummary ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verdict Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verdict
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <p className="font-medium text-gray-900">{summary.verdict}</p>
                </div>
              </div>

              {/* Inspector Notes Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Notes
                </label>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <p className="text-gray-900">{summary.inspectorNotes}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={startEditSummary}
                  className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded transition"
                >
                  <Edit2 size={18} />
                  <span className="font-medium">Edit</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}