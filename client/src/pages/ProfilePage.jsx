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

const ProfilePage = () => {
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

  const DonorProfile = () => (
    <div className="space-y-6">
      <DonationSummary donations={profileData.donations} />
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Full Name</p>
            <p className="font-medium">{profileData.profile.full_name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{profileData.profile.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="font-medium">{profileData.profile.phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Username</p>
            <p className="font-medium">{profileData.profile.username}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">One-Time Donations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profileData.donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4">{donation.created_at}</td>
                  <td className="px-6 py-4">KES {donation.amount}</td>
                  <td className="px-6 py-4">{donation.charity_name}</td>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Recurring Donations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profileData.recurring_donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4">{donation.charity_name}</td>
                  <td className="px-6 py-4">KES {donation.amount}</td>
                  <td className="px-6 py-4">{donation.frequency}</td>
                  <td className="px-6 py-4">{donation.next_donation_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${donation.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {donation.is_active ? 'Active' : 'Inactive'}
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

  const CharityProfile = () => (
    <div className="space-y-6">
      <DonationSummary donations={profileData.donations} />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Charity Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{profileData.profile.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Registration Number</p>
            <p className="font-medium">{profileData.profile.registration_number}</p>
          </div>
          <div>
            <p className="text-gray-600">Contact Email</p>
            <p className="font-medium">{profileData.profile.contact_email}</p>
          </div>
          <div>
            <p className="text-gray-600">Contact Phone</p>
            <p className="font-medium">{profileData.profile.contact_phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Description</p>
            <p className="font-medium">{profileData.profile.description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Beneficiaries</h2>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileData.stories.map((story) => (
            <div key={story.id} className="border rounded-lg overflow-hidden">
              {story.image_url && (
                <img src={story.image_url} alt={story.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                <p className="text-gray-600">{story.content}</p>
                <p className="text-sm text-gray-500 mt-2">{story.created_at}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Received Donations</h2>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Hello, {profileData.profile.username}
        </h1>
        {profileData.profile_type === 'donor' ? <DonorProfile /> : <CharityProfile />}
      </div>
    </div>
  );
};

export default ProfilePage;