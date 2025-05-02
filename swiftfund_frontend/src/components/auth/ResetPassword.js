import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      setSuccessMessage('');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      setSuccessMessage('');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: newPassword, token }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Your password has been reset successfully.');
        setErrorMessage('');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while resetting the password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
        <div className="container mx-auto py-4 px-8 flex items-center">
          <img src={logo} alt="Swiftfund Logo" className="w-12 h-auto" />
          <span className="ml-4 text-2xl font-bold text-black">SWIFTFUND</span>
        </div>
      </nav>

      <div className="flex flex-col justify-center items-center min-h-screen pt-24">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-orange-500">Create New Password</h2>
            <p className="text-gray-500">
              Enter your new password and confirm it to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="ml-2 text-orange-500 cursor-pointer"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <i className={showNewPassword ? 'bx bx-show' : 'bx bx-hide'}></i>
              </span>
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="ml-2 text-orange-500 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={showConfirmPassword ? 'bx bx-show' : 'bx bx-hide'}></i>
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
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;