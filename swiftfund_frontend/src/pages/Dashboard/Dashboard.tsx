import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import default_profile from "../../assets/avatar-default.png";
import { Address, Blockfrost, Lucid, LucidEvolution, paymentCredentialOf, WalletApi, PaymentKeyHash } from "@lucid-evolution/lucid";
import Verification from "./Verification";

type Wallet = {
  name: string;
  icon: string;
  apiVersion: string;
  enable: () => Promise<WalletApi>;
  isEnabled: () => Promise<boolean>;
};

type Connection = {
  api: WalletApi;
  lucid: LucidEvolution;
  address: Address;
  pkh: PaymentKeyHash;
};

interface WalletContextType {
  wallets: Wallet[];
  connection: Connection | null;
  isConnecting: boolean;
  connectWallet: (wallet: Wallet) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Welcome Modal Component
const WelcomeModal: React.FC<{ 
  isOpen: boolean; 
  userName: string; 
  onClose: () => void; 
  onProceedKYC: () => void; 
}> = ({ isOpen, userName, onClose, onProceedKYC }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          <i className="bx bx-x"></i>
        </button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to SwiftFund Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Hello, <span className="font-semibold text-orange-600">{userName}</span>! 
          </p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <i className="bx bx-shield-check text-2xl text-orange-600"></i>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            KYC Verification Required
          </h2>
          <p className="text-gray-600 mb-4">
            Before you can make a loan request, you need to complete your KYC (Know Your Customer) verification. 
            This helps us ensure the security and compliance of our platform.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
          >
            Skip for Now
          </button>
          <button
            onClick={onProceedKYC}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-md"
          >
            <i className="bx bx-right-arrow-alt mr-2"></i>
            Proceed to KYC Verification
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Need help? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
};

// KYC Verification Modal Component
const KYCVerificationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}> = ({ isOpen, onClose, onComplete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >
          <i className="bx bx-x"></i>
        </button>
        
        <div className="p-6 h-full overflow-y-auto">
          {/* Your Verification component goes here */}
          <Verification 
            onComplete={onComplete}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [isNaira, setIsNaira] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [nairaBalance] = useState<number>(5000);

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showBorrowerActions, setShowBorrowerActions] = useState<boolean>(false);
  const [showLenderActions, setShowLenderActions] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showKYCModal, setShowKYCModal] = useState<boolean>(false); // New state for KYC modal
  const navigate = useNavigate();

  // Wallet state
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState<boolean>(false);

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=ngn"
        );
        const data = await response.json();
        const rate = data.cardano.ngn;
        setExchangeRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate", error);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.fullname || "User");
      setUserEmail(parsedUser.email || "user@example.com");
      
      // Check if welcome modal has been shown before
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeModal");
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      navigate("/login");
    }
  } else {
    navigate("/login");
  }
}, [navigate]);

  // Load available wallets
  useEffect(() => {
    function getWallets(): Wallet[] {
      const walletList: Wallet[] = [];
      const { cardano } = window as any;

      if (!cardano) {
        console.error("Cardano object not found. Please install a wallet extension.");
        return walletList;
      }

      for (const c in cardano) {
        const wallet = cardano[c];
        if (!wallet.apiVersion) continue;
        walletList.push(wallet);
      }

      return walletList.sort((l, r) => {
        return l.name.toUpperCase() < r.name.toUpperCase() ? -1 : 1;
      });
    }

    setWallets(getWallets());
  }, []);

  // Check for cached wallet connection
  useEffect(() => {
    const checkSavedConnection = async () => {
      const savedWalletName = localStorage.getItem("connected_wallet");
      if (savedWalletName && wallets.length > 0) {
        const wallet = wallets.find(w => w.name === savedWalletName);
        if (wallet) {
          try {
            const isEnabled = await wallet.isEnabled();
            if (isEnabled) {
              connectWallet(wallet);
            }
          } catch (error) {
            console.error("Failed to reconnect wallet:", error);
          }
        }
      }
    };

    if (wallets.length > 0) {
      checkSavedConnection();
    }
  }, [wallets]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    disconnectWallet();
    
    localStorage.removeItem("user");

    try {
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/users/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowLogoutModal(false);
      navigate("/login");
    }
  };

  const toggleBorrowerActions = () => {
    setShowBorrowerActions(!showBorrowerActions);
  };

  const toggleLenderActions = () => {
    setShowLenderActions(!showLenderActions);
  };

  const toggleWalletDropdown = () => {
    setShowWalletDropdown(!showWalletDropdown);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setMenuOpen(false);
  };

  // Handle KYC proceed button
  const handleProceedKYC = () => {
  setShowWelcomeModal(false);
  setShowKYCModal(true);
  // Mark that user has seen the welcome modal
  localStorage.setItem("hasSeenWelcomeModal", "true");
};

  // Handle closing welcome modal
  const handleCloseWelcomeModal = () => {
  setShowWelcomeModal(false);
  localStorage.setItem("hasSeenWelcomeModal", "true");
};
 
  // Handle KYC completion
  const handleKYCComplete = () => {
    setShowKYCModal(false);
    console.log("KYC verification completed!");
  };

  // Handle KYC modal close
  const handleCloseKYCModal = () => {
    setShowKYCModal(false);
  };

  // Wallet connect function
  const connectWallet = async (wallet: Wallet) => {
    try {
      setIsConnecting(true);
      setWalletError(null);
      
      const api = await wallet.enable();
      
      const lucid = await Lucid(
        new Blockfrost(
          "https://cardano-preprod.blockfrost.io/api/v0", 
          "preprodtJBS315srwdKRJldwtHxMqPJZplLRkCh"
        ), 
        "Preprod"
      );
      
      lucid.selectWallet.fromAPI(api);

      const address = await lucid.wallet().address();
      const pkh = paymentCredentialOf(address).hash;

      const conn = { api, lucid, address, pkh };
      setConnection(conn);
      
      // Save connection to localStorage
      localStorage.setItem("connected_wallet", wallet.name);
      
      // Close dropdown after connecting
      setShowWalletDropdown(false);
      
      console.log("Wallet connected successfully:", wallet.name);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setWalletError(`Failed to connect ${wallet.name}. Please try again.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Wallet disconnect function
  const disconnectWallet = () => {
    setConnection(null);
    localStorage.removeItem("connected_wallet");
  };

  // Create wallet context value
  const walletContextValue: WalletContextType = {
    wallets,
    connection,
    isConnecting,
    connectWallet,
    disconnectWallet
  };

return (
    <WalletContext.Provider value={walletContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 text-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 flex flex-row">
          {isMobile && !menuOpen && (
            <button
              onClick={toggleMenu}
              className="fixed top-4 left-4 z-50 text-gray-900 text-2xl bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-gray-200/50 hover:bg-white/30 transition-all duration-300"
            >
              ☰
            </button>
          )}
          
          {/* Sidebar */}
          <aside className={`w-[100vw] scroll-auto shadow-lg md:w-1/4 z-10 bg-white/60 backdrop-blur-xl border-r border-gray-200 text-white p-3 flex flex-col justify-between h-full md:h-[100vh] overflow-hidden fixed transform transition-transform duration-300 md:static ${
            isMobile ? "w-2/3 bg-white/80 backdrop-blur-xl " : "w-1/5"}
           ${menuOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}`}
          >
           {isMobile && (
              <button
                onClick={toggleMenu}
                className="absolute top-7 pl-3 right-2 text-xl hover:bg-gray-200/50 rounded-full p-1 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
              </button>
            )}

            <div>
              <div className="flex items-center md:pt-0 pt-4 space-x-2 mb-10">
                <img src={logo} alt="Swiftfund Logo" className="w-7 h-auto" />
                <div className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">SWIFTFUND</span>
                </div>
              </div>
 {/* /* Wallet Connection Status */ }
<div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-xl border border-gray-200 shadow-lg">
  <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center">
    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
    Wallet Connection
  </h3>
  {connection ? (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-mono bg-green-100/60 px-3 py-2 rounded-lg border border-green-200 flex-1 mr-3 truncate">
          {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
        </span>
      </div>
      <button 
        onClick={disconnectWallet}
        className="w-full text-xs px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 border border-red-200 hover:border-red-300 font-medium"
      >
        <i className="bx bx-log-out mr-1"></i>
        Disconnect Wallet
      </button>
    </div>
  ) : (
    <div className="space-y-2">
      {/* Simple wallet buttons without dropdown */}
      {!showWalletDropdown ? (
        <button
          onClick={toggleWalletDropdown}
          disabled={isConnecting}
          className="w-full text-xs px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-between disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          <i className="bx bx-chevron-down text-sm"></i>
        </button>
      ) : (
        <div className="space-y-2">
          {/* Back button */}
          <button
            onClick={toggleWalletDropdown}
            className="w-full text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 flex items-center"
          >
            <i className="bx bx-arrow-back text-sm mr-2"></i>
            Back
          </button>
          
          {/* Wallet options */}
          {wallets.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 px-2 py-1">Choose a wallet:</p>
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => {
                    connectWallet(wallet);
                    toggleWalletDropdown();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 flex items-center transition-all duration-300 rounded-lg border border-gray-200 hover:border-orange-300"
                >
                  {wallet.icon && (
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="w-4 h-4 mr-3 flex-shrink-0" 
                    />
                  )}
                  <span className="truncate">{wallet.name}</span>
                  <div className="ml-auto flex-shrink-0">
                    <i className="bx bx-chevron-right text-xs text-gray-400"></i>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center border border-gray-200 rounded-lg bg-gray-50/50">
              <i className="bx bx-wallet text-xl mb-2 block text-gray-400"></i>
              <p className="text-xs text-gray-500">No wallets detected</p>
              <p className="text-xs text-gray-400 mt-1">Install a wallet extension</p>
            </div>
          )}
        </div>
      )}
    </div>
  )}
  {walletError && (
    <div className="mt-3 p-3 bg-red-50/60 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <i className="bx bx-error-circle text-red-500 text-sm mr-2 mt-0.5 flex-shrink-0"></i>
        <p className="text-xs text-red-600 flex-1">{walletError}</p>
      </div>
    </div>
  )}
</div>

              <nav>
                <ul className="space-y-4 cursor-pointer">
                  {/* Home */}
                  <li
                    className="group flex items-center space-x-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleNavigation("/dashboard")}
                  >
                    <i className="bx bx-home text-xl font-bold group-hover:animate-pulse"></i>
                    <span>Home</span>
                  </li>

                 {/* Borrower Actions */}
                  <li className="relative">
                    <div
                      className="group flex items-center justify-between py-3 text-gray-700 px-6 hover:text-orange-600 rounded-2xl cursor-pointer w-full bg-white/40 backdrop-blur-xl border border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 transform hover:scale-105"
                      onClick={toggleBorrowerActions}
                    >
                      <div className="flex items-center space-x-3">
                        <i className="bx bx-user text-xl font-bold group-hover:text-orange-600"></i>
                        <span className="group-hover:text-orange-600">Borrower Actions</span>
                      </div>
                      <i
                        className={`bx bx-chevron-down text-lg transition-transform duration-300 ${
                          showBorrowerActions ? "rotate-180" : "rotate-0"
                        } group-hover:text-orange-600`}
                      ></i>
                    </div>

                    {/* Dropdown with slide animation */}
                    <div
                      className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
                        showBorrowerActions ? "max-h-60" : "max-h-0"
                      }`}
                    >
                      <ul className="mt-2 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg">
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 first:rounded-t-2xl"
                          onClick={() => handleNavigation("/dashboard/applications")}
                        >
                          <i className="bx bx-folder text-lg group-hover:text-orange-600"></i>
                          <span>Apply for Loan</span>
                        </li>
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300"
                          onClick={() => handleNavigation("/dashboard/myloan-applications")}
                        >
                          <i className="bx bx-edit text-lg group-hover:text-orange-600"></i>
                          <span>My Loan Requests</span>
                        </li>
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300"
                          onClick={() => handleNavigation("/dashboard/loanstoberepaid")}
                        >
                          <i className="bx bx-transfer text-lg group-hover:text-orange-600"></i>
                          <span>Repay Loan</span>
                        </li>
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 last:rounded-b-2xl"
                          onClick={() => handleNavigation("/dashboard/loansirepaid")}
                        >
                          <i className="bx bx-refresh text-lg group-hover:text-orange-600"></i>
                          <span>Repaid Loans</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {/* Lender Actions */}
                  <li className="relative">
                    <div
                      className="group flex items-center justify-between py-3 text-gray-700 px-6 hover:text-orange-600 rounded-2xl cursor-pointer w-full bg-white/40 backdrop-blur-xl border border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 transform hover:scale-105"
                      onClick={toggleLenderActions}
                    >
                      <div className="flex items-center space-x-3">
                        <i className="bx bx-money text-xl font-bold group-hover:text-orange-600"></i>
                        <span className="group-hover:text-orange-600">Lender Actions</span>
                      </div>
                      <i
                        className={`bx bx-chevron-down text-lg transition-transform duration-300 ${
                          showLenderActions ? "rotate-180" : "rotate-0"
                        } group-hover:text-orange-600`}
                      ></i>
                    </div>

                    {/* Dropdown with transition */}
                    <div
                      className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
                        showLenderActions ? "max-h-40" : "max-h-0"
                      }`}
                    >
                      <ul className="mt-2 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg">
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 first:rounded-t-2xl"
                          onClick={() => handleNavigation("/dashboard/fundaloan")}
                        >
                          <i className="bx bx-search text-lg group-hover:text-orange-600"></i>
                          <span>Fund a Loan</span>
                        </li>
                        <li
                          className="group flex items-center space-x-3 px-4 py-3 text-black hover:text-orange-600 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 last:rounded-b-2xl"
                          onClick={() => handleNavigation("/dashboard/loans-funded")}
                        >
                          <i className="bx bx-dollar-circle text-lg group-hover:text-orange-600"></i>
                          <span>My Funded Loans</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {/* Profile */}
                  <li
                    className="group flex items-center space-x-3 py-3 px-6 text-gray-700 hover:text-orange-600 rounded-2xl bg-white/40 backdrop-blur-xl border border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleNavigation("/dashboard/profile")}
                  >
                    <i className="bx bx-user text-xl font-bold group-hover:text-orange-600"></i>
                    <span>Profile</span>
                  </li>

                  {/* Settings */}
                  <li
                    className="group flex items-center space-x-3 py-3 px-6 text-gray-700 hover:text-orange-600 rounded-2xl bg-white/40 backdrop-blur-xl border border-gray-200 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-orange-100/80 transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleNavigation("/dashboard/settings")}
                  >
                    <i className="bx bx-cog text-xl font-bold group-hover:text-orange-600"></i>
                    <span>Settings</span>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Sign Out */}
            <div className="mt-2 flex pt-10 items-center py-5 px-3 bg-white/40 backdrop-blur-xl border border-gray-200 rounded-2xl">
              <img
                src={default_profile}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border-2 border-orange-300 shadow-lg"
              />
              <div className="ml-3 flex-1">
                <h2 className="text-sm text-black font-bold">{userName}</h2>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-gray-600 hover:text-orange-600 cursor-pointer bg-white/60 p-2 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 transform hover:scale-110"
              >
                <i className="bx bx-log-in text-xl"></i>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white/30 backdrop-blur-xl p-6 h-screen overflow-y-auto">
            <Outlet />
          </main>

          {/* Welcome Modal */}
          <WelcomeModal 
            isOpen={showWelcomeModal}
            userName={userName}
            onClose={handleCloseWelcomeModal}
            onProceedKYC={handleProceedKYC}
          />

          {/* KYC Verification Modal */}
          <KYCVerificationModal
            isOpen={showKYCModal}
            onClose={handleCloseKYCModal}
            onComplete={handleKYCComplete}
          />

          {/* Logout Confirmation Modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8 w-96 transform transition-all duration-300">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Confirm Logout
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to log out?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-6 py-3 bg-gray-200/80 backdrop-blur-xl text-gray-800 rounded-xl hover:bg-gray-300/80 transition-all duration-300 transform hover:scale-105 border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WalletContext.Provider>
  );
};

export default Dashboard;