import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import SearchAndSort from '../components/SearchAndSort';

const ForceUpdate = () => {
  const [updates, setUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt-desc');
  const [formData, setFormData] = useState({
    version: '',
    enabled: false,
    changes: ''
  });

  const sortOptions = [
    { value: 'updatedAt-desc', label: 'Latest First' },
    { value: 'updatedAt-asc', label: 'Oldest First' },
    { value: 'version-asc', label: 'Version (Low to High)' },
    { value: 'version-desc', label: 'Version (High to Low)' },
    { value: 'enabled-desc', label: 'Enabled First' },
    { value: 'enabled-asc', label: 'Disabled First' }
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    // Apply search and sort to updates
    let result = [...updates];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(update => 
        update.version.toLowerCase().includes(lowerSearchTerm) ||
        update.changes.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply sort
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'updatedAt') {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (field === 'version') {
        comparison = a.version.localeCompare(b.version, undefined, { numeric: true });
      } else if (field === 'enabled') {
        comparison = (a.enabled === b.enabled) ? 0 : a.enabled ? -1 : 1;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredUpdates(result);
  }, [updates, searchTerm, sortBy]);

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forceUpdate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch updates');
      const data = await response.json();
      setUpdates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      const url = editingUpdate
        ? `${import.meta.env.VITE_API_URL}/force-update/${editingUpdate._id}`
        : `${import.meta.env.VITE_API_URL}/force-update`;

      const method = editingUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save update');
      
      await fetchUpdates();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setFormData({
      version: update.version,
      enabled: update.enabled,
      changes: update.changes
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUpdate(null);
    setFormData({
      version: '',
      enabled: false,
      changes: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Force Updates</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
        >
          <HiPlus className="h-5 w-5" />
          <span>Add Update</span>
        </button>
      </div>

      <SearchAndSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
        placeholder="Search by version or changes..."
      />

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUpdates.map((update) => (
              <tr key={update._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{update.version}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    update.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {update.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md truncate">
                    {update.changes}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(update.updatedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Update */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUpdate ? 'Edit Update' : 'Add New Update'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  required
                  placeholder="e.g. 1.0.0"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150"
                  />
                  <label htmlFor="enabled" className="text-sm text-gray-900 font-medium">
                    Enable Force Update
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  When enabled, users will be required to update their app to the latest version.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Changes</label>
                <textarea
                  value={formData.changes}
                  onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                  rows={4}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  required
                  placeholder="List the changes in this update..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Describe the changes and improvements in this update. This will be shown to users.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                >
                  {editingUpdate ? 'Update Version' : 'Create Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceUpdate; 