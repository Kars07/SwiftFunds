import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleLaunchApp = () => {
    window.open("/register", "_blank");
  };

  const navItems = [
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Docs", path: "/docs" },
    { label: "Support", path: null },
  ];

  return (
    <>
      <div className="bg-white/50 z-50 backdrop-blur-lg shadow-xl/20 fixed w-[90%] md:w-[80%] lg:w-[70%] top-4 left-1/2 transform -translate-x-1/2 rounded-2xl">
        <div className="flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center text-xl font-bold space-x-2">
            <img src={logo} alt="Swiftfund Logo" className="w-8 h-auto" />
            <span className="text-gray-800 font-dans">SWIFTFUND</span>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden lg:flex space-x-8 font-medium text-gray-900">
            {navItems.map(({ label, path }) => (
              <li key={label} className="transition-transform duration-200 ease-in-out hover:scale-110">
                {path ? (
                  <Link
                    to={path}
                    className="hover:text-gray-800 transform cursor-pointer text-gray-900"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="text-gray-900 cursor-default">{label}</span>
                )}
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <button
              onClick={handleLaunchApp}
              className="bg-orange-600 text-white font-bold py-2 px-4 rounded-4xl transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-orange-500 cursor-pointer"
            >
              Launch App
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <div className="lg:hidden">
            <button
              onClick={handleToggle}
              className="transition-transform duration-300 ease-in-out"
            >
              <div
                className={`transition-transform duration-500 ease-in-out ${
                  isOpen ? "rotate-90 scale-110 text-[#ea580c]" : "rotate-0 scale-100"
                }`}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden px-6 transition-all duration-500 ease-in-out transform origin-top ${
            isOpen
              ? "max-h-96 opacity-100 scale-100 translate-y-0"
              : "max-h-0 opacity-0 scale-95 -translate-y-5"
          } overflow-hidden`}
        >
          <ul className="flex flex-col space-y-4 text-black pt-4">
            {navItems.map(({ label, path }) => (
              <li key={label}>
                {path ? (
                  <Link
                    to={path}
                    className="cursor-pointer hover:scale-105 transition-transform duration-200 block text-[#ea580c]"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="block text-[#ea580c] cursor-default">{label}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <button
              onClick={handleLaunchApp}
              className="w-full bg-orange-600 text-white font-bold py-2 rounded-lg transition duration-300 ease-in-out hover:bg-orange-500"
            >
              Launch App
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;