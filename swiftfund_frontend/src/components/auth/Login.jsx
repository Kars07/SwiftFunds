import React, { useState } from 'react';
import logo from '../../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    console.log('Login details:', { email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Login Form */}
        <div className="w-1/2 p-10">
          <div className="flex items-center mb-6">
            <img src={logo} alt="SwiftFunds Logo" className="w-16 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Login</h2>
          <h4 className="text-gray-500 mb-6">Enter your details below to access your account</h4>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4 border border-gray-300 w-full">
              <input
                type="email"
                placeholder="Email"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="ml-2 text-gray-500">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300 w-full relative">
              <input
                type={showPassword ? 'text' : 'password'} // Toggle input type based on showPassword state
                placeholder="Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="ml-2 text-gray-500 cursor-pointer absolute right-3"
                onClick={togglePasswordVisibility}
              >
                <i className={showPassword ? 'bx bx-show' : 'bx bx-hide'}></i> {/* Eye icon */}
              </span>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full"
            >
              Login
            </button>
          </form>
          <p className="text-center text-gray-500 mt-4">
            Forgot your password?{' '}
            <a href="/forgot-password" className="text-blue-500 hover:underline">
              Reset it here
            </a>
          </p>
          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-500 hover:underline">
              Sign up here
            </a>
          </p>
        </div>

        {/* Welcome Section */}
        <div className="w-1/2 bg-blue-500 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6">New to Swiftfund?</p>
          <a href="/register">
            <button
              onClick={() => (window.location.href = '/register')}
              className="border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-blue-500"
            >
              Sign Up
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;