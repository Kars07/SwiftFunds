import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: Needed for session cookies
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      console.log('Backend response:', data);

      if (!res.ok || !data.user) {
        setErrorMessage(data?.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Save user data
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard
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
    <div className="flex justify-center items-center h-[100vh] bg-gray-100">
      <div className="flex w-[70%] max-w-5xl h-[80vh] bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/2 px-10 py-5">
          <div className="flex items-center mb-4">
            <img src={logo} alt="SwiftFunds Logo" className="w-8 h-auto mr-3" />
            <h2 className="text-xl font-bold text-black">SWIFTFUND</h2>
          </div>
          <h2 className="text-xl font-bold text-orange-600 ">Login</h2>
          <h4 className="text-gray-500  mb-6">Enter your details below to access your account</h4>
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
              <span className="ml-2 text-orange-600">
                <i className="bx bx-envelope"></i>
              </span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-2 border border-gray-300 w-full relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
                className="bg-transparent outline-none flex-grow text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="ml-2 text-orange-600 cursor-pointer absolute right-3"
                onClick={togglePasswordVisibility}
              >
                <i className={showPassword ? 'bx bx-show' : 'bx bx-hide'}></i>
              </span>
            </div>
            {errorMessage && <p className="text-red-600 text-[10px] mb-4">{errorMessage}</p>}
            <div className='flex justify-center items-center '>
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading ? 'bg-orange-500' : 'bg-orange-600 hover:bg-orange-600'
                } bg-white border-2 border-orange-600 text-orange-600 font-bold mt-2 py-2 px-4 rounded-3xl w-1/2  cursor-pointer hover:bg-orange-600 hover:text-white transition-colors duration-300 `}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <p className="text-center text-[13px] text-gray-500 mt-4">
            Forgot your password?{' '}
            <a href="/forgot-password" className="text-black hover:underline">Reset it here</a>
          </p>
          <p className="text-center text-[13px] text-gray-500 ">
            Don't have an account?{' '}
            <a href="/register" className="text-black hover:underline">Sign up here</a>
          </p>
        </div>

        {/* Welcome Section */}
        <div className="w-1/2 bg-orange-600 text-white flex flex-col justify-center items-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-6">New to Swiftfund?</p>
          <a href="/register">
            <button className="border-2 cursor-pointer border-white rounded-3xl font-bold py-2 px-6 transform transition duration-300 delay-100  hover:bg-white hover:text-orange-600">
              Sign Up
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;