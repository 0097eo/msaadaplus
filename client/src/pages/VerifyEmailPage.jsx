import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import backgroundImage from '../assets/loginbg.jpg';
import { useNavigate } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [email, setEmail] = useState(sessionStorage.getItem('registrationEmail') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verification_code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email verified successfully!');
        navigate('/login');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email resent successfully');
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
      console.error(err.message);
    } finally {
      setResendLoading(false);
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

          {message && (
            <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
              <strong className="block font-semibold">{message}</strong>
            </div>
          )}

          <form onSubmit={handleVerify}>
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
              <label htmlFor="verificationCode" className="block mb-2 text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
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
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Didn’t receive a code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-purple-600 hover:underline"
            >
              {resendLoading ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
 
      <div
        className="relative hidden md:flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 p-8 text-center text-white">
          <h2 className="text-4xl font-bold">Verify Your Email</h2>
          <p className="mt-4 text-lg">
            Please verify your email to continue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
