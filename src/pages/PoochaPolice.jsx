import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import ConfirmDialog from '../components/ConfirmDialog';

const PoochaPolice = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState(null);
  const [formData, setFormData] = useState({
    seasonBanner: '',
    seasonTitle: '',
    storyNumber: ''
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

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

  const fetchSeasons = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/poochaPolice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch seasons');
      const data = await response.json();
      setSeasons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'seasonBanner' || !selectedFile) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (selectedFile) {
        formDataToSend.append('seasonBanner', selectedFile);
      }

      const url = editingSeason
        ? `${import.meta.env.VITE_API_URL}/poochaPolice/${editingSeason._id}`
        : `${import.meta.env.VITE_API_URL}/poochaPolice`;

      const method = editingSeason ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to save season');
      
      await fetchSeasons();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (season) => {
    setSeasonToDelete(season);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!seasonToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/poochaPolice/${seasonToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete season');
      
      await fetchSeasons();
      setIsDeleteDialogOpen(false);
      setSeasonToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    setFormData({
      seasonBanner: season.seasonBanner,
      seasonTitle: season.seasonTitle,
      storyNumber: season.storyNumber
    });
    setPreviewUrl('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSeason(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      seasonBanner: '',
      seasonTitle: '',
      storyNumber: ''
    });
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
        <h1 className="text-2xl font-bold">Poocha Police Seasons</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
        >
          <HiPlus className="h-5 w-5" />
          <span>Add Season</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Story Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {seasons.map((season) => (
              <tr key={season._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img 
                    src={season.seasonBanner} 
                    alt={season.seasonTitle}
                    className="h-16 w-28 rounded-md object-cover"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{season.seasonTitle}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">#{season.storyNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(season)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(season)}
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

      {/* Modal for Add/Edit Season */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSeason ? 'Edit Season' : 'Add New Season'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Season Title</label>
                  <input
                    type="text"
                    value={formData.seasonTitle}
                    onChange={(e) => setFormData({ ...formData, seasonTitle: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter season title"
                  />
                </div>
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
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Season Banner</label>
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
                {(previewUrl || formData.seasonBanner) && (
                  <div className="mt-2">
                    <img
                      src={previewUrl || formData.seasonBanner}
                      alt="Banner Preview"
                      className="h-32 w-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
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
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      {editingSeason ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingSeason ? 'Update Season' : 'Create Season'
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
          setSeasonToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Season"
        message="Are you sure you want to delete this season? This action cannot be undone."
      />
    </div>
  );
};

export default PoochaPolice; 