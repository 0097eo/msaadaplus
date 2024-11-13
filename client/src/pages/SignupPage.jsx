import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import backgroundImage from '../assets/loginbg.jpg';
import { useNavigate } from'react-router-dom';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [charityName, setCharityName] = useState('');
  const [description, setDescription] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
        username,
        email,
        password,
        user_type: userType,
        ...(userType === 'donor' && { full_name: fullName, phone }),
        ...(userType === 'charity' && {
          charity_name: charityName,
          description,
          registration_number: registrationNumber,
          contact_email: contactEmail,
          contact_phone: contactPhone,
        }),
      };

    try {
        const response = await fetch('api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          sessionStorage.setItem('registrationEmail', formData.email);
          navigate('/verify');
        } else {
          setError(data.message || 'Registration failed');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
      <div className="flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          
          {error && (
            <div className="mb-4 flex items-center p-4 text-red-700 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <strong className="block font-semibold">Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              />
            </div>


            <div className="mb-4">
              <label htmlFor="user_type" className="block mb-2 text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                id="user_type"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
              >
                <option value="">Select type...</option>
                <option value="donor">Donor</option>
                <option value="charity">Charity</option>
              </select>
            </div>


            {userType === 'donor' && (
              <>
                <div className="mb-4">
                  <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
              </>
            )}


            {userType === 'charity' && (
              <>
                <div className="mb-4">
                  <label htmlFor="charity_name" className="block mb-2 text-sm font-medium text-gray-700">
                    Charity Name
                  </label>
                  <input
                    id="charity_name"
                    type="text"
                    value={charityName}
                    onChange={(e) => setCharityName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="registration_number" className="block mb-2 text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <input
                    id="registration_number"
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="contact_email" className="block mb-2 text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    id="contact_email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="contact_phone" className="block mb-2 text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    id="contact_phone"
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-purple-600 hover:underline">
              Log In
            </a>
          </div>
        </div>
      </div>

      <div
        className="relative hidden md:flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 p-8 text-center text-white">
          <h2 className="text-4xl font-bold">Join Us!</h2>
          <p className="mt-4 text-lg">
            Register to start making a difference with us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
