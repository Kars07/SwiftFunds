import React, { useState } from 'react';
import logo from '../../assets/logo.png';

const VerifyEmail = () => {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add email verification logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Verify Email Section */}
        <div className="w-1/2 p-10">
          <div className="flex items-center mb-6">
            <img src={logo} alt="SwiftFunds Logo" className="w-16 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Verify Your Email</h2>
          <p className="text-gray-500 mb-6">
            A verification code has been sent to your email. Please enter the code below to verify your email address.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300 w-full">
              <input
                type="text"
                placeholder="Enter Verification Code"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <span className="ml-2 text-gray-500">
                <i className="bx bx-key"></i>
              </span>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Welcome Section */}
        <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome!</h2>
          <p className="mb-6">Already verified your email?</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-blue-500"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;