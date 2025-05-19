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
  const [showBorrowerActions, setShowBorrowerActions] = useState<boolean>(false);
  const [showLenderActions, setShowLenderActions] = useState<boolean>(false);
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

  const toggleBorrowerActions = () => {
    setShowBorrowerActions(!showBorrowerActions);
  };

  const toggleLenderActions = () => {
    setShowLenderActions(!showLenderActions);
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
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(
      typeof window !== "undefined" && window.innerWidth < 768
    );
  const toggleMenu = () => setMenuOpen(!menuOpen);

 
  return (
    <WalletContext.Provider value={walletContextValue}>
      <div className="flex flex-row  bg-gray-100">
        {isMobile && !menuOpen && (
          <button
            onClick={toggleMenu}
            className="fixed top-4 left-4 z-50 text-gray-900 text-2xl bg-opacity-20 backdrop-blur-md px-2 py-1"
          >
            ☰
          </button>
        )}
        {/* Sidebar */}
        <aside className={`w-[70vw]  md:w-1/5 z-10 bg-white text-white p-3 flex flex-col justify-between h-full overflow-hidden fixed   transform transition-transform duration-300 md:static ${
          isMobile ? "w-2/3 bg-white backdrop-blur-md" : "w-1/5"}
         ${menuOpen || !isMobile ? "translate-x-0" : "-translate-x-full"}`}
        >
         {isMobile && (
            <button
              onClick={toggleMenu}
              className="absolute top-4 pl-3 right-2 text-xl"
            >
               ✖
            </button>
          )}

          <div className="">
            <div className="flex items-center space-x-2 mb-10">
              <img src={logo} alt="Swiftfund Logo" className="w-7 h-auto" />
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
                    className="w-full text-xs px-2 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition flex items-center justify-between"
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

            <nav className="">
              <ul className="space-y-6 scroll-auto cursor-pointer">
                {/* Home */}
                <li
                  className="flex items-center  space-x-2 w-[200px] bg-orange-500 text-white py-3 px-6 rounded-full"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bx bx-home text-xl font-bold"></i>
                  <span className="">Home</span>
                </li>

                {/* Borrower Actions */}
                <li className="relative">
                  <div
                    className="flex items-center justify-between py-2 text-gray-700 px-6 hover:text-orange-600 rounded-md cursor-pointer w-full"
                    onClick={toggleBorrowerActions}
                  >
                    <div className="flex items-center space-x-2">
                      <i className="bx bx-user text-xl font-bold"></i>
                      <span>Borrower Actions</span>
                    </div>
                    <i
                      className={`bx bx-chevron-${
                        showBorrowerActions ? "up" : "down"
                      } text-lg`}
                    ></i>
                  </div>
                  {showBorrowerActions && (
                    <ul className="bg-gray-100 rounded-md overflow-hidden w-full">
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/applications")}
                      >
                        <i className="bx bx-folder text-lg"></i>
                        <span>Apply for Loan</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/myloan-applications")}
                      >
                        <i className="bx bx-edit text-lg"></i>
                        <span>My Loan Requests</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/loanstoberepaid")}
                      >
                        <i className="bx bx-transfer text-lg"></i>
                        <span>Repay Loan</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/loansirepaid")}
                      >
                        <i className="bx bx-refresh text-lg"></i>
                        <span>Repaid Loans</span>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Lender Actions */}
                <li className="relative">
                  <div
                    className="flex items-center justify-between py-2 text-gray-700 px-6 hover:text-orange-600 rounded-md cursor-pointer w-full"
                    onClick={toggleLenderActions}
                  >
                    <div className="flex items-center space-x-2">
                      <i className="bx bx-money text-xl font-bold"></i>
                      <span>Lender Actions</span>
                    </div>
                    <i
                      className={`bx bx-chevron-${
                        showLenderActions ? "up" : "down"
                      } text-lg`}
                    ></i>
                  </div>
                  {showLenderActions && (
                    <ul className="bg-gray-100 rounded-md overflow-hidden w-full">
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/fundaloan")}
                      >
                        <i className="bx bx-search text-lg"></i>
                        {/* <span>View Loan Requests</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/fundaloan")}
                      >
                        <i className="bx bx-wallet text-lg"></i> */}
                        <span>Fund a Loan</span>
                      </li>
                      <li
                        className="flex items-center space-x-2 px-4 py-2 text-black hover:text-orange-600 cursor-pointer"
                        onClick={() => navigate("/dashboard/loans-funded")}
                      >
                        <i className="bx bx-dollar-circle text-lg"></i>
                        <span>My Funded Loans</span>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Settings */}
                <li
                  className="flex items-center space-x-2 py-2 px-5 text-gray-700 hover:text-orange-600 rounded-md"
                  onClick={() => navigate("/dashboard/settings")}
                >
                  <i className="bx bx-cog text-xl font-bold"></i>
                  <span>Settings</span>
                </li>
              </ul>
            </nav>
          </div>

          {/* Sign Out */}
          <div className="mt-2 flex pt-30 items-center py-2 px-3">
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