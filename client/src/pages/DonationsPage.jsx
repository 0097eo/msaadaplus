import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const DonationSummary = ({ donations }) => {
  const calculateTotalDonations = (donations) => {
    return donations
      .filter(d => d.payment_status === 'completed')
      .reduce((sum, donation) => sum + donation.amount, 0);
  };

  const totalRaised = calculateTotalDonations(donations);
  
  return (
    <div className="bg-gradient-to-r from-purple-700 to-pink-500 text-white p-6 rounded-lg shadow-lg mb-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Total Raised</h2>
        <p className="text-4xl font-bold">Ksh {totalRaised.toLocaleString()}</p>
        <p className="text-sm mt-2 opacity-80">From {donations.filter(d => d.payment_status === 'completed').length} completed donations</p>
      </div>
    </div>
  );
};

DonationSummary.propTypes = {
  donations: PropTypes.arrayOf(
    PropTypes.shape({
      payment_status: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired
    })
  ).isRequired
};

const DonorsPage = () => {
  const {authFetch } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await authFetch('/api/profile-details');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const CharityProfile = () => (
    <div className="space-y-6">
      <DonationSummary donations={profileData.donations} />


      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profileData.donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4">{donation.created_at}</td>
                  <td className="px-6 py-4">KES {donation.amount}</td>
                  <td className="px-6 py-4">{donation.donation_type}</td>
                  <td className="px-6 py-4">{donation.donor_name}</td>
                  <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    donation.payment_status === 'completed' ? 'bg-green-100 text-green-800' 
                    : donation.payment_status === 'failed' ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {donation.payment_status}
                  </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {profileData.profile_type === 'charity' && <CharityProfile />}
      </div>
    </div>
  );
}

export default DonorsPage;