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
        <h2 className="text-xl font-semibold mb-2">Total Help Given</h2>
        <p className="text-4xl font-bold">Ksh {totalRaised.toLocaleString()}</p>
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

const BeneficiariesPage = () => {
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
      <div className="flex items-center justify-center min-h-screen" role='status'>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profileData.beneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
              <p className="text-gray-600">Age: {beneficiary.age}</p>
              <p className="text-gray-600">School: {beneficiary.school}</p>
              <p className="text-gray-600">Location: {beneficiary.location}</p>
            </div>
          ))}
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

export default BeneficiariesPage;