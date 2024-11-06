import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CharitiesPage = () => {
    const { authFetch, isAuthenticated, user } = useAuth();
    const [charities, setCharities] = useState([]);
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
  
    const fetchCharities = useCallback(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          per_page: 10,
          search: searchTerm,
          ...(status && { status })
        });
  
        const response = await authFetch(`/api/charities?${params}`);
        const data = await response.json();
        
        if (response.ok) {
          setCharities(data.charities);
          setPagination(data.pagination);
        } else {
          setError(data.error || 'Failed to fetch charities');
        }
      } catch (err) {
        setError('Failed to fetch charities. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, [page, searchTerm, status, authFetch]);
  
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
        setError('Failed to fetch charity details. Please try again later.');
        console.error(err);
      }
    };
  
    const handleDonation = async () => {
      if (!isAuthenticated) {
        setError('Please log in to make a donation');
        return;
      }
  
      try {
        setLoading(true);
        const response = await authFetch('/api/donation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            charity_id: selectedCharity.id,
            amount: parseFloat(donationAmount),
            donation_type: 'one_time',
            user_id: user.userId
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setSuccess('Donation initiated. Please check your phone for M-Pesa prompt.');
          setDonationAmount('');
          setShowModal(false);
          // Refresh charities to update donation counts
          fetchCharities();
        } else {
          setError(data.message || 'Failed to process donation');
        }
      } catch (err) {
        setError('Failed to process donation. Please try again later.');
        console.error(err);
      }finally{
        setLoading(false);
      }
    };
  
    useEffect(() => {
      const debounceTimeout = setTimeout(() => {
        fetchCharities();
      }, 300);
  
      return () => clearTimeout(debounceTimeout);
    }, [fetchCharities]);
  
    useEffect(() => {
      // Clear errors when modal is closed
      if (!showModal) {
        setError('');
        setSuccess('');
        setDonationAmount('');
      }
    }, [showModal]);
  
    // Click outside dropdown handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showStatusDropdown && !event.target.closest('.status-dropdown')) {
          setShowStatusDropdown(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showStatusDropdown]);
  
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        setShowModal(false);
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
          
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50"
            >
              {status || 'Filter by status'}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {['', 'PENDING', 'APPROVED', 'REJECTED'].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => {
                        setStatus(statusOption);
                        setShowStatusDropdown(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {statusOption || 'All'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-white rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{charity.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{charity.description}</p>
              <div className="space-y-2 text-sm">
                <p>Total Donations: KES {charity.total_donations}</p>
                <p>Donors: {charity.donor_count}</p>
                <p>Beneficiaries: {charity.beneficiary_count}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t">
              <button
                onClick={() => fetchCharityDetails(charity.id)}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Learn More
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

      {/* Updated Modal */}
      {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>Email: {selectedCharity.contact_email}</p>
                        <p>Phone: {selectedCharity.contact_phone}</p>
                        <p>Registration: {selectedCharity.registration_number}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Make a Donation</h3>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={loading}
                        />
                        <button
                          onClick={handleDonation}
                          disabled={!donationAmount || loading}
                          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {loading ? (
                            <>
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Processing...
                            </>
                          ) : (
                            'Donate via M-Pesa'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedCharity.stories?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Recent Stories</h3>
                      <div className="space-y-4">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
};

export default CharitiesPage;