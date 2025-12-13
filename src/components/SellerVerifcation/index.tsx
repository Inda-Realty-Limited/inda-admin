import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Save, Trash2, Plus, Edit2, X, Star } from 'lucide-react';

interface Project {
  localId: string;
  backendId?: string | null;
  title: string;
  deliveryDate: string;
  duration: string;
  feedback: string;
  rating: number;
  status: string;
  isEditing?: boolean;
}

interface Seller {
  localId: string;
  backendId?: string | null;
  companyName: string;
  yearsInBusiness: string;
  cacStatus: string;
  redanMembership: string;
  confidenceScore: number;
}

export default function SellerVerification() {
  const router = useRouter();
  const { id: reportId } = router.query;

  // Build dynamic API endpoints matching your backend structure
  const API_ENDPOINTS = useMemo(() => {
    if (!reportId) return null;
    return {
      // Seller endpoints
      SELLERS_LIST: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sellers/report/${reportId}/sellers`,
      SELLER_BY_ID: (id: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sellers/report/${reportId}/sellers/${id}`,
      // Project endpoints
      PROJECTS_LIST: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/reports/${reportId}/projects`,
      PROJECT_BY_ID: (id: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projects/projects/${id}`,
    };
  }, [reportId]);

  const [sellerInfo, setSellerInfo] = useState<Seller>({
    localId: 'local-seller-new',
    backendId: null,
    companyName: '',
    yearsInBusiness: '',
    cacStatus: 'Verified',
    redanMembership: 'Active',
    confidenceScore: 83
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  // Load seller and projects data when reportId is available
  useEffect(() => {
    if (!reportId || !API_ENDPOINTS) return;
    loadInitialData();
  }, [reportId, API_ENDPOINTS]);

  const loadInitialData = async () => {
    if (!API_ENDPOINTS) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Load sellers - they might not exist yet
      try {
        const sellersRes = await fetch(API_ENDPOINTS.SELLERS_LIST);
        if (sellersRes.ok) {
          const sellersJson = await sellersRes.json();
          
          if (sellersJson.data && sellersJson.data.length > 0) {
            const firstSeller = sellersJson.data[0];
            setSellerInfo({
              localId: `local-${firstSeller._id}`,
              backendId: firstSeller._id,
              companyName: firstSeller.companyName || '',
              yearsInBusiness: firstSeller.yearsInBusiness || '',
              cacStatus: firstSeller.cacStatus || 'Verified',
              redanMembership: firstSeller.redanMembership || 'Active',
              confidenceScore: firstSeller.confidenceScore ?? 83
            });
          }
          // If no sellers exist, keep the default empty state
        }
      } catch (err) {
        console.error('Error loading sellers:', err);
        // Keep default empty seller state
      }

      // Load projects - they might not exist yet
      try {
        const projectsRes = await fetch(API_ENDPOINTS.PROJECTS_LIST);
        if (projectsRes.ok) {
          const projectsJson = await projectsRes.json();
          
          if (projectsJson.success && projectsJson.data && projectsJson.data.length > 0) {
            const mappedProjects = projectsJson.data.map((p: any) => ({
              localId: `local-${p._id}`,
              backendId: p._id,
              title: p.title || '',
              deliveryDate: p.deliveryDate || '',
              duration: p.duration || '',
              feedback: p.feedback || '',
              rating: p.rating ?? 0,
              status: p.status || 'Pending',
              isEditing: false
            }));
            setProjects(mappedProjects);
          }
          // If no projects exist, keep empty array
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        // Keep empty projects array
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSeller = async () => {
    if (!API_ENDPOINTS) {
      alert('Invalid report ID');
      return;
    }

    // Validate required fields
    if (!sellerInfo.companyName.trim() || !sellerInfo.yearsInBusiness.trim()) {
      alert('Company name and years in business are required');
      return;
    }

    setLoading(true);
    try {
      if (sellerInfo.backendId) {
        // UPDATE existing seller
        const response = await fetch(API_ENDPOINTS.SELLER_BY_ID(sellerInfo.backendId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: sellerInfo.companyName,
            yearsInBusiness: sellerInfo.yearsInBusiness,
            cacStatus: sellerInfo.cacStatus,
            redanMembership: sellerInfo.redanMembership,
            confidenceScore: sellerInfo.confidenceScore
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update seller');
        }

        const updated = await response.json();
        
        setSellerInfo(prev => ({
          ...prev,
          backendId: updated.data._id
        }));
        
        alert('Seller information updated successfully!');
      } else {
        // CREATE new seller
        const response = await fetch(API_ENDPOINTS.SELLERS_LIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: sellerInfo.companyName,
            yearsInBusiness: sellerInfo.yearsInBusiness,
            cacStatus: sellerInfo.cacStatus,
            redanMembership: sellerInfo.redanMembership,
            confidenceScore: sellerInfo.confidenceScore
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create seller');
        }

        const created = await response.json();
        
        setSellerInfo(prev => ({
          ...prev,
          localId: `local-${created.data._id}`,
          backendId: created.data._id
        }));
        
        alert('Seller information created successfully!');
      }
    } catch (error: any) {
      console.error('Error saving seller:', error);
      alert(error.message || 'Failed to save seller information');
    } finally {
      setLoading(false);
    }
  };

  const deleteSeller = async () => {
    if (!sellerInfo.backendId) {
      alert('No seller to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete this seller?')) return;

    if (!API_ENDPOINTS) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SELLER_BY_ID(sellerInfo.backendId), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete seller');
      }
      
      setSellerInfo({
        localId: 'local-seller-new',
        backendId: null,
        companyName: '',
        yearsInBusiness: '',
        cacStatus: 'Verified',
        redanMembership: 'Active',
        confidenceScore: 83
      });
      
      alert('Seller deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting seller:', error);
      alert(error.message || 'Failed to delete seller');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project: Project) => {
    setEditingProject({ ...project });
  };

  const cancelEdit = () => {
    // Revert changes if editing an existing project
    if (editingProject?.backendId) {
      const originalProject = projects.find(p => p.localId === editingProject.localId);
      if (originalProject) {
        setProjects(prev =>
          prev.map(p => p.localId === editingProject.localId ? originalProject : p)
        );
      }
    } else {
      // Remove new unsaved project
      setProjects(prev => prev.filter(p => p.localId !== editingProject?.localId));
    }
    setEditingProject(null);
  };

  const saveProject = async (project: Project) => {
    if (!API_ENDPOINTS) {
      alert('Invalid report ID');
      return;
    }

    // Validate required fields
    if (!project.title.trim() || !project.deliveryDate.trim()) {
      alert('Project title and delivery date are required');
      return;
    }

    setSavingIds(prev => new Set(prev).add(project.localId));
    try {
      const isNew = !project.backendId;
      
      if (isNew) {
        // CREATE new project
        const response = await fetch(API_ENDPOINTS.PROJECTS_LIST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: project.title,
            deliveryDate: project.deliveryDate,
            duration: project.duration,
            feedback: project.feedback,
            rating: project.rating,
            status: project.status
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create project');
        }

        const created = await response.json();
        
        setProjects(prev =>
          prev.map(p => p.localId === project.localId ? {
            ...p,
            localId: `local-${created.data._id}`,
            backendId: created.data._id,
            isEditing: false
          } : p)
        );
      } else {
        // UPDATE existing project
        const response = await fetch(API_ENDPOINTS.PROJECT_BY_ID(project.backendId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: project.title,
            deliveryDate: project.deliveryDate,
            duration: project.duration,
            feedback: project.feedback,
            rating: project.rating,
            status: project.status
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update project');
        }

        const updated = await response.json();
        
        setProjects(prev =>
          prev.map(p => p.localId === project.localId ? {
            ...p,
            title: updated.data.title,
            deliveryDate: updated.data.deliveryDate,
            duration: updated.data.duration,
            feedback: updated.data.feedback,
            rating: updated.data.rating,
            status: updated.data.status,
            backendId: updated.data._id,
            isEditing: false
          } : p)
        );
      }

      setEditingProject(null);
    } catch (error: any) {
      console.error('Error saving project:', error);
      alert(error.message || 'Failed to save project');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.localId);
        return newSet;
      });
    }
  };

  const deleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

    if (!API_ENDPOINTS) return;

    setSavingIds(prev => new Set(prev).add(project.localId));
    try {
      if (project.backendId) {
        const response = await fetch(API_ENDPOINTS.PROJECT_BY_ID(project.backendId), {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete project');
        }
      }
      
      setProjects(prev => prev.filter(p => p.localId !== project.localId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project');
    } finally {
      setSavingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(project.localId);
        return newSet;
      });
    }
  };

  const addNewProject = () => {
    const newProject: Project = {
      localId: `temp-${Date.now()}`,
      backendId: null,
      title: '',
      deliveryDate: new Date().getFullYear().toString(),
      duration: '',
      feedback: '',
      rating: 0,
      status: 'Pending',
      isEditing: true
    };
    setProjects(prev => [...prev, newProject]);
    setEditingProject(newProject);
  };

  const updateEditingProject = (field: keyof Project, value: any) => {
    setEditingProject(prev => prev ? { ...prev, [field]: value } : prev);
    setProjects(prev =>
      prev.map(p => p.localId === editingProject?.localId ? { ...p, [field]: value } : p)
    );
  };

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Report ID</h2>
          <p className="text-gray-600">Please provide a valid report ID in the URL</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller and project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
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
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellerInfo.companyName}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter company name"
              />
            </div>

            {/* Years in Business */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years in Business <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sellerInfo.yearsInBusiness}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter years in business"
              />
            </div>

            {/* CAC Registration Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CAC Registration Status
              </label>
              <select 
                value={sellerInfo.cacStatus}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, cacStatus: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              >
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
              <select 
                value={sellerInfo.redanMembership}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, redanMembership: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              >
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
                value={sellerInfo.confidenceScore}
                onChange={(e) => setSellerInfo(prev => ({ ...prev, confidenceScore: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                max="100"
              />
              <div className="flex flex-col space-y-1">
                <button 
                  onClick={() => setSellerInfo(prev => ({ ...prev, confidenceScore: Math.min(100, prev.confidenceScore + 1) }))}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs"
                >
                  +
                </button>
                <button 
                  onClick={() => setSellerInfo(prev => ({ ...prev, confidenceScore: Math.max(0, prev.confidenceScore - 1) }))}
                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mb-6">
            <p className="text-xs text-gray-500">
              {sellerInfo.backendId ? '✓ Saved to server' : '⚠ Not yet saved to server'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button 
              onClick={saveSeller}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition disabled:opacity-50"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : sellerInfo.backendId ? 'Update Seller' : 'Create Seller'}</span>
            </button>
            {sellerInfo.backendId && (
              <button 
                onClick={deleteSeller}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Project History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Project History</h2>
          
          {projects.length > 0 && (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-700 pb-2 border-b">
                <div className="col-span-2">Project Title</div>
                <div className="col-span-2">Delivery Date</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-3">Feedback</div>
                <div className="col-span-2">Rating</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Project Rows */}
              {projects.map((project) => {
                const isEditing = editingProject?.localId === project.localId;
                const isSaving = savingIds.has(project.localId);
                const currentProject = isEditing ? editingProject : project;

                return (
                  <div key={project.localId} className="border-b border-gray-100 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={currentProject.title}
                          onChange={(e) => isEditing && updateEditingProject('title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          readOnly={!isEditing}
                          placeholder="Project title *"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={currentProject.deliveryDate}
                          onChange={(e) => isEditing && updateEditingProject('deliveryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          readOnly={!isEditing}
                          placeholder="YYYY *"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={currentProject.duration}
                          onChange={(e) => isEditing && updateEditingProject('duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          readOnly={!isEditing}
                          placeholder="Months"
                        />
                      </div>
                      <div className="col-span-3">
                        <textarea
                          value={currentProject.feedback}
                          onChange={(e) => isEditing && updateEditingProject('feedback', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          rows={1}
                          readOnly={!isEditing}
                          placeholder="Project feedback"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            {isEditing ? (
                              <input
                                type="number"
                                value={currentProject.rating}
                                onChange={(e) => updateEditingProject('rating', parseFloat(e.target.value) || 0)}
                                className="w-12 text-sm font-medium border-none focus:outline-none"
                                step="0.1"
                                min="0"
                                max="5"
                              />
                            ) : (
                              <span className="text-sm font-medium">{currentProject.rating}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center space-x-3">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveProject(currentProject)}
                              disabled={isSaving}
                              className="flex items-center space-x-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded transition disabled:opacity-50"
                            >
                              <Save size={16} />
                              <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="flex items-center space-x-1 text-gray-600 hover:bg-gray-50 px-2 py-1 rounded transition disabled:opacity-50"
                            >
                              <X size={16} />
                              <span className="text-sm">Cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(project)}
                              disabled={isSaving}
                              className="flex items-center space-x-1 text-teal-600 hover:bg-teal-50 px-2 py-1 rounded transition disabled:opacity-50"
                            >
                              <Edit2 size={16} />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => deleteProject(project)}
                              disabled={isSaving}
                              className="flex items-center space-x-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded transition disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              <span className="text-sm">{isSaving ? 'Deleting...' : 'Delete'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-span-12 text-xs text-gray-400 mt-2">
                      {project.backendId ? '✓ Saved to server' : '⚠ Not yet saved'}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="mb-2">No projects yet</p>
              <p className="text-sm">Click &quot;Add New Project&quot; below to get started</p>

            </div>
          )}

          {/* Add New Project Button */}
          <button 
            onClick={addNewProject}
            disabled={editingProject !== null}
            className="mt-6 flex items-center space-x-2 px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition disabled:opacity-50"
          >
            <Plus size={18} />
            <span>Add New Project</span>
          </button>
        </div>
      </main>
    </div>
  );
}