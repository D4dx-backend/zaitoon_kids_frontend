import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchAndSort from '../components/SearchAndSort';

const SingleStories = () => {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('readTimes-desc');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverImage: '',
    readTimes: 0,
    storyTitleEn: '',
    storyTitleMl: ''
  });

  const sortOptions = [
    { value: 'readTimes-desc', label: 'Most Read' },
    { value: 'readTimes-asc', label: 'Least Read' },
    { value: 'storyTitleEn-asc', label: 'English Title (A-Z)' },
    { value: 'storyTitleEn-desc', label: 'English Title (Z-A)' },
    { value: 'storyTitleMl-asc', label: 'Malayalam Title (A-Z)' },
    { value: 'storyTitleMl-desc', label: 'Malayalam Title (Z-A)' }
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    // Apply search and sort to stories
    let result = [...stories];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(story => 
        story.storyTitleEn.toLowerCase().includes(lowerSearchTerm) ||
        story.storyTitleMl.toLowerCase().includes(lowerSearchTerm) ||
        story.readTimes.toString().includes(lowerSearchTerm)
      );
    }
    
    // Apply sort
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'readTimes') {
        comparison = a.readTimes - b.readTimes;
      } else if (field === 'storyTitleEn') {
        comparison = a.storyTitleEn.localeCompare(b.storyTitleEn);
      } else if (field === 'storyTitleMl') {
        comparison = a.storyTitleMl.localeCompare(b.storyTitleMl);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredStories(result);
  }, [stories, searchTerm, sortBy]);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/singleStory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err.message);
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
    const token = localStorage.getItem('adminToken');
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'coverImage' || !selectedFile) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (selectedFile) {
        formDataToSend.append('coverImage', selectedFile);
      }

      const url = editingStory
        ? `${import.meta.env.VITE_API_URL}/singleStory/${editingStory._id}`
        : `${import.meta.env.VITE_API_URL}/singleStory`;

      const method = editingStory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to save story');
      
      await fetchStories();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!storyToDelete) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/singleStory/${storyToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete story');
      
      await fetchStories();
      setIsDeleteDialogOpen(false);
      setStoryToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      coverImage: story.coverImage,
      readTimes: story.readTimes,
      storyTitleEn: story.storyTitleEn,
      storyTitleMl: story.storyTitleMl
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      coverImage: '',
      readTimes: 0,
      storyTitleEn: '',
      storyTitleMl: ''
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
        <h1 className="text-2xl font-bold">Single Stories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
        >
          <HiPlus className="h-5 w-5" />
          <span>Add Story</span>
        </button>
      </div>

      <SearchAndSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
        placeholder="Search by title..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">English Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malayalam Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read Times</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStories.map((story) => (
              <tr key={story._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img 
                    src={story.coverImage} 
                    alt={story.storyTitleEn}
                    className="h-16 w-28 rounded-md object-cover"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{story.storyTitleEn}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{story.storyTitleMl}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{story.readTimes}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(story)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(story)}
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

      {/* Modal for Add/Edit Story */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingStory ? 'Edit Story' : 'Add New Story'}
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
                  <label className="block text-sm font-medium text-gray-700">English Title</label>
                  <input
                    type="text"
                    value={formData.storyTitleEn}
                    onChange={(e) => setFormData({ ...formData, storyTitleEn: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter English title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Malayalam Title</label>
                  <input
                    type="text"
                    value={formData.storyTitleMl}
                    onChange={(e) => setFormData({ ...formData, storyTitleMl: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                    required
                    placeholder="Enter Malayalam title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
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
                {(previewUrl || formData.coverImage) && (
                  <div className="mt-2">
                    <img
                      src={previewUrl || formData.coverImage}
                      alt="Cover Preview"
                      className="h-32 w-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Read Times</label>
                <input
                  type="number"
                  value={formData.readTimes}
                  onChange={(e) => setFormData({ ...formData, readTimes: parseInt(e.target.value) })}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                  min="0"
                  required
                  placeholder="Enter number of reads"
                />
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
                      {editingStory ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingStory ? 'Update Story' : 'Create Story'
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
          setStoryToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Single Story"
        message="Are you sure you want to delete this story? This action cannot be undone."
      />
    </div>
  );
};

export default SingleStories; 