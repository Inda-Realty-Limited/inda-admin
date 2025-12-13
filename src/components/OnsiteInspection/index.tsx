import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Edit2, Trash2, Home, Upload, X, Save, XCircle } from 'lucide-react';

type Status = 'Verified' | 'Pending';

type InspectionItem = {
  localId: string;
  backendId?: string | null;
  category: string;
  status: Status;
  notes: string;
  isEditing?: boolean;
};

type PhotoSection = {
  sectionName: string;
  icon: string;
  images: string[];
};

const InspectionReport: React.FC = () => {
  const router = useRouter();
  const { id: reportId } = router.query;

  // Build dynamic API endpoint
  const API_BASE = useMemo(() => {
    if (!reportId) return null;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inspections/${reportId}`;
  }, [reportId]);

  // State
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [photoSections, setPhotoSections] = useState<PhotoSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingItem, setAddingItem] = useState<Partial<InspectionItem>>({
    category: '',
    status: 'Pending',
    notes: ''
  });

  const setLoadingId = (localId: string, v: boolean) =>
    setLoadingIds((s) => ({ ...s, [localId]: v }));

  const initialPreset: InspectionItem[] = [
    {
      localId: 'local-1',
      category: 'Structure',
      status: 'Verified',
      notes: 'Excellent build quality, no visible defects',
      backendId: null
    },
    {
      localId: 'local-2',
      category: 'Electrical Systems',
      status: 'Verified',
      notes: 'Modern wiring, backup generator installed',
      backendId: null
    },
    {
      localId: 'local-3',
      category: 'Plumbing',
      status: 'Verified',
      notes: 'High-quality fixtures, good water pressure',
      backendId: null
    },
    {
      localId: 'local-4',
      category: 'Environment',
      status: 'Verified',
      notes: 'Clean neighborhood, well-maintained roads',
      backendId: null
    },
    {
      localId: 'local-5',
      category: 'Security',
      status: 'Verified',
      notes: '24/7 security, CCTV coverage',
      backendId: null
    },
    {
      localId: 'local-6',
      category: 'Amenities',
      status: 'Pending',
      notes: 'Swimming pool under construction',
      backendId: null
    }
  ];

  const initialPhotoSections: PhotoSection[] = [
    { sectionName: 'Exterior View', icon: 'home', images: [] },
    { sectionName: 'Interior View', icon: 'home', images: [] },
    { sectionName: 'Electrical Systems', icon: 'lightning', images: [] },
    { sectionName: 'Neighborhood', icon: 'map', images: [] }
  ];

  // Load existing inspection report
  useEffect(() => {
    if (!API_BASE) return; // Wait for reportId to exist

    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_BASE);
        
        if (res.status === 404) {
          // No existing report, use preset
          setInspections(initialPreset);
          setPhotoSections(initialPhotoSections);
        } else if (res.ok) {
          const json = await res.json();
          const data = json.data;

          // Map backend items to local state
          const mapped = (data.inspectionItems || []).map((item: any, idx: number) => ({
            localId: `local-${item._id || idx}`,
            backendId: item._id,
            category: item.category,
            status: item.status,
            notes: item.notes,
            isEditing: false
          }));

          setInspections(mapped.length > 0 ? mapped : initialPreset);
          setPhotoSections(data.photoSections || initialPhotoSections);
        }
      } catch (err) {
        console.error('Failed to load inspection report:', err);
        setInspections(initialPreset);
        setPhotoSections(initialPhotoSections);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [API_BASE]);

  // Save/Update individual item
  const saveItem = async (item: InspectionItem) => {
    if (!API_BASE) return alert('Invalid report ID');

    setLoadingId(item.localId, true);
    try {
      if (item.backendId) {
        // Find the item index in the current array
        const itemIndex = inspections.findIndex(i => i.localId === item.localId);
        
        // UPDATE existing item
        const res = await fetch(`${API_BASE}/item/${itemIndex}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: item.category,
            status: item.status,
            notes: item.notes
          })
        });

        const updated = await res.json();
        if (!res.ok) throw new Error('Failed to update item');

        setInspections((prev) =>
          prev.map((i) =>
            i.localId === item.localId
              ? {
                  ...i,
                  category: updated.data.inspectionItems[itemIndex].category,
                  status: updated.data.inspectionItems[itemIndex].status,
                  notes: updated.data.inspectionItems[itemIndex].notes,
                  isEditing: false
                }
              : i
          )
        );
      } else {
        // CREATE new item (POST entire report with new item)
        const allItems = inspections.map(i => ({
          category: i.category,
          status: i.status,
          notes: i.notes
        }));

        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspectionItems: allItems,
            status: 'Draft'
          })
        });

        const created = await res.json();
        if (!res.ok) throw new Error('Failed to create item');

        // Map response back with backend IDs
        const mapped = (created.data.inspectionItems || []).map((itm: any, idx: number) => {
          const existing = inspections[idx];
          return {
            ...existing,
            backendId: itm._id,
            isEditing: false
          };
        });

        setInspections(mapped);
      }
    } catch (err) {
      console.error('saveItem error:', err);
      alert('Failed to save item');
    } finally {
      setLoadingId(item.localId, false);
    }
  };

  // Delete item
  const deleteItem = async (item: InspectionItem) => {
    if (!confirm(`Delete "${item.category}"?`)) return;
    if (!API_BASE) return alert('Invalid report ID');

    const itemIndex = inspections.findIndex(i => i.localId === item.localId);

    if (item.backendId) {
      setLoadingId(item.localId, true);
      try {
        const res = await fetch(`${API_BASE}/item/${itemIndex}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete item');
        setLoadingId(item.localId, false);
        return;
      }
    }

    setInspections((prev) => prev.filter((i) => i.localId !== item.localId));
  };

  const startEdit = (localId: string) =>
    setInspections((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, isEditing: true } : i))
    );

  const cancelEdit = (localId: string) =>
    setInspections((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, isEditing: false } : i))
    );

  const changeField = (
    localId: string,
    field: keyof Pick<InspectionItem, 'category' | 'status' | 'notes'>,
    value: any
  ) => {
    setInspections((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, [field]: value } : i))
    );
  };

  // Quick status change (without entering edit mode)
  const handleStatusChange = async (localId: string, newStatus: Status) => {
    const item = inspections.find(i => i.localId === localId);
    if (!item) return;

    const updated = { ...item, status: newStatus };
    setInspections((prev) =>
      prev.map((i) => (i.localId === localId ? updated : i))
    );

    await saveItem(updated);
  };

  // Add new item
  const startAdd = () => setAdding(true);

  const cancelAdd = () => {
    setAdding(false);
    setAddingItem({ category: '', status: 'Pending', notes: '' });
  };

  const doAdd = async () => {
    if (!API_BASE) return alert('Invalid report ID');

    const localId = `local-${Date.now()}`;
    const newItem: InspectionItem = {
      localId,
      category: addingItem.category || 'New Category',
      status: addingItem.status as Status,
      notes: addingItem.notes || '',
      backendId: null,
      isEditing: false
    };

    setInspections((prev) => [...prev, newItem]);
    setLoadingId(localId, true);

    try {
      const allItems = [...inspections, newItem].map(i => ({
        category: i.category,
        status: i.status,
        notes: i.notes
      }));

      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionItems: allItems,
          status: 'Draft'
        })
      });

      const created = await res.json();
      if (!res.ok) throw new Error('Failed to create');

      // Map all items with backend IDs
      const mapped = (created.data.inspectionItems || []).map((itm: any, idx: number) => {
        const existing = [...inspections, newItem][idx];
        return {
          ...existing,
          backendId: itm._id
        };
      });

      setInspections(mapped);
    } catch (err) {
      console.error('Add error:', err);
      alert('Failed to add item');
      setInspections((prev) => prev.filter((i) => i.localId !== localId));
    } finally {
      setLoadingId(localId, false);
      cancelAdd();
    }
  };

  // Photo upload
  const handleImageUpload = async (sectionName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingSection(sectionName);
    try {
      const formData = new FormData();
      const fieldName = sectionName.toLowerCase().replace(/\s+/g, '');

      Array.from(files).forEach((file) => {
        formData.append(fieldName, file, file.name);
      });

      const res = await fetch(`${API_BASE}/photos/${fieldName}`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (!res.ok) throw new Error('Failed to upload photos');

      if (result.data?.photoSections) {
        setPhotoSections(result.data.photoSections);
      }
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload images');
    } finally {
      setUploadingSection(null);
      event.target.value = '';
    }
  };

  // Delete photo
  const handleDeleteImage = async (sectionName: string, imageIndex: number) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      const fieldName = sectionName.toLowerCase().replace(/\s+/g, '');
      const res = await fetch(`${API_BASE}/photos/${fieldName}/${imageIndex}`, {
        method: 'DELETE'
      });

      const result = await res.json();
      if (!res.ok) throw new Error('Failed to delete photo');

      if (result.data?.photoSections) {
        setPhotoSections(result.data.photoSections);
      }
    } catch (err) {
      console.error('Delete image error:', err);
      alert('Failed to delete image');
    }
  };

  const statusColors: Record<Status, string> = {
    Verified: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inspection report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">On-Site Inspection Report</h1>
          <p className="text-gray-600">Reportid: {reportId}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Inspection Items</h2>
          </div>

          {/* Table header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">Category</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-5 text-right">Actions</div>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-200">
            {inspections.map((item) => {
              const isLoading = !!loadingIds[item.localId];
              return (
                <div key={item.localId} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center mb-3">
                    <div className="col-span-4">
                      {item.isEditing ? (
                        <input
                          className="w-full border px-3 py-2 rounded focus:border-teal-500 focus:outline-none"
                          value={item.category}
                          onChange={(e) =>
                            changeField(item.localId, 'category', e.target.value)
                          }
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">{item.category}</span>
                      )}
                    </div>

                    <div className="col-span-3">
                      {item.isEditing ? (
                        <select
                          className={`w-full px-3 py-2 rounded border font-medium ${statusColors[item.status]}`}
                          value={item.status}
                          onChange={(e) =>
                            changeField(item.localId, 'status', e.target.value as Status)
                          }
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.localId, e.target.value as Status)}
                          className={`px-3 py-2 rounded border font-medium cursor-pointer ${statusColors[item.status]}`}
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending">Pending</option>
                        </select>
                      )}
                    </div>

                    <div className="col-span-5 flex items-center justify-end space-x-2">
                      {item.isEditing ? (
                        <>
                          <button
                            disabled={isLoading}
                            onClick={() => saveItem(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => cancelEdit(item.localId)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item.localId)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
                    {item.isEditing ? (
                      <textarea
                        className="w-full border rounded px-3 py-2 focus:border-teal-500 focus:outline-none"
                        value={item.notes}
                        onChange={(e) =>
                          changeField(item.localId, 'notes', e.target.value)
                        }
                        rows={3}
                      />
                    ) : (
                      <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200 text-gray-700 min-h-[60px]">
                        {item.notes}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {item.backendId ? 'Saved to server' : 'Not yet saved to server'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add new */}
          <div className="px-6 py-6 border-t border-gray-200">
            {adding ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    className="w-full border px-3 py-2 rounded focus:border-teal-500 focus:outline-none"
                    placeholder="e.g., HVAC System"
                    value={addingItem.category}
                    onChange={(e) =>
                      setAddingItem((s) => ({ ...s, category: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={addingItem.status}
                    onChange={(e) =>
                      setAddingItem((s) => ({ ...s, status: e.target.value as Status }))
                    }
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    className="w-full border px-3 py-2 rounded focus:border-teal-500 focus:outline-none"
                    placeholder="Enter inspection notes"
                    rows={3}
                    value={addingItem.notes}
                    onChange={(e) =>
                      setAddingItem((s) => ({ ...s, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={doAdd}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                  >
                    Add & Save
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startAdd}
                className="w-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                + Add Inspection Item
              </button>
            )}
          </div>
        </div>

        {/* Photo Documentation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Photo Documentation</h2>
          </div>

          <div className="p-6 space-y-8">
            {photoSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">{section.sectionName}</h3>
                    <span className="text-sm text-gray-500">({section.images.length} photos)</span>
                  </div>
                  {uploadingSection === section.sectionName && (
                    <span className="text-sm text-teal-600 font-medium">Uploading...</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section.images.map((imageUrl, imgIdx) => (
                    <div key={imgIdx} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`${section.sectionName} ${imgIdx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => handleDeleteImage(section.sectionName, imgIdx)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <label className="bg-teal-50 border-2 border-dashed border-teal-200 rounded-lg p-8 flex items-center justify-center hover:bg-teal-100 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={(e) => handleImageUpload(section.sectionName, e)}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <span className="text-sm text-teal-600 font-medium">Upload Images</span>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP</p>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InspectionReport;