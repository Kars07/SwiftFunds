import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.trim(), password }),
        }
      );

      const data = await res.json();
      console.log('Backend response:', data);

      if (!res.ok || !data.user) {
        setErrorMessage(data?.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/2 p-10">
          <div className="flex items-center mb-6">
            <img src={logo} alt="SwiftFunds Logo" className="w-12 h-auto mr-3" />
            <h2 className="text-2xl font-bold text-black">Swiftfund</h2>
          </div>
          <h2 className="text-2xl font-bold text-orange-500 mb-2">Login</h2>
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
              <span className="ml-2 text-orange-500">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-6 border border-gray-300 w-full relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="ml-2 text-orange-500 cursor-pointer absolute right-3"
                onClick={togglePasswordVisibility}
              >
                <i className={showPassword ? 'bx bx-show' : 'bx bx-hide'}></i>
              </span>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                } bg-white border-2 border-orange-500 text-orange-500 font-bold py-2 px-4 rounded-lg w-1/2 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors duration-300`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <p className="text-center text-gray-500 mt-4">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-blue-500 hover:underline">
              Reset it here
            </Link>
          </p>
          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="w-1/2 bg-orange-500 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6">New to Swiftfund?</p>
          <Link to="/register">
            <button className="border-2 border-white py-2 px-4 rounded-lg hover:bg-white hover:text-blue-500">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;