import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddStoryModal from '../components/NewStory';
import { Pencil } from 'lucide-react';


const StoriesPage = () => {
  const { user, authFetch } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <div className="bg-white p-6 rounded-lg shadow-md">
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

      

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AddStoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          <button
            className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Pencil className="h-6 w-6" />
          </button>
        {profileData.profile_type === 'charity' && <CharityProfile />}
      </div>
    </div>
  );
}

export default StoriesPage;