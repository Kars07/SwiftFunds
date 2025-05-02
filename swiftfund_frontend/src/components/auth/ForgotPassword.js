import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || 'We have sent you an email with instructions to reset your password.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrorMessage(data.message || 'This email address is not registered.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
        <div className="container mx-auto py-4 px-8 flex items-center">
          <img src={logo} alt="Swiftfund Logo" className="w-12 h-auto" />
          <span className="ml-4 text-2xl font-bold text-black">SWIFTFUND</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col justify-center items-center min-h-screen pt-24">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-500">Reset your password</h2>
            <p className="text-gray-500">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300">
              <input
                type="email"
                placeholder="youremail@example.com"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="ml-2 text-orange-500">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="bg-white border-2 border-orange-500 text-orange-500 font-bold py-2 px-4 rounded-lg w-1/2 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors duration-300"
              >
                Reset Password
              </button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;