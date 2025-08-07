import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Resource, 
  CreateResource, 
  UpdateResource, 
  BatchUpdateResources,
  ResourceType,
  ResourceFilters,
  calculateMargin,
  isUnderwater
} from '../../types/Resource.types';
import { LCAT } from '../../types/LCAT.types';
import { resourceService } from '../../services/resourceService';
import { lcatService } from '../../services/lcatService';
import { formatDate } from '../../utils/dateHelpers';

const ResourceManagement: React.FC = () => {
  // State for resources and LCATs
  const [resources, setResources] = useState<Resource[]>([]);
  const [lcats, setLCATs] = useState<LCAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for adding new resource
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState<CreateResource>({
    firstName: '',
    lastName: '',
    email: '',
    resourceType: ResourceType.W2Internal,
    lcatId: '',
    hourlyRate: 0,
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // State for inline editing
  const [editedResources, setEditedResources] = useState<Map<string, UpdateResource>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for filtering
  const [filters, setFilters] = useState<ResourceFilters>({
    searchTerm: '',
    isActive: true
  });

  // Load data on component mount and when filters change
  useEffect(() => {
    const loadDataEffect = async () => {
      try {
        setLoading(true);
        const [resourceData, lcatData] = await Promise.all([
          resourceService.getAll(filters),
          lcatService.getAll()
        ]);
        setResources(resourceData);
        setLCATs(lcatData);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDataEffect();
  }, [filters]); // Only re-run when filters change

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourceData, lcatData] = await Promise.all([
        resourceService.getAll(filters),
        lcatService.getAll()
      ]);
      setResources(resourceData);
      setLCATs(lcatData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle inline editing
  const handleResourceEdit = useCallback((
    resourceId: string, 
    field: keyof UpdateResource, 
    value: any
  ) => {
    const updates = new Map(editedResources);
    const existing = updates.get(resourceId) || { id: resourceId };
    
    (existing as any)[field] = value;
    updates.set(resourceId, existing);
    setEditedResources(updates);
    setHasUnsavedChanges(true);
  }, [editedResources]);

  // Save all edited resources
  const handleSaveAllChanges = async () => {
    if (editedResources.size === 0) return;

    const batchUpdate: BatchUpdateResources = {
      effectiveDate: new Date().toISOString(),
      notes: 'Batch resource update',
      resourceUpdates: Array.from(editedResources.values())
    };

    try {
      await resourceService.batchUpdate(batchUpdate);
      await loadData();
      setEditedResources(new Map());
      setHasUnsavedChanges(false);
      alert('Resources updated successfully');
    } catch (err) {
      setError('Failed to update resources');
      console.error(err);
    }
  };

  // Cancel all edits
  const handleCancelEdits = () => {
    setEditedResources(new Map());
    setHasUnsavedChanges(false);
  };

  // Create new resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newResource.lcatId || newResource.lcatId === '') {
      setError('Please select an LCAT');
      return;
    }
    
    if (!newResource.firstName || !newResource.lastName || !newResource.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (newResource.hourlyRate <= 0) {
      setError('Please enter a valid hourly rate');
      return;
    }
    
    try {
      // Ensure the date is in ISO format for the API
      const resourceToCreate = {
        ...newResource,
        startDate: new Date(newResource.startDate).toISOString()
      };
      
      console.log('Submitting resource:', resourceToCreate);
      console.log('Available LCATs:', lcats.map(l => ({ id: l.id, name: l.name })));
      
      await resourceService.create(resourceToCreate);
      await loadData();
      setShowAddForm(false);
      setNewResource({
        firstName: '',
        lastName: '',
        email: '',
        resourceType: ResourceType.W2Internal,
        lcatId: '',
        hourlyRate: 0,
        startDate: new Date().toISOString().split('T')[0]
      });
      setError(null); // Clear any errors
      alert('Resource created successfully!');
    } catch (err: any) {
      console.error('Error creating resource:', err);
      setError(err.response?.data || 'Failed to create resource');
    }
  };

  // Helper functions for display
  const getDisplayValue = (resource: Resource, field: keyof UpdateResource) => {
    const edited = editedResources.get(resource.id);
    if (edited && edited[field] !== undefined) {
      return edited[field];
    }
    return (resource as any)[field];
  };

  const getCellClass = (resourceId: string, field: keyof UpdateResource) => {
    const edited = editedResources.get(resourceId);
    return edited && edited[field] !== undefined ? 'bg-yellow-100' : '';
  };

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          resource.firstName.toLowerCase().includes(searchLower) ||
          resource.lastName.toLowerCase().includes(searchLower) ||
          resource.email.toLowerCase().includes(searchLower) ||
          (resource.lcatName && resource.lcatName.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      if (filters.resourceType && resource.resourceType !== filters.resourceType) {
        return false;
      }
      
      if (filters.lcatId && resource.lcatId !== filters.lcatId) {
        return false;
      }
      
      if (filters.isActive !== undefined && resource.isActive !== filters.isActive) {
        return false;
      }
      
      return true;
    });
  }, [resources, filters]);

  if (loading) {
    return <div className="p-4">Loading resources...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Resource Management</h1>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search resources..."
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={filters.resourceType || ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              resourceType: e.target.value as ResourceType || undefined 
            })}
            className="p-2 border rounded"
          >
            <option value="">All Types</option>
            {Object.values(ResourceType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filters.lcatId || ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              lcatId: e.target.value || undefined 
            })}
            className="p-2 border rounded"
          >
            <option value="">All LCATs</option>
            {lcats.map(lcat => (
              <option key={lcat.id} value={lcat.id}>{lcat.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.isActive !== false}
              onChange={(e) => setFilters({ 
                ...filters, 
                isActive: e.target.checked ? true : undefined 
              })}
            />
            Active Only
          </label>
        </div>

        {/* Action buttons */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showAddForm ? 'Cancel' : 'Add Resource'}
          </button>
          {hasUnsavedChanges && (
            <>
              <button
                onClick={handleSaveAllChanges}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save All Changes
              </button>
              <button
                onClick={handleCancelEdits}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel Changes
              </button>
              <span className="flex items-center text-yellow-600 ml-2">
                ⚠️ You have unsaved changes
              </span>
            </>
          )}
        </div>

        {/* Add Resource Form */}
        {showAddForm && (
          <form onSubmit={handleCreateResource} className="mb-4 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Add New Resource</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">First Name*</label>
                <input
                  type="text"
                  value={newResource.firstName}
                  onChange={(e) => setNewResource({ ...newResource, firstName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Last Name*</label>
                <input
                  type="text"
                  value={newResource.lastName}
                  onChange={(e) => setNewResource({ ...newResource, lastName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Email*</label>
                <input
                  type="email"
                  value={newResource.email}
                  onChange={(e) => setNewResource({ ...newResource, email: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Resource Type*</label>
                <select
                  value={newResource.resourceType}
                  onChange={(e) => setNewResource({ 
                    ...newResource, 
                    resourceType: e.target.value as ResourceType 
                  })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {Object.values(ResourceType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">LCAT*</label>
                <select
                  value={newResource.lcatId}
                  onChange={(e) => setNewResource({ ...newResource, lcatId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select LCAT...</option>
                  {lcats.map(lcat => (
                    <option key={lcat.id} value={lcat.id}>{lcat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Hourly Rate*</label>
                <input
                  type="number"
                  step="0.01"
                  value={newResource.hourlyRate}
                  onChange={(e) => setNewResource({ 
                    ...newResource, 
                    hourlyRate: parseFloat(e.target.value) 
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Start Date*</label>
                <input
                  type="date"
                  value={newResource.startDate}
                  onChange={(e) => setNewResource({ ...newResource, startDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {newResource.resourceType === ResourceType.FixedPrice && (
                <>
                  <div>
                    <label className="block mb-2">Fixed Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newResource.fixedPriceAmount || ''}
                      onChange={(e) => setNewResource({ 
                        ...newResource, 
                        fixedPriceAmount: parseFloat(e.target.value) 
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Fixed Hours</label>
                    <input
                      type="number"
                      value={newResource.fixedPriceHours || ''}
                      onChange={(e) => setNewResource({ 
                        ...newResource, 
                        fixedPriceHours: parseInt(e.target.value) 
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create Resource
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Resources Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border text-left">Name</th>
                <th className="px-4 py-2 border text-left">Email</th>
                <th className="px-4 py-2 border text-left">Type</th>
                <th className="px-4 py-2 border text-left">LCAT</th>
                <th className="px-4 py-2 border text-right">Hourly Rate</th>
                <th className="px-4 py-2 border text-right">Burdened Cost</th>
                <th className="px-4 py-2 border text-right">Bill Rate</th>
                <th className="px-4 py-2 border text-right">Margin</th>
                <th className="px-4 py-2 border text-center">Start Date</th>
                <th className="px-4 py-2 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(resource => {
                const margin = calculateMargin(resource.billRate, resource.burdenedCost);
                const underwater = isUnderwater(margin);
                
                return (
                  <tr key={resource.id} className={underwater ? 'bg-red-50' : ''}>
                    <td className={`px-4 py-2 border ${getCellClass(resource.id, 'firstName')}`}>
                      <input
                        type="text"
                        value={getDisplayValue(resource, 'firstName')}
                        onChange={(e) => handleResourceEdit(resource.id, 'firstName', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className={`px-4 py-2 border ${getCellClass(resource.id, 'email')}`}>
                      <input
                        type="email"
                        value={getDisplayValue(resource, 'email')}
                        onChange={(e) => handleResourceEdit(resource.id, 'email', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      {resource.resourceType}
                    </td>
                    <td className={`px-4 py-2 border ${getCellClass(resource.id, 'lcatId')}`}>
                      <select
                        value={getDisplayValue(resource, 'lcatId')}
                        onChange={(e) => handleResourceEdit(resource.id, 'lcatId', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        {lcats.map(lcat => (
                          <option key={lcat.id} value={lcat.id}>{lcat.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className={`px-4 py-2 border text-right ${getCellClass(resource.id, 'hourlyRate')}`}>
                      <input
                        type="number"
                        step="0.01"
                        value={getDisplayValue(resource, 'hourlyRate')}
                        onChange={(e) => handleResourceEdit(resource.id, 'hourlyRate', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-right"
                      />
                    </td>
                    <td className="px-4 py-2 border text-right">
                      ${resource.burdenedCost?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-2 border text-right">
                      {resource.billRate ? `$${resource.billRate.toFixed(2)}` : '-'}
                    </td>
                    <td className={`px-4 py-2 border text-right ${underwater ? 'text-red-600 font-semibold' : ''}`}>
                      {margin !== undefined ? `$${margin.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {formatDate(resource.startDate, 'MM/dd/yyyy', 'N/A')}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        resource.isActive ? 
                        'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No resources found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceManagement;