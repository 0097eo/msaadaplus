import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/loginbg.jpg';

const LoginPage = () => {
  const { login, error, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const getRedirectPath = (userType) => {
    switch (userType.toLowerCase()) {
      case 'donor':
        return '/charities';
      case 'charity':
        return '/profile';
      case 'admin':
        return '/applications';
      default:
        return '/';
    }
  };

  // Handle redirect when user state changes
  useEffect(() => {
    if (user && user.userType) {
      const redirectPath = getRedirectPath(user.userType);
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
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
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Loading...' : 'Log In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-purple-600 hover:underline">
              Register
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
          <h2 className="text-4xl font-bold">Welcome Back!</h2>
          <p className="mt-4 text-lg">
            Log in to access your account and explore new opportunities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;