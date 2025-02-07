import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Settings, X as CloseIcon } from 'lucide-react';

const CharityApplications = () => {
  const { authFetch } = useAuth();
  const [charities, setCharities] = useState([]);
  const [currentCharity, setCurrentCharity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);


  const fetchCharities = useCallback(async () => {
    try {
      const response = await authFetch('/api/charity/applications?status=pending');
      const data = await response.json();
      setCharities(data.applications);
    } catch (err) {
      setError(err.message);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const handleReview = (charity) => {
    setCurrentCharity(charity);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (action) => {
    try {
      const response = await authFetch(`/api/charity/applications/${currentCharity.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      setStatus(data.message);
      setModalOpen(false);
      fetchCharities();
    } catch (err) {
      setError(err.message);
      setModalOpen(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setCurrentCharity(null);
    setStatus('');
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Registration Number</th>
              <th className="p-4 text-left">Contact Email</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {charities.map((charity) => (
              <tr key={charity.id} className="border-b">
                <td className="p-4">{charity.name}</td>
                <td className="p-4">{charity.registration_number}</td>
                <td className="p-4">{charity.contact_email}</td>
                <td className="p-4">{charity.status}</td>
                <td className="p-4">
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
                    onClick={() => handleReview(charity)}
                  >
                    <Settings className="inline-block mr-2" />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Review Charity Application</h2>
              <button
                aria-label="Close"
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={handleModalClose}

              >
                <CloseIcon size={20} />
              </button>
            </div>
            {currentCharity && (
              <>
                <p className="mb-2">Charity Name: {currentCharity.name}</p>
                <p className="mb-2">Registration Number: {currentCharity.registration_number}</p>
                <p className="mb-4">Contact Email: {currentCharity.contact_email}</p>
              </>
            )}
            {status && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {status}
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={() => handleStatusUpdate('approve')}
              >
                <Check className="inline-block mr-2" />
                Approve
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleStatusUpdate('reject')}
              >
                <X className="inline-block mr-2" />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharityApplications;