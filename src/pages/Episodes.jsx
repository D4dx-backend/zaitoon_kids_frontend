import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchAndSort from '../components/SearchAndSort';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Episodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('storyNumber-asc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState({
    coverImage: '',
    storyNumber: '',
    storyTitle: '',
    mlTitle: '',
    name: '',
    id: '',
    isHighlighted: false,
    visibilityStatus: true
  });

  const sortOptions = [
    { value: 'storyNumber-asc', label: 'Story Number (Low to High)' },
    { value: 'storyNumber-desc', label: 'Story Number (High to Low)' },
    { value: 'storyTitle-asc', label: 'Story Title (A-Z)' },
    { value: 'storyTitle-desc', label: 'Story Title (Z-A)' }
  ];

  // Fetch episodes
  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    // Apply search and sort to episodes
    let result = [...episodes];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(episode => 
        episode.storyTitle.toLowerCase().includes(lowerSearchTerm) ||
        episode.mlTitle.toLowerCase().includes(lowerSearchTerm) ||
        episode.storyNumber.toString().includes(lowerSearchTerm)
      );
    }
    
    // Apply sort
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'storyNumber') {
        comparison = parseInt(a.storyNumber) - parseInt(b.storyNumber);
      } else if (field === 'storyTitle') {
        comparison = a.storyTitle.localeCompare(b.storyTitle);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredEpisodes(result);
  }, [episodes, searchTerm, sortBy]);

  const fetchEpisodes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/episode`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setEpisodes(response.data);
      setFilteredEpisodes(response.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch episodes');
      if (err.response?.status === 403) {
        // Handle unauthorized access
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'coverImage' || selectedFile) { // Only append coverImage if there's a new file
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (selectedFile) {
        formDataToSend.append('coverImage', selectedFile);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingEpisode) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/episode/${editingEpisode._id}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/episode`,
          formDataToSend,
          config
        );
      }

      await fetchEpisodes();
      setIsModalOpen(false);
      setEditingEpisode(null);
      setSelectedFile(null);
      setPreviewUrl('');
      setFormData({
        coverImage: '',
        storyNumber: '',
        storyTitle: '',
        mlTitle: '',
        name: '',
        id: '',
        isHighlighted: false,
        visibilityStatus: true
      });
      toast.success(editingEpisode ? 'Episode updated successfully!' : 'Episode created successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
      
      if (error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (episode) => {
    setEpisodeToDelete(episode);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!episodeToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/episode/${episodeToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete episode');
      
      await fetchEpisodes();
      setIsDeleteDialogOpen(false);
      setEpisodeToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (episode) => {
    setEditingEpisode(episode);
    setFormData({
      coverImage: episode.coverImage,
      storyNumber: episode.storyNumber,
      storyTitle: episode.storyTitle,
      mlTitle: episode.mlTitle,
      name: episode.name,
      id: episode.id,
      isHighlighted: episode.isHighlighted,
      visibilityStatus: episode.visibilityStatus
    });
    setIsModalOpen(true);
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
        <h1 className="text-2xl font-bold">Episodes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
        >
          <HiPlus className="h-5 w-5" />
          <span>Add Episode</span>
        </button>
      </div>

      <SearchAndSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
        placeholder="Search by title or story number..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Story #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ML Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEpisodes.map((episode) => (
              <tr key={episode._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{episode.storyNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img 
                      src={episode.coverImage} 
                      alt={episode.storyTitle}
                      className="h-10 w-10 rounded-md object-cover mr-3"
                    />
                    <div className="text-sm text-gray-900">{episode.storyTitle}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{episode.mlTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      episode.visibilityStatus
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {episode.visibilityStatus ? 'Visible' : 'Hidden'}
                    </span>
                    {episode.isHighlighted && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Highlighted
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(episode)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(episode)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Episode */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl('');
                  setFormData({
                    coverImage: '',
                    storyNumber: '',
                    storyTitle: '',
                    mlTitle: '',
                    name: '',
                    id: '',
                    isHighlighted: false,
                    visibilityStatus: true
                  });
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Story Number</label>
                  <input
                    type="number"
                    value={formData.storyNumber}
                    onChange={(e) => setFormData({ ...formData, storyNumber: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter story number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Story Title</label>
                  <input
                    type="text"
                    value={formData.storyTitle}
                    onChange={(e) => setFormData({ ...formData, storyTitle: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter story title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Malayalam Title</label>
                  <input
                    type="text"
                    value={formData.mlTitle}
                    onChange={(e) => setFormData({ ...formData, mlTitle: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter Malayalam title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  required
                  placeholder="Enter ID"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  {(previewUrl || editingEpisode?.coverImage) && (
                    <div className="relative w-20 h-20">
                      <img
                        src={previewUrl || editingEpisode?.coverImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isHighlighted"
                    checked={formData.isHighlighted}
                    onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150"
                  />
                  <label htmlFor="isHighlighted" className="text-sm text-gray-900 font-medium">
                    Highlight Episode
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="visibilityStatus"
                    checked={formData.visibilityStatus}
                    onChange={(e) => setFormData({ ...formData, visibilityStatus: e.target.checked })}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition duration-150"
                  />
                  <label htmlFor="visibilityStatus" className="text-sm text-gray-900 font-medium">
                    Visible
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                    setPreviewUrl('');
                    setFormData({
                      coverImage: '',
                      storyNumber: '',
                      storyTitle: '',
                      mlTitle: '',
                      name: '',
                      id: '',
                      isHighlighted: false,
                      visibilityStatus: true
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      {editingEpisode ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingEpisode ? 'Update Episode' : 'Create Episode'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setEpisodeToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Episode"
        message="Are you sure you want to delete this episode? This action cannot be undone."
      />
    </div>
  );
};

export default Episodes; 