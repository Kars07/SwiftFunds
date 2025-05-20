import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import arrow from '../../assets/arrow.png'

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
    <div className=' bg-orange-50 h-[120vh] md:p-15 p-8'>
      <div className="flex items-center4 mb-">
        <img src={logo} alt="SwiftFunds Logo" className="w-8 h-auto mr-3" />
        <h2 className="text-2xl font-bold text-zinc-800">SWIFTFUND</h2>
      </div>
      <div className='flex md:flex-row flex-col w-full md:mt-20  mt-15 justify-between'>
        <div className=' font-bold text-zinc-800'>
         <h1 className='md:text-6xl text-5xl'>Welcome back!  </h1>
         <div className='flex '>
            <h2 className='text-2xl p-2'>Login to Continue</h2>
         </div>
        </div>
        <div className='bg-white mt-6 md:mt-0 rounded-2xl shadow-2xl p-12 md:w-[40%]'>
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
          <p className="text-center text-[14px] text-gray-500 mt-4">
            Forgot your password?{' '}
            <a href="/forgot-password" className="text-black hover:underline">Reset it here</a>
          </p>
          <p className="text-center text-[14px] text-gray-500 ">
            Don't have an account?{' '}
            <a href="/register" className="text-black hover:underline">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;