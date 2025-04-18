import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Dashboard = () => {
  const [isNaira, setIsNaira] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(null);

  // Placeholder values since API calls are removed
  const [nairaBalance] = useState(5000); // Example default balance
  const [userName] = useState("User");  // Default user name
  const [userEmail] = useState("user@example.com"); // Default email

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=ngn');
        const data = await response.json();
        const rate = data.cardano.ngn;
        setExchangeRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate", error);
      }
    };

    fetchExchangeRate();
  }, []);

  const computedAdaBalance = exchangeRate ? (nairaBalance / exchangeRate).toFixed(2) : '...';

  const handleToggleCurrency = () => {
    setIsNaira(!isNaira);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-900 text-white p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <img src={logo} alt="Swiftfund Logo" className="w-12 h-auto" />
            <div className="text-lg font-bold">
              <span className="text-blue-500">Swiftfund</span>
            </div>
          </div>

          <nav>
            <ul className="space-y-5 cursor-pointer">
              <li className="flex items-center space-x-2 bg-blue-700 text-white py-2 px-3 rounded-md">
                <i className="bx bx-home text-lg"></i>
                <span>Home</span>
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md">
                <i className="bx bx-folder text-lg"></i>
                <span>Applications</span>
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md">
                <i className="bx bx-user text-lg"></i>
                <span>Customers</span>
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md">
                <i className="bx bx-money text-lg"></i>
                <span>Loans</span>
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md">
                <i className="bx bx-transfer text-lg"></i>
                <span>Transactions</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-4 space-y-3 cursor-pointer">
          <button className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md">
            <i className="bx bx-cog text-lg"></i>
            <span>Settings</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="mt-4 flex items-center bg-gray-800 py-2 px-3 rounded-md cursor-pointer">
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-2 flex-1">
            <h2 className="text-sm font-bold">{userName}</h2>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="text-gray-400 hover:text-white">
            <i className="bx bx-log-out text-lg"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-200 p-6">
        <div className="bg-gray-800 text-white p-4 rounded-md">
          <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
          <p>Access & manage your account effortlessly.</p>
        </div>

        <div className="mt-6 p-4 rounded-md shadow-md relative text-white bg-gradient-to-r from-blue-700 to-blue-900" style={{ width: "80%", margin: "1rem auto", marginRight: "13rem" }}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold cursor-pointer">Wallet Balance</h2>
            <div className="flex space-x-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1">
                <i className="bx bx-plus"></i>
                <span>Add Money</span>
              </button>
              <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded-md flex items-center space-x-1">
                <i className="bx bx-download"></i>
                <span>Withdraw Commission</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center space-x-7 mt-6 mr-120">
            <div className="p-4 text-center cursor-pointer" onClick={handleToggleCurrency}>
              <p className="text-sm text-gray-200">Total Balance</p>
              <p className={`font-bold text-white ${isNaira ? 'text-2xl' : 'text-xl'}`}>
                {isNaira ? `₦${nairaBalance}` : `${computedAdaBalance} ADA`}
              </p>
            </div>
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-200">Commission Balance</p>
              <p className="text-2xl font-bold text-white">₦0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
