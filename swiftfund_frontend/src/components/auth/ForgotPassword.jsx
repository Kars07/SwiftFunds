import React, { useState } from 'react';
import logo from '../../assets/logo.png'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add forgot password logic here
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
            <h2 className="text-2xl font-bold text-black">Reset your password</h2>
            <p className="text-gray-500">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300">
              <input
                type="email"
                placeholder="johndoe@mail.com"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="ml-2 text-gray-500">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Reset Password
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;