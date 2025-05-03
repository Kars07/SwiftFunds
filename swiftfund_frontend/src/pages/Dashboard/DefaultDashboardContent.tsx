import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    cardano?: any;
  }
}

const DefaultDashboardContent: React.FC = () => {
  const [userName, setUserName] = useState<string>("User");
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletName, setWalletName] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

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

  const handleWalletConnect = async (wallet: string) => {
    try {
      if (!window.cardano || !window.cardano[wallet]) {
        alert(`The selected wallet (${wallet}) is not installed.`);
        return;
      }

      const walletAPI = await window.cardano[wallet].enable();
      const addresses = await walletAPI.getUsedAddresses();

      if (addresses.length > 0) {
        const hexAddress = addresses[0];
        setWalletAddress(hexAddress);
        setWalletName(wallet);
        setWalletConnected(true);
        setShowWalletModal(false); // Close modal after connecting
      } else {
        alert("No address found in your wallet.");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Try again.");
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <>
            {/* Semi-transparent nice background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 w-80">
                <h2 className="text-2xl font-bold text-center">Select Wallet</h2>

                <div className="space-y-4">
                  <button
                    onClick={() => handleWalletConnect("nami")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md cursor-pointer"
                  >
                    Connect Nami
                  </button>
                  <button
                    onClick={() => handleWalletConnect("eternl")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md cursor-pointer"
                  >
                    Connect Eternl
                  </button>
                </div>

                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            {!walletConnected ? (
              <button
                onClick={() => setShowWalletModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 cursor-pointer"
              >
                <i className="bx bx-link"></i>
                <span>Connect Wallet</span>
              </button>
            ) : (
              <>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                  <i className="bx bx-plus"></i>
                  <span>Add Money</span>
                </button>
                <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                  <i className="bx bx-download"></i>
                  <span>Withdraw Amount</span>
                </button>
              </>
            )}
          </div>
        </div>

        {walletConnected && (
          <div className="mt-4 text-sm text-gray-300">
            Connected to <strong>{walletName}</strong> wallet: <br />
            <span className="break-words">{walletAddress}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-200">Total Balance (₦)</p>
            <p className="text-3xl font-bold text-white">₦0</p>
          </div>
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-200">Total Balance (ADA)</p>
            <p className="text-3xl font-bold text-white">0A</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">Credit Score</p>
          <p className="text-3xl font-bold">
            200<span className="text-sm font-normal">/600</span>
          </p>
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