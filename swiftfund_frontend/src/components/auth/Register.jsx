import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- Added Link
import logo from '../../assets/logo.png';

const Registration = () => {
  const [formData, setFormData] = useState({ fullname: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // <-- Added loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$*&])[A-Za-z\d@#$*&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setErrorMessage(
        'Password must include at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@, #, $, *, &).'
      );
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/verify-email');
      } else {
        setErrorMessage(data.message || data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/2 p-10">
          <div className="flex items-center mb-6">
            <img src={logo} alt="SwiftFunds Logo" className="w-13 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Sign Up</h2>
          <h4 className="text-gray-500 mb-6">Enter your details below to create an account</h4>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300 w-full">
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={formData.fullname}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-500">
                <i className="bx bxs-user"></i>
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300 w-full">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={formData.email}
                onChange={handleChange}
              />
              <span className="ml-2 text-gray-500">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300 w-full relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="ml-2 text-gray-500 cursor-pointer absolute right-3"
                onClick={togglePasswordVisibility}
              >
                <i className={showPassword ? 'bx bx-show' : 'bx bx-hide'}></i>
              </span>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
            <p className="text-gray-500 mb-6">
              <span className="text-orange-500">*</span> Your password should be a combination of capital and small letters, numbers, and special characters (@, #, $, *, &).
            </p>
            <button
              type="submit"
              disabled={loading}
              className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg w-full cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-500 my-4">or register with social platforms</p>
          <div className="flex justify-center space-x-6">
            <button className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-google text-orange-500 text-xl"></i>
            </button>
            <button className="bg-gray-100 hover:bg-orange-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-twitter text-orange-500 text-xl"></i>
            </button>
            <button className="bg-gray-100 hover:bg-orange-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-discord-alt text-orange-500 text-xl"></i>
            </button>
          </div>
        </div>

        <div className="w-1/2 bg-orange-600 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6">Already have an account?</p>
          <Link to="/login">
            <button className="border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-blue-500">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Registration;