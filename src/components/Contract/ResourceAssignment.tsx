// src/components/Contract/ResourceAssignment.tsx

import React, { useState, useEffect } from 'react';
import {
  ContractResource,
  ResourceAvailability,
  AssignResourceDto,
  formatAllocation,
  getAllocationColor,
  getMarginColor
} from '../../types/ContractResource.types';
import { contractResourceService } from '../../services/contractResourceService';
import './ResourceAssignment.css';

interface ResourceAssignmentProps {
  contractId: string;
  contractNumber: string;
  onUpdate?: () => void;
}

const ResourceAssignment: React.FC<ResourceAssignmentProps> = ({
  contractId,
  contractNumber,
  onUpdate
}) => {
  const [assignedResources, setAssignedResources] = useState<ContractResource[]>([]);
  const [availableResources, setAvailableResources] = useState<ResourceAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceAvailability | null>(null);
  const [editingResource, setEditingResource] = useState<ContractResource | null>(null);
  
  // Form state for new assignment
  const [assignmentForm, setAssignmentForm] = useState<AssignResourceDto>({
    resourceId: '',
    allocationPercentage: 100,
    annualHours: 1912,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAssignedResources();
  }, [contractId]);

  const loadAssignedResources = async () => {
    try {
      setLoading(true);
      const resources = await contractResourceService.getContractResources(contractId);
      setAssignedResources(resources);
      setError(null);
    } catch (err) {
      setError('Failed to load assigned resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableResources = async () => {
    try {
      const resources = await contractResourceService.getAvailableResources(contractId);
      setAvailableResources(resources);
    } catch (err) {
      console.error('Failed to load available resources:', err);
    }
  };

  const handleShowAssignModal = async () => {
    setShowAssignModal(true);
    await loadAvailableResources();
  };

  const handleSelectResource = (resource: ResourceAvailability) => {
    setSelectedResource(resource);
    setAssignmentForm({
      ...assignmentForm,
      resourceId: resource.resourceId,
      allocationPercentage: Math.min(100, resource.availableAllocation)
    });
  };

  const handleAssignResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResource) {
      setError('Please select a resource');
      return;
    }

    try {
      setLoading(true);
      await contractResourceService.assignResource(contractId, {
        ...assignmentForm,
        startDate: new Date(assignmentForm.startDate).toISOString()
      });
      
      await loadAssignedResources();
      setShowAssignModal(false);
      setSelectedResource(null);
      setAssignmentForm({
        resourceId: '',
        allocationPercentage: 100,
        annualHours: 1912,
        startDate: new Date().toISOString().split('T')[0],
      });
      
      if (onUpdate) onUpdate();
      alert('Resource assigned successfully!');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to assign resource');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAllocation = async (resource: ContractResource, newAllocation: number) => {
    try {
      await contractResourceService.updateAssignment(
        contractId,
        resource.resourceId,
        { allocationPercentage: newAllocation }
      );
      await loadAssignedResources();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to update allocation');
    }
  };

  const handleRemoveResource = async (resource: ContractResource) => {
    if (!window.confirm(`Remove ${resource.resourceName} from this contract?`)) {
      return;
    }

    try {
      await contractResourceService.removeResource(contractId, resource.resourceId);
      await loadAssignedResources();
      if (onUpdate) onUpdate();
      alert('Resource removed successfully');
    } catch (err) {
      setError('Failed to remove resource');
    }
  };

  const calculateTotalBurn = () => {
    return assignedResources.reduce((sum, r) => sum + r.monthlyBurn, 0);
  };

  const calculateTotalAllocation = () => {
    return assignedResources.reduce((sum, r) => sum + r.allocationPercentage, 0);
  };

  return (
    <div className="resource-assignment">
      <div className="assignment-header">
        <h3>📋 Resource Assignments</h3>
        <button 
          className="btn btn-primary"
          onClick={handleShowAssignModal}
        >
          + Assign Resource
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && <div className="loading">Loading resources...</div>}

      {/* Assigned Resources Table */}
      <div className="assigned-resources">
        {assignedResources.length === 0 ? (
          <div className="empty-state">
            <p>No resources assigned to this contract yet.</p>
            <button onClick={handleShowAssignModal} className="btn btn-secondary">
              Assign First Resource
            </button>
          </div>
        ) : (
          <>
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>LCAT</th>
                  <th>Allocation</th>
                  <th>Hours/Year</th>
                  <th>Pay Rate</th>
                  <th>Bill Rate</th>
                  <th>Monthly Burn</th>
                  <th>Margin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedResources.map(resource => (
                  <tr key={resource.id} className={resource.isUnderwater ? 'underwater' : ''}>
                    <td className="resource-name">{resource.resourceName}</td>
                    <td>{resource.resourceType}</td>
                    <td>{resource.lcatTitle || 'N/A'}</td>
                    <td>
                      <div className="allocation-cell">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={resource.allocationPercentage}
                          onChange={(e) => handleUpdateAllocation(resource, Number(e.target.value))}
                          className="allocation-slider"
                          style={{
                            background: `linear-gradient(to right, ${getAllocationColor(resource.allocationPercentage)} 0%, ${getAllocationColor(resource.allocationPercentage)} ${resource.allocationPercentage}%, #e5e7eb ${resource.allocationPercentage}%)`
                          }}
                        />
                        <span className="allocation-value" style={{ color: getAllocationColor(resource.allocationPercentage) }}>
                          {formatAllocation(resource.allocationPercentage)}
                        </span>
                      </div>
                    </td>
                    <td>{Math.round(resource.annualHours * resource.allocationPercentage / 100)}</td>
                    <td>${resource.payRate.toFixed(2)}</td>
                    <td>${resource.billRate.toFixed(2)}</td>
                    <td className="burn-rate">${resource.monthlyBurn.toLocaleString()}</td>
                    <td>
                      <span 
                        className="margin-badge" 
                        style={{ 
                          backgroundColor: getMarginColor(resource.margin),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {resource.margin.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-icon"
                        onClick={() => handleRemoveResource(resource)}
                        title="Remove from contract"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan={3}><strong>Total</strong></td>
                  <td><strong>{calculateTotalAllocation()}%</strong></td>
                  <td colSpan={3}></td>
                  <td><strong>${calculateTotalBurn().toLocaleString()}</strong></td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

      {/* Assign Resource Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Resource to {contractNumber}</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAssignResource}>
              {/* Available Resources List */}
              <div className="form-group">
                <label>Select Resource:</label>
                <div className="resource-list">
                  {availableResources.map(resource => (
                    <div
                      key={resource.resourceId}
                      className={`resource-card ${selectedResource?.resourceId === resource.resourceId ? 'selected' : ''}`}
                      onClick={() => handleSelectResource(resource)}
                    >
                      <div className="resource-info">
                        <strong>{resource.resourceName}</strong>
                        <div className="resource-availability">
                          <span className="availability-badge" style={{ color: getAllocationColor(resource.currentAllocation) }}>
                            {formatAllocation(resource.availableAllocation)} available
                          </span>
                          {resource.isOnBench && <span className="bench-badge">On Bench</span>}
                        </div>
                      </div>
                      {resource.currentContracts.length > 0 && (
                        <div className="current-contracts">
                          <small>Current assignments:</small>
                          {resource.currentContracts.map(c => (
                            <div key={c.contractId} className="contract-assignment">
                              {c.contractNumber}: {formatAllocation(c.allocationPercentage)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Details */}
              {selectedResource && (
                <>
                  <div className="form-group">
                    <label>Allocation Percentage:</label>
                    <div className="allocation-input">
                      <input
                        type="range"
                        min="0"
                        max={selectedResource.availableAllocation}
                        value={assignmentForm.allocationPercentage}
                        onChange={(e) => setAssignmentForm({
                          ...assignmentForm,
                          allocationPercentage: Number(e.target.value)
                        })}
                      />
                      <span>{formatAllocation(assignmentForm.allocationPercentage)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Annual Hours:</label>
                    <input
                      type="number"
                      min="1"
                      max="2080"
                      value={assignmentForm.annualHours}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        annualHours: Number(e.target.value)
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={assignmentForm.startDate}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        startDate: e.target.value
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date (Optional):</label>
                    <input
                      type="date"
                      value={assignmentForm.endDate || ''}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        endDate: e.target.value || undefined
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bill Rate Override (Optional):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Leave blank to use LCAT default"
                      value={assignmentForm.contractBillRateOverride || ''}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        contractBillRateOverride: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                  </div>
                </>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!selectedResource || loading}>
                  {loading ? 'Assigning...' : 'Assign Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAssignment;