import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import logo from "../../assets/logo.png";
import default_profile from "../../assets/default_profile.png";

const Dashboard: React.FC = () => {
  const [isNaira, setIsNaira] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [nairaBalance] = useState<number>(5000);

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showLoanActions, setShowLoanActions] = useState<boolean>(false);
  const navigate = useNavigate();

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

  const computedAdaBalance = exchangeRate
    ? (nairaBalance / exchangeRate).toFixed(2)
    : "...";

  const handleToggleCurrency = () => {
    setIsNaira(!isNaira);
  };

  const handleLogout = async () => {
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

  return (
    <div className="flex flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-900 text-white p-3 flex flex-col justify-between h-full overflow-hidden">
        <div>
          <div className="flex items-center space-x-2 mb-10">
            <img src={logo} alt="Swiftfund Logo" className="w-12 h-auto" />
            <div className="text-lg font-bold">
              <span className="text-black-500">Swiftfund</span>
            </div>
          </div>

          <nav>
            <ul className="space-y-5 cursor-pointer">
              <li
                className="flex items-center space-x-2 bg-orange-700 text-white py-2 px-3 rounded-md"
                onClick={() => navigate("/dashboard")}
              >
                <i className="bx bx-home text-lg"></i>
                <span>Home</span>
              </li>
              <li 
                className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md"
                onClick={() => navigate("/dashboard/applications")}
              >
                <i className="bx bx-folder text-lg"></i>
                <span>Applications</span>
              </li>
              <li
                className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md"
                onClick={() => navigate("/dashboard/profile")}
              >
                <i className="bx bx-user text-lg"></i>
                <span>Profile</span>
              </li>

              {/* Loan Actions */}
              <li className="relative">
                <div
                  className="flex items-center justify-between hover:bg-gray-700 py-2 px-3 rounded-md cursor-pointer w-full"
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
                  <ul className="bg-gray-800 rounded-md overflow-hidden w-full">
                    <li
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate("/dashboard/loan-applications")}
                    >
                      <i className="bx bx-edit text-lg"></i>
                      <span>Loan Applications</span>
                    </li>
                    <li
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate("/dashboard/loans-funded")}
                    >
                      <i className="bx bx-dollar-circle text-lg"></i>
                      <span>Loans Funded</span>
                    </li>
                    <li
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate("/dashboard/loans-repaid")}
                    >
                      <i className="bx bx-refresh text-lg"></i>
                      <span>Loans Repaid</span>
                    </li>
                  </ul>
                )}
              </li>

              {/* Other Items */}
              <li
                className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md"
                onClick={() => navigate("/dashboard/transactions")}
              >
                <i className="bx bx-transfer text-lg"></i>
                <span>Transactions</span>
              </li>
              <li
                className="flex items-center space-x-2 hover:bg-gray-700 py-2 px-3 rounded-md"
                onClick={() => navigate("/dashboard/settings")}
              >
                <i className="bx bx-cog text-lg"></i>
                <span>Settings</span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Sign Out */}
        <div className="mt-4 flex items-center bg-gray-800 py-2 px-3 rounded-md">
          <img
            src={default_profile}
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-2 flex-1">
            <h2 className="text-sm font-bold">{userName}</h2>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <i className="bx bx-log-in text-lg"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-200 p-6 h-screen overflow-y-auto">
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
  );
};

export default Dashboard;