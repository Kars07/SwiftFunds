import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import logo from '../../assets/logo.png';

const Registration = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); // Add state to toggle password visibility
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validatePassword = (password) => {
    // Regex to enforce password rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$*&])[A-Za-z\d@#$*&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate the password
    if (!validatePassword(formData.password)) {
      setErrorMessage(
        'Password must include at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@, #, $, *, &).'
      );
      return;
    }

    // If validation passes, proceed with registration
    console.log('Registration successful:', formData);

    // After successful registration, navigate to the "Verify Email" page
    navigate('/verify-email');
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Registration Form */}
        <div className="w-1/2 p-10">
          <div className="flex items-center mb-6">
            <img src={logo} alt="SwiftFunds Logo" className="w-16 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Sign Up</h2>
          <h4 className="text-gray-500 mb-6">Enter your details below to create an account</h4>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300 w-full">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={formData.fullName}
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
                type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
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
                <i className={showPassword ? 'bx bx-show' : 'bx bx-hide'}></i> {/* Eye icon */}
              </span>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
            <p className="text-gray-500 mb-6">
              <span className="text-blue-500">*</span> Your password should be a combination of capital and small letters, numbers, and special characters (@, #, $, *, &).
            </p>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Register
            </button>
          </form>
          <p className="text-center text-gray-500 my-4">or register with social platforms</p>
          <div className="flex justify-center space-x-6">
            <button className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-google text-blue-500 text-xl"></i>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-twitter text-blue-500 text-xl"></i>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 shadow cursor-pointer">
              <i className="bx bxl-discord-alt text-blue-500 text-xl"></i>
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6">Already have an account?</p>
          <a href="/login">
            <button className="border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-blue-500">
              Login
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Registration;