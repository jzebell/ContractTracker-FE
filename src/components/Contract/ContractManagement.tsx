// src/components/Contract/ContractManagement.tsx

import React, { useState, useEffect } from 'react';
import { 
  Contract, 
  CreateContractDto, 
  ContractType, 
  ContractStatus,
  FundingWarningLevel,
  calculateFundingWarning,
  formatCurrency,
  formatDate
} from '../../types/Contract.types';
import { contractService } from '../../services/contractService';

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<CreateContractDto>({
    contractNumber: '',
    contractName: '',
    customerName: '',
    primeContractor: '',
    isPrime: true,
    contractType: ContractType.TimeAndMaterials,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalValue: 0,
    fundedValue: 0,
    standardFullTimeHours: 1912,
    description: ''
  });
  const [fundingData, setFundingData] = useState({
    modificationNumber: '',
    fundedAmount: 0,
    justification: ''
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContracts();
      setContracts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      await contractService.createContract(formData);
      setShowCreateForm(false);
      resetForm();
      fetchContracts();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create contract');
    }
  };

  const handleActivateContract = async (id: string) => {
    try {
      await contractService.activateContract(id);
      fetchContracts();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to activate contract');
    }
  };

  const handleCloseContract = async (id: string) => {
    if (window.confirm('Are you sure you want to close this contract?')) {
      try {
        await contractService.closeContract(id);
        fetchContracts();
      } catch (err: any) {
        setError(err.response?.data || 'Failed to close contract');
      }
    }
  };

  const handleUpdateFunding = async () => {
    if (!selectedContract) return;
    
    try {
      await contractService.updateFunding(selectedContract.id, fundingData);
      setShowFundingModal(false);
      setSelectedContract(null);
      setFundingData({ modificationNumber: '', fundedAmount: 0, justification: '' });
      fetchContracts();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update funding');
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.deleteContract(id);
        fetchContracts();
      } catch (err: any) {
        setError(err.response?.data || 'Failed to delete contract');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      contractNumber: '',
      contractName: '',
      customerName: '',
      primeContractor: '',
      isPrime: true,
      contractType: ContractType.TimeAndMaterials,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalValue: 0,
      fundedValue: 0,
      standardFullTimeHours: 1912,
      description: ''
    });
  };

  const getStatusBadge = (status: ContractStatus) => {
    const badges = {
      [ContractStatus.Draft]: 'bg-gray-100 text-gray-800',
      [ContractStatus.Active]: 'bg-green-100 text-green-800',
      [ContractStatus.Closed]: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getWarningIcon = (level: FundingWarningLevel) => {
    switch (level) {
      case FundingWarningLevel.Critical:
        return '🔴';
      case FundingWarningLevel.High:
        return '🟠';
      case FundingWarningLevel.Medium:
        return '🟡';
      case FundingWarningLevel.Low:
        return '🔵';
      default:
        return '🟢';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading contracts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Contract Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ➕ New Contract
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer / Prime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts.map((contract) => {
              const warningLevel = calculateFundingWarning(contract);
              const percentFunded = contract.totalValue > 0 
                ? Math.round((contract.fundedValue / contract.totalValue) * 100)
                : 0;
              
              return (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contract.contractNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contract.contractName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {contract.contractType.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{contract.customerName}</div>
                      <div className="text-xs text-gray-500">
                        Prime: {contract.primeContractor}
                        {contract.isPrime && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            We're Prime
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatDate(contract.startDate)}</div>
                      <div className="text-xs text-gray-500">to {formatDate(contract.endDate)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getWarningIcon(warningLevel)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(contract.fundedValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          of {formatCurrency(contract.totalValue)} ({percentFunded}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              percentFunded < 30 ? 'bg-red-600' :
                              percentFunded < 60 ? 'bg-yellow-600' :
                              percentFunded < 80 ? 'bg-blue-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(percentFunded, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(contract.status as ContractStatus)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {contract.status === ContractStatus.Draft && (
                        <button
                          onClick={() => handleActivateContract(contract.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activate"
                        >
                          ✅
                        </button>
                      )}
                      {contract.status === ContractStatus.Active && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedContract(contract);
                              setFundingData({
                                ...fundingData,
                                fundedAmount: contract.fundedValue
                              });
                              setShowFundingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Update Funding"
                          >
                            💰
                          </button>
                          <button
                            onClick={() => handleCloseContract(contract.id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Close Contract"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteContract(contract.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {contracts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No contracts found. Create your first contract to get started.
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Contract</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Number</label>
                  <input
                    type="text"
                    required
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Name</label>
                  <input
                    type="text"
                    required
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prime Contractor</label>
                  <input
                    type="text"
                    required
                    value={formData.primeContractor}
                    onChange={(e) => setFormData({ ...formData, primeContractor: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Are We Prime?</label>
                  <select
                    value={formData.isPrime ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isPrime: e.target.value === 'true' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="true">Yes - We're Prime</option>
                    <option value="false">No - We're Sub</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Type</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value={ContractType.TimeAndMaterials}>Time & Materials</option>
                    <option value={ContractType.FixedPrice}>Fixed Price</option>
                    <option value={ContractType.CostPlus}>Cost Plus</option>
                    <option value={ContractType.LaborHourOnly}>Labor Hour Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Value ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Initial Funding ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.fundedValue}
                    onChange={(e) => setFormData({ ...formData, fundedValue: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContract}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Funding Modal */}
      {showFundingModal && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Contract Funding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contract</label>
                <p className="mt-1 text-sm text-gray-900">{selectedContract.contractNumber} - {selectedContract.contractName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Funding</label>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedContract.fundedValue)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modification Number</label>
                <input
                  type="text"
                  required
                  value={fundingData.modificationNumber}
                  onChange={(e) => setFundingData({ ...fundingData, modificationNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., MOD-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Funded Amount ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={fundingData.fundedAmount}
                  onChange={(e) => setFundingData({ ...fundingData, fundedAmount: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Justification</label>
                <textarea
                  rows={3}
                  value={fundingData.justification}
                  onChange={(e) => setFundingData({ ...fundingData, justification: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Reason for funding change..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowFundingModal(false);
                    setSelectedContract(null);
                    setFundingData({ modificationNumber: '', fundedAmount: 0, justification: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFunding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Funding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;