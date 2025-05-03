import React from 'react';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="flex w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Message Section */}
        <div className="w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="flex items-center mb-6">
            <img src={logo} alt="Swiftfund Logo" className="w-16 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>

          <div className="text-center">
            <h2 className="text-gray-800 font-semibold mb-2">✅ Registration successful!</h2>
            <p className="text-gray-600 mb-4">
              A verification link has been sent to your email address.
              <br />
              Please check your inbox and click the link to verify your account.
            </p>
          </div>
        </div>

        {/* Welcome/Login Section */}
        <div className="w-1/2 bg-orange-500 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome!</h2>
          <p className="mb-6">Already clicked the link?</p>
          <button
            onClick={() => navigate('/login')}
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