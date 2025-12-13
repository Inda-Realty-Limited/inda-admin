// LegalVerificationInline.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Pencil, Trash2, ChevronDown } from "lucide-react";

type Status = "Verified" | "Pending" | "Rejected";

type Doc = {
  localId: string;
  backendId?: string | null;
  name: string;
  status: Status;
  details: string;
  isEditing?: boolean;
};

const statusOptions: Status[] = ["Verified", "Pending", "Rejected"];

export default function LegalVerificationInline() {
  const router = useRouter();
  const { id: reportId } = router.query;

  // Build dynamic API endpoints
  const API_LIST = useMemo(() => {
    if (!reportId) return null;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/legal/reports/${reportId}/legal-documents`;
  }, [reportId]);

  const API_ITEM = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/legal/legal-documents`;

  const initialPreset: Doc[] = [
    {
      localId: "local-1",
      name: "Certificate of Occupancy (C of O)",
      status: "Verified",
      details: "Valid until 2054, clean title",
      backendId: null,
    },
    {
      localId: "local-2",
      name: "Deed of Assignment",
      status: "Verified",
      details: "Properly executed, stamped.",
      backendId: null,
    },
    {
      localId: "local-3",
      name: "Governor's Consent",
      status: "Pending",
      details: "Application submitted, awaiting approval.",
      backendId: null,
    },
    {
      localId: "local-4",
      name: "Zoning Compliance",
      status: "Verified",
      details: "Residential zoning confirmed",
      backendId: null,
    },
    {
      localId: "local-5",
      name: "Litigation Check",
      status: "Verified",
      details: "No pending cases found",
      backendId: null,
    },
  ];

  const [documents, setDocuments] = useState<Doc[]>(initialPreset);
  const [adding, setAdding] = useState(false);
  const [addingDoc, setAddingDoc] = useState<Partial<Doc>>({
    name: "",
    status: "Pending",
    details: "",
  });
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const setLoading = (localId: string, v: boolean) =>
    setLoadingIds((s) => ({ ...s, [localId]: v }));

 
  useEffect(() => {
    if (!API_LIST) return; // Wait for reportId to exist

    const loadDocs = async () => {
      try {
        const res = await fetch(API_LIST);
        const json = await res.json();

        if (!res.ok) return;

        const mapped = json.data.map((b: any) => ({
          localId: `local-${b._id}`,
          backendId: b._id,
          name: b.name,
          status: b.status,
          details: b.details,
          isEditing: false,
        })) as Doc[];

        setDocuments((prev) => [...mapped, ...prev]);
      } catch (err) {
        console.error("Failed to load docs", err);
      }
    };

    loadDocs();
  }, [API_LIST]);

  
  const saveDoc = async (doc: Doc) => {
    if (!API_LIST) return alert("Invalid report ID");

    setLoading(doc.localId, true);
    try {
      if (doc.backendId) {
        // UPDATE
        const res = await fetch(`${API_ITEM}/${doc.backendId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: doc.name,
            status: doc.status,
            details: doc.details,
          }),
        });

        const updated = await res.json();
        if (!res.ok) throw new Error("Failed to update");

        setDocuments((prev) =>
          prev.map((d) =>
            d.localId === doc.localId
              ? {
                  ...d,
                  name: updated.data.name,
                  status: updated.data.status,
                  details: updated.data.details,
                  backendId: updated.data._id,
                  isEditing: false,
                }
              : d
          )
        );
      } else {
        // CREATE NEW
        const res = await fetch(API_LIST, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: doc.name,
            status: doc.status,
            details: doc.details,
          }),
        });

        const created = await res.json();
        if (!res.ok) throw new Error("Failed to create");

        setDocuments((prev) =>
          prev.map((d) =>
            d.localId === doc.localId
              ? { ...d, backendId: created.data._id, isEditing: false }
              : d
          )
        );
      }
    } catch (err) {
      console.error("saveDoc error", err);
      alert("Failed to save.");
    } finally {
      setLoading(doc.localId, false);
    }
  };

  const deleteDoc = async (doc: Doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;

    if (doc.backendId) {
      setLoading(doc.localId, true);
      try {
        const res = await fetch(`${API_ITEM}/${doc.backendId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
      } catch (err) {
        console.error("Delete error", err);
        alert("Failed to delete.");
        setLoading(doc.localId, false);
        return;
      }
    }

    setDocuments((prev) => prev.filter((d) => d.localId !== doc.localId));
  };

  const startEdit = (localId: string) =>
    setDocuments((prev) =>
      prev.map((d) =>
        d.localId === localId ? { ...d, isEditing: true } : d
      )
    );

  const cancelEdit = (localId: string) =>
    setDocuments((prev) =>
      prev.map((d) =>
        d.localId === localId ? { ...d, isEditing: false } : d
      )
    );

  const changeField = (
    localId: string,
    field: keyof Pick<Doc, "name" | "status" | "details">,
    value: any
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.localId === localId ? { ...d, [field]: value } : d
      )
    );
  };

  // -------------------------------------------
  // ADD NEW DOCUMENT
  // -------------------------------------------
  const startAdd = () => setAdding(true);

  const cancelAdd = () => {
    setAdding(false);
    setAddingDoc({ name: "", status: "Pending", details: "" });
  };

  const doAdd = async () => {
    if (!API_LIST) return alert("Invalid report ID");

    const localId = `local-${Date.now()}`;
    const newDoc: Doc = {
      localId,
      name: addingDoc.name || "Untitled Document",
      status: addingDoc.status as Status,
      details: addingDoc.details || "",
      backendId: null,
      isEditing: false,
    };

    setDocuments((prev) => [...prev, newDoc]);
    setLoading(localId, true);

    try {
      const res = await fetch(API_LIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDoc.name,
          status: newDoc.status,
          details: newDoc.details,
        }),
      });

      const created = await res.json();
      if (!res.ok) throw new Error("Failed to create");

      setDocuments((prev) =>
        prev.map((d) =>
          d.localId === localId
            ? { ...d, backendId: created.data._id }
            : d
        )
      );
    } catch (err) {
      console.error("create error", err);
      alert("Failed to create.");
      setDocuments((prev) => prev.filter((d) => d.localId !== localId));
    } finally {
      setLoading(localId, false);
      cancelAdd();
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Legal Verification
          </h1>
          <p className="text-gray-600">
            Edit and manage property due diligence information
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Legal Verification Items
            </h2>
          </div>

          {/* Table header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">Document Name</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-5 text-right">Actions</div>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => {
              const isLoading = !!loadingIds[doc.localId];
              return (
                <div key={doc.localId} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center mb-3">
                    <div className="col-span-4">
                      {doc.isEditing ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={doc.name}
                          onChange={(e) =>
                            changeField(doc.localId, "name", e.target.value)
                          }
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {doc.name}
                        </span>
                      )}
                    </div>

                    <div className="col-span-3">
                      {doc.isEditing ? (
                        <select
                          className="px-3 py-1 rounded border"
                          value={doc.status}
                          onChange={(e) =>
                            changeField(
                              doc.localId,
                              "status",
                              e.target.value as Status
                            )
                          }
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-medium ${
                            doc.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : doc.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {doc.status}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center justify-end space-x-2">
                      {doc.isEditing ? (
                        <>
                          <button
                            disabled={isLoading}
                            onClick={() => saveDoc(doc)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded"
                          >
                            {isLoading ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => cancelEdit(doc.localId)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(doc.localId)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>

                          <button
                            onClick={() => deleteDoc(doc)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-2 pb-3">
                    {doc.isEditing ? (
                      <textarea
                        className="w-full border rounded p-2"
                        value={doc.details}
                        onChange={(e) =>
                          changeField(doc.localId, "details", e.target.value)
                        }
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{doc.details}</p>
                    )}

                    <div className="text-xs text-gray-400 mt-1">
                      {doc.backendId
                        ? "Saved to server"
                        : "Not yet saved to server"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new */}
          <div className="px-6 py-6 border-t border-gray-200">
            {adding ? (
              <div className="grid gap-2">
                <input
                  className="w-full border px-2 py-1 rounded"
                  placeholder="Document name"
                  value={addingDoc.name}
                  onChange={(e) =>
                    setAddingDoc((s) => ({ ...s, name: e.target.value }))
                  }
                />

                <select
                  className="w-full border px-2 py-1 rounded"
                  value={addingDoc.status}
                  onChange={(e) =>
                    setAddingDoc((s) => ({
                      ...s,
                      status: e.target.value as Status,
                    }))
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <textarea
                  className="w-full border px-2 py-1 rounded"
                  placeholder="Details"
                  rows={2}
                  value={addingDoc.details}
                  onChange={(e) =>
                    setAddingDoc((s) => ({ ...s, details: e.target.value }))
                  }
                />

                <div className="flex gap-2">
                  <button
                    onClick={doAdd}
                    className="px-4 py-2 bg-teal-600 text-white rounded"
                  >
                    Add & Save
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startAdd}
                className="w-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
              >
                Add Legal Document
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
