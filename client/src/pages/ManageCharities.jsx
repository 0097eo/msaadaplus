import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ManageCharityPage = () => {
  const { authFetch } = useAuth();
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10, search: searchTerm });
      const response = await authFetch(`/api/charities?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCharities(data.charities);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch charities');
      }
    } catch (err) {
      setError('Error fetching charities. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page, searchTerm]);

  const fetchCharityDetails = async (id) => {
    try {
      const response = await authFetch(`/api/charity/${id}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedCharity(data);
        setShowModal(true);
      } else {
        setError(data.error || 'Failed to fetch charity details');
      }
    } catch (err) {
      setError('Error fetching charity details. Please try again later.');
      console.error(err);
    }
  };

  const handleDeleteCharity = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`/api/charity/${selectedCharity.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCharities((prevCharities) => prevCharities.filter((charity) => charity.id !== selectedCharity.id));
        setShowModal(false);
      } else {
        setError('Failed to delete charity');
      }
    } catch (err) {
      setError('Error deleting charity. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => fetchCharities(), 300);
    return () => clearTimeout(debounceTimeout);
  }, [fetchCharities]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search charities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-white rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{charity.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{charity.description}</p>
            </div>
            <div className="px-6 py-4 border-t">
              <button
                onClick={() => fetchCharityDetails(charity.id)}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.has_prev}
            className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.has_next}
            className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {selectedCharity && (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedCharity.name}</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <p className="mb-6">{selectedCharity.description}</p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>Email: {selectedCharity.contact_email}</p>
                      <p>Phone: {selectedCharity.contact_phone}</p>
                      <p>Registration: {selectedCharity.registration_number}</p>
                    </div>
                  </div>
                </div>

                {selectedCharity.stories?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Recent Stories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedCharity.stories.map((story) => (
                        <div key={story.id} className="border rounded-lg overflow-hidden">
                          {story.image_url && (
                            <img
                              src={story.image_url}
                              alt={story.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/400/320";
                              }}
                            />
                          )}
                          <div className="p-4">
                            <h4 className="font-semibold">{story.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{story.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Posted on {story.created_at}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={handleDeleteCharity}
                    className={`px-4 py-2 rounded-lg text-white ${
                      confirmDelete ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
                    } transition-colors`}
                    disabled={loading}
                  >
                    {confirmDelete ? 'Confirm Delete' : 'Delete Charity'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>

                {loading && (
                  <div className="flex items-center justify-center mt-4">
                    <Loader className="animate-spin h-5 w-5 text-purple-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCharityPage;