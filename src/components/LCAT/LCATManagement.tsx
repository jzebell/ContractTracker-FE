import React, { useState, useEffect, useCallback } from 'react';
import { LCAT, CreateLCAT, LCATRateUpdate, BatchUpdateRates } from '../../types/LCAT.types';
import { lcatService } from '../../services/lcatService';

const LCATManagement: React.FC = () => {
  const [lcats, setLCATs] = useState<LCAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editedRates, setEditedRates] = useState<Map<string, LCATRateUpdate>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newLCAT, setNewLCAT] = useState<CreateLCAT>({
    name: '',
    description: '',
    publishedRate: 0,
    defaultBillRate: 0,
    positionTitles: []
  });
  const [newPositionTitle, setNewPositionTitle] = useState('');

  useEffect(() => {
    loadLCATs();
  }, []);

  const loadLCATs = async () => {
    try {
      setLoading(true);
      const data = await lcatService.getAll();
      setLCATs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load LCATs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateEdit = useCallback((lcatId: string, field: 'published' | 'default', value: number) => {
    const updates = new Map(editedRates);
    const existing = updates.get(lcatId) || { lcatId };
    
    if (field === 'published') {
      existing.publishedRate = value;
    } else {
      existing.defaultBillRate = value;
    }
    
    updates.set(lcatId, existing);
    setEditedRates(updates);
    setHasUnsavedChanges(true);
  }, [editedRates]);

  const handleSaveAllRates = async () => {
    if (editedRates.size === 0) return;

    const batchUpdate: BatchUpdateRates = {
      effectiveDate: new Date().toISOString(),
      notes: 'Batch rate update',
      rateUpdates: Array.from(editedRates.values())
    };

    try {
      await lcatService.batchUpdateRates(batchUpdate);
      await loadLCATs();
      setEditedRates(new Map());
      setHasUnsavedChanges(false);
      alert('Rates updated successfully');
    } catch (err) {
      setError('Failed to update rates');
      console.error(err);
    }
  };

  const handleCancelEdits = () => {
    setEditedRates(new Map());
    setHasUnsavedChanges(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lcatService.create(newLCAT);
      await loadLCATs();
      setShowAddForm(false);
      setNewLCAT({
        name: '',
        description: '',
        publishedRate: 0,
        defaultBillRate: 0,
        positionTitles: []
      });
    } catch (err) {
      setError('Failed to create LCAT');
      console.error(err);
    }
  };

  const addPositionTitle = () => {
    if (newPositionTitle.trim()) {
      setNewLCAT({
        ...newLCAT,
        positionTitles: [...newLCAT.positionTitles, newPositionTitle.trim()]
      });
      setNewPositionTitle('');
    }
  };

  const getCellClass = (lcatId: string, field: 'published' | 'default') => {
    const edited = editedRates.get(lcatId);
    if (edited && ((field === 'published' && edited.publishedRate !== undefined) || 
                   (field === 'default' && edited.defaultBillRate !== undefined))) {
      return 'bg-yellow-100';
    }
    return '';
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">LCAT Management</h1>
        <div className="space-x-2">
          {hasUnsavedChanges && (
            <>
              <span className="text-orange-600 mr-4">You have unsaved changes</span>
              <button
                onClick={handleCancelEdits}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel Changes
              </button>
              <button
                onClick={handleSaveAllRates}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save All Changes
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add LCAT'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                value={newLCAT.name}
                onChange={(e) => setNewLCAT({...newLCAT, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Description</label>
              <input
                type="text"
                value={newLCAT.description}
                onChange={(e) => setNewLCAT({...newLCAT, description: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Published Rate</label>
              <input
                type="number"
                value={newLCAT.publishedRate}
                onChange={(e) => setNewLCAT({...newLCAT, publishedRate: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Default Bill Rate</label>
              <input
                type="number"
                value={newLCAT.defaultBillRate}
                onChange={(e) => setNewLCAT({...newLCAT, defaultBillRate: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block mb-2">Position Titles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newPositionTitle}
                onChange={(e) => setNewPositionTitle(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Add position title"
              />
              <button
                type="button"
                onClick={addPositionTitle}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newLCAT.positionTitles.map((title, index) => (
                <span key={index} className="px-3 py-1 bg-gray-200 rounded">
                  {title}
                </span>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create LCAT
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Published Rate</th>
              <th className="px-4 py-2 border">Default Bill Rate</th>
              <th className="px-4 py-2 border">Position Titles</th>
            </tr>
          </thead>
          <tbody>
            {lcats.map(lcat => {
              const editedRate = editedRates.get(lcat.id);
              return (
                <tr key={lcat.id}>
                  <td className="px-4 py-2 border">{lcat.name}</td>
                  <td className="px-4 py-2 border">{lcat.description}</td>
                  <td className={`px-4 py-2 border ${getCellClass(lcat.id, 'published')}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={editedRate?.publishedRate ?? lcat.currentPublishedRate ?? ''}
                      onChange={(e) => handleRateEdit(lcat.id, 'published', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className={`px-4 py-2 border ${getCellClass(lcat.id, 'default')}`}>
                    <input
                      type="number"
                      step="0.01"
                      value={editedRate?.defaultBillRate ?? lcat.currentDefaultBillRate ?? ''}
                      onChange={(e) => handleRateEdit(lcat.id, 'default', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border text-sm">{lcat.positionTitles.join(', ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LCATManagement;