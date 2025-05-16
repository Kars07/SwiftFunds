import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import logo from "../../assets/logo.png";
import default_profile from "../../assets/avatar-default.png";
import { Address, Blockfrost, Lucid, LucidEvolution, paymentCredentialOf, WalletApi, PaymentKeyHash } from "@lucid-evolution/lucid";

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

const Dashboard: React.FC = () => {
  const [isNaira, setIsNaira] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [nairaBalance] = useState<number>(5000);

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showLoanActions, setShowLoanActions] = useState<boolean>(false);
  const navigate = useNavigate();

  // Wallet state
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState<boolean>(false);

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

  const toggleLoanActions = () => {
    setShowLoanActions(!showLoanActions);
  };

  const toggleWalletDropdown = () => {
    setShowWalletDropdown(!showWalletDropdown);
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
      <div className="flex flex-row h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-1/5 bg-white text-white p-3 flex flex-col justify-between h-full overflow-hidden">
          <div>
            <div className="flex items-center space-x-2 mb-10">
              <img src={logo} alt="Swiftfund Logo" className="w-10 h-auto" />
              <div className="text-2xl font-bold">
                <span className="text-black">SWIFTFUND</span>
              </div>
            </div>

            {/* Wallet Connection Status */}
            <div className="mb-6 px-3 py-2 rounded-md bg-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Wallet</h3>
              {connection ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                    </span>
                    <button 
                      onClick={disconnectWallet}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={toggleWalletDropdown}
                    disabled={isConnecting}
                    className="w-full text-xs px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition flex items-center justify-between"
                  >
                    <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
                    <i className={`bx bx-chevron-${showWalletDropdown ? "up" : "down"} text-sm`}></i>
                  </button>
                  
                  {/* Wallet Dropdown */}
                  {showWalletDropdown && !isConnecting && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {wallets.length > 0 ? (
                        wallets.map((wallet) => (
                          <button
                            key={wallet.name}
                            onClick={() => connectWallet(wallet)}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            {wallet.icon && (
                              <img src={wallet.icon} alt={wallet.name} className="w-4 h-4 mr-2" />
                            )}
                            {wallet.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-gray-500 text-center">
                          No wallets detected
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {walletError && (
                <p className="text-xs text-red-600 mt-1">{walletError}</p>
              )}
            </div>

            <nav>
              <ul className="space-y-6 cursor-pointer">
                <li
                  className="flex items-center space-x-2 bg-orange-500 text-white py-2 px-3 rounded-md"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bx bx-home text-lg"></i>
                  <span>Home</span>
                </li>
                <li
                  className="flex items-center space-x-2 py-2 px-3 text-gray-700 hover:text-orange-600"
                  onClick={() => navigate("/dashboard/applications")}
                >
                  <i className="bx bx-folder text-lg"></i>
                  <span>Applications</span>
                </li>
                {/* <li
                  className="flex items-center space-x-2 py-2 px-3 text-gray-700 hover:text-orange-600 rounded-md"
                  onClick={() => navigate("/dashboard/transactions")}
                >
                  <i className="bx bx-wallet text-lg"></i>
                  <span>Transactions</span>
                </li> */}

                {/* Loan Actions */}
                <li className="relative">
                  <div
                    className="flex items-center justify-between py-2 text-gray-700 px-3 hover:text-orange-600 rounded-md cursor-pointer w-full"
                    onClick={toggleLoanActions}
                  >
                    <div className="flex items-center space-x-2">
                      <i className="bx bx-money text-lg"></i>
                      <span>Loan Actions</span>
                    </div>
                    <i
                      className={`bx bx-chevron-${
                        showLoanActions ? "up" : "down"
                      } text-lg`}
                    ></i>
                  </div>
                  {showLoanActions && (
                    <ul className="bg-gray-100 rounded-md overflow-hidden w-full">
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/myloan-applications")}
                      >
                        <i className="bx bx-edit text-lg"></i>
                        <span>Loan Applications</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/loans-funded")}
                      >
                        <i className="bx bx-dollar-circle text-lg"></i>
                        <span>Loans Funded</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/loansirepaid")}
                      >
                        <i className="bx bx-refresh text-lg"></i>
                        <span>Loans Repaid</span>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Other Items */}
                <li
                  className="flex items-center space-x-2 py-2 px-3 text-gray-700 hover:text-orange-600 rounded-md"
                  onClick={() => navigate("/dashboard/loanstoberepaid")}
                >
                  <i className="bx bx-transfer text-lg"></i>
                  <span>Loans To Repay</span>
                </li>
                <li
                  className="flex items-center space-x-2 py-2 px-3 text-gray-700 hover:text-orange-600 rounded-md"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <i className="bx bx-cog text-lg"></i>
                  <span>Settings</span>
                </li>
              </ul>
            </nav>
          </div>

          {/* Sign Out */}
          <div className="mt-2 flex items-center py-2 px-3">
            <img
              src={default_profile}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-2 flex-1">
              <h2 className="text-ls text-black font-bold">{userName}</h2>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-gray-600 hover:text-gray-400 cursor-pointer"
            >
              <i className="bx bx-log-in text-2xl"></i>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white-100 p-6 h-screen overflow-y-auto">
          <Outlet />
        </main>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-96">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WalletContext.Provider>
  );
};

export default Dashboard;