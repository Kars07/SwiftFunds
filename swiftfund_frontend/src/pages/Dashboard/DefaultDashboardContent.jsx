import React, { useEffect, useState } from "react";

const DefaultDashboardContent = () => {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.fullname || "User");
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gray-800 text-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {userName} 👋</h1>
        <p className="text-gray-300 mt-2">Access & manage your account effortlessly.</p>
      </div>

      {/* Wallet Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl font-bold">Wallet Balance</h2>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
              <i className="bx bx-plus"></i>
              <span>Add Money</span>
            </button>
            <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center space-x-2">
              <i className="bx bx-download"></i>
              <span>Withdraw Amount</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-200">Total Balance (₦)</p>
            <p className="text-3xl font-bold text-white">₦5000</p>
          </div>
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-200">Total Balance (ADA) </p>
            <p className="text-3xl font-bold text-white">5.00A</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">Credit Score</p>
          <p className="text-3xl font-bold">200<span className="text-sm font-normal">/600</span></p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">Active Loans</p>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">Verification Level</p>
          <p className="text-3xl font-bold">Level 1</p>
          <a
            href="/kyc-verification"
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center justify-center mt-2"
          >
            KYC Verification 
            <i className="bx bx-chevron-right ml-1"></i>
          </a>
        </div>
      </div>

      {/* Placeholder for More Sections */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-dashed border-gray-300 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400 italic">
          More dashboard content coming soon...
        </p>
      </div>
    </div>
  );
};

export default DefaultDashboardContent;