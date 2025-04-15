import React from "react";
import logo from "../assets/logo.png"; 

const HeaderSection = () => {
  const currentDateTime = new Date().toLocaleString(); 

  const handleLaunchApp = () => {
    // Open the registration page in a new tab
    window.open("/register", "_blank");
  };

  const handleLearnMore = () => {
    // Open the registration page in a new tab
    window.open("/register", "_blank");
  };

  return (
    <div className="font-sans">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-sm py-2 flex justify-between items-center px-8">
        <div className="flex space-x-4">
          <span>📧 Info@swiftfund.com</span>
          <span className="hover:underline">|</span>
          <span>📞 +11(111)2345678</span>
        </div>

        {/* Social Links */}
        <div className="flex space-x-4 items-center bg-blue-700 px-4 py-2 rounded-lg">
          <a
            href="https://x.com/SwiftFund_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            <i className="bx bxl-twitter text-lg"></i>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            <i className="bx bxl-github text-lg"></i>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            <i className="bx bxl-instagram text-lg"></i>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            <i className="bx bxl-youtube text-lg"></i>
          </a>
        </div>

        {/* Current Date and Time */}
        <div className="text-white">
          {currentDateTime}
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto py-4 px-8 flex justify-between items-center">
          {/* Logo and App Name */}
          <div className="flex items-center text-2xl font-bold space-x-2">
            <img src={logo} alt="Swiftfund Logo" className="w-11 h-auto" />
            <span className="text-black">SWIFTFUND<span className="text-black">.</span></span>
          </div>

          {/* Nav Links */}
          <ul className="flex space-x-6 text-gray-700">
            <li className="hover:underline">Docs</li>
            <li className="hover:underline">About Us</li>
            <li className="hover:underline">
              Interest Rates<i className="bx bx-chevron-down"></i>
            </li>
            <li className="hover:underline">Documentation</li>
          </ul>

          {/* Action Button */}
          <div>
            <button
              onClick={handleLaunchApp}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Launch App
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-800 text-white text-center py-20">
        <h1 className="text-3xl lg:text-5xl font-extrabold mb-6">
          ONE LOAN AT A TIME : <br />
          CREATING AN INCLUSIVE WORLD WHERE <br />
          ALL CITIZENS ARE FINANCIALLY EMPOWERED <br />
          THROUGH PEER-TO-PEER LOANS<br />
        </h1>
        <div className="flex justify-center">
          <button
            onClick={handleLearnMore}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;