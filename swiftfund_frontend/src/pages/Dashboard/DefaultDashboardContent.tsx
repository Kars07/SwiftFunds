import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Address, LucidEvolution, SpendingValidator, validatorToAddress, WalletApi, UTxO, Data } from "@lucid-evolution/lucid";
import RepaymentTimelineChart from './RepaymentTimelineChart';
import default_profile from "../../assets/avatar-default.png";
import { useWallet } from "./Dashboard"; 

type Connection = {
  api: WalletApi;
  lucid: LucidEvolution;
  address: Address;
  pkh: string;
};

function shortenAddress(address: string, start = 6, end = 4) {
  if (!address) return "";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

const loanRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59030501010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cc0200092225980099b8748008c01cdd500144ca60026018003300c300d0019b87480012223322598009801800c566002601c6ea802600516403d15980099b874800800626464653001375a6028003375a6028007375a60280049112cc004c06001201116405430140013013001300e37540131640308060566002600260166ea800a33001300f300c37540052301030113011301130113011301130113011001911919800800801912cc00400629422b30013371e6eb8c04c00400e2946266004004602800280710112444b30013004300e375401513300137586004601e6ea8020dd7180918079baa0038999119912cc004c020c048dd5000c4cc88cc88c966002601a602e6ea8006264b30013370e9002180c1baa0018992cc004c03cc064dd5000c4c8c8c8ca60026eb4c0840066eb8c0840126eb4c08400e6eb4c0840092222598009813002c56600266e3cdd7181298111baa009375c604a60446ea805a2b30013370e6eb4c038c088dd50049bad30250138acc004cdc39bad300c302237540126eb4c0940462b30013370e6eb4c094c098c098c098c088dd50049bad3025302601189980a1bac3015302237540366eb8c094c088dd500b452820408a50408114a0810229410204590230c084004c080004c07c004c068dd5000c59018180e180c9baa0018b202e300230183754603660306ea80062c80b0cc01cdd61800980b9baa01025980099baf301b30183754603660306ea800400e266ebcc010c060dd50009802180c1baa30043018375400b14a080b0c060c054dd5180c180a9baa3001301537540044603260346034002602c60266ea80048c05cc0600062c8088c054008cc004dd6180a18089baa00a23375e602a60246ea8004024c03cdd5005111919800800801912cc0040062980103d87a80008992cc004c010006266e952000330160014bd7044cc00c00cc060009012180b000a02840348b2014300b375400e30083754005164018300800130033754011149a26cac80081"
};

const FundRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59028801010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c8cc8966002602a00713259800980318089baa0018acc004c018c044dd5003c4ca60026eb8c0580064602e60300033016301337540109112cc006600266e3c00cdd7180c980b1baa001a50a51405115980099b87375a603260340086eb4c008c058dd5000c5660026644b30013232598009807000c528c566002602600313259800980a180d1baa3007301b3754603c60366ea8016266e24004012266e200040110191bad301d301a375400514a080c1018180c1baa001301b30183754603660306ea800a26464b3001300e0018a508acc004c04c006264b30013014301a3754600e60366ea8c01cc06cdd5002c4cdc4802000c4cdc4002000a032375a603a60346ea800a2945018203030183754002603660306ea8c010c060dd50014528202c3019301a301a301a301a301a301a301a3016375401c6eb4c064c068c068c068c058dd5000c56600264660020026eb0c068c06cc06cc06cc06cc06cc06cc06cc06cc05cdd5007912cc00400629422b30013371e6eb8c06c0040162946266004004603800280b101944cdd7980c980b1baa30193016375400a01914a080a22941014452820288a5040503012375401b16404116404064660020026eb0c054c048dd5005112cc004006298103d87a80008992cc004cdd7980b980a1baa00100a899ba548000cc0580052f5c113300300330180024048602c00280a22c8090dd698090009bae30120023012001300d375401116402c3009375400716401c300800130033754011149a26cac80081"
};

const LoanRequestAddress: Address = validatorToAddress("Preprod", loanRequestValidatorScript);
const FundLoanAddress: Address = validatorToAddress("Preprod", FundRequestValidatorScript);

// Define data schemas
const loanRequestSchema = Data.Object({
  borrowerPKH: Data.Bytes(),
  loanAmount: Data.Integer(),
  interest: Data.Integer(),
  deadline: Data.Integer(),
});
type BorrowerDatum = Data.Static<typeof loanRequestSchema>;
const BorrowerDatum = loanRequestSchema as unknown as BorrowerDatum;

const fundloanredeemerschema = Data.Object({
  lenderPKH: Data.Bytes(),
  loanAmount: Data.Integer(),
});
type redeemerType = Data.Static<typeof fundloanredeemerschema>;
const redeemerType = fundloanredeemerschema as unknown as redeemerType;

const DefaultDashboardContent: React.FC = () => {
  // Use wallet context from Dashboard
  const { connection, wallets, isConnecting, connectWallet } = useWallet();
  
  const [adaToNgnRate, setAdaToNgnRate] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<bigint | null>(null);

  // Dynamic state variables
  const [activeLoans, setActiveLoans] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [pendingApproval, setPendingApproval] = useState<number>(0);
  const [totalRepaid, setTotalRepaid] = useState<number>(0);
  
  const [userName, setUserName] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
 
  const navigate = useNavigate();

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Fetch ADA to NGN rate
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=ngn"
        );
        const data = await response.json();
        const rate = data.cardano.ngn;
        setAdaToNgnRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate", error);
      }
    };

    fetchExchangeRate();
  }, []);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.fullname || "User");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch wallet balance and loan statistics when connection changes
  useEffect(() => {
    if (connection) {
      fetchWalletBalance();
      fetchAllLoanStatistics(connection);
    }
  }, [connection]);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    if (!connection) return;
    
    try {
      const utxos = await connection.lucid.wallet().getUtxos();
      const balance = utxos.reduce((acc, utxo) => {
        return acc + utxo.assets.lovelace;
      }, BigInt(0));
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  // Fetch all loan statistics including active loans, total applications, and pending approvals
  async function fetchAllLoanStatistics(conn: Connection): Promise<void> {
    try {
      const { lucid, pkh } = conn;
      
      // Get all loan requests from the script address
      const utxosAtScript: UTxO[] = await lucid.utxosAt(LoanRequestAddress);
      console.log("UTXOs at loan request address:", utxosAtScript);
      
      // Also get funded loans to check status
      const fundedUtxos: UTxO[] = await lucid.utxosAt(FundLoanAddress);
      console.log("UTXOs at fund loan address:", fundedUtxos);
      
      // Extract loanAmount from funded loans to check if a loan is funded
      const fundedLoanAmounts = new Set<string>();
      
      for (const utxo of fundedUtxos) {
        if (!utxo.datum) continue;
        
        try {
          const datumObject = Data.from(utxo.datum, redeemerType);
          fundedLoanAmounts.add(datumObject.loanAmount.toString());
        } catch (error) {
          console.error("Error parsing funded loan datum:", error);
        }
      }

      let userActiveLoans = 0;
      let userTotalApplications = 0;
      let userPendingApprovals = 0;
      
      for (const utxo of utxosAtScript) {
        if (!utxo.datum) continue;
        
        try {
          const datumObject = Data.from(utxo.datum, BorrowerDatum);
          
          // Check if this loan request belongs to the connected user
          if (datumObject.borrowerPKH === pkh) {
            // Count total applications by this user
            userTotalApplications++;
            
            // Check if this loan is active (not funded)
            const isActive = !fundedLoanAmounts.has(datumObject.loanAmount.toString());
            
            if (isActive) {
              userActiveLoans++;
              
              // Check if loan is not expired (pending approval)
              const now = BigInt(Date.now());
              if (datumObject.deadline > now) {
                userPendingApprovals++;
              }
            }
          }
        } catch (error) {
          console.error("Error parsing datum:", error, "UTxO:", utxo);
        }
      }

      // Load repaid loans from localStorage
      let userRepaidLoans = 0;
      try {
        const repaidLoansTracking = JSON.parse(localStorage.getItem('repaidLoans') || '{}');
        const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
        
        for (const [fundedLoanId, repaymentData] of Object.entries(repaidLoansTracking)) {
          const loanInfo = Object.values(fundedLoansTracking).find(
            (info: any) => info.fundedLoanId === fundedLoanId
          ) as any;
          
          // Only count if the user is the borrower
          if (loanInfo && loanInfo.borrowerPKH === pkh) {
            userRepaidLoans++;
          }
        }
      } catch (error) {
        console.error("Error loading repayment history:", error);
      }

      setActiveLoans(userActiveLoans);
      setTotalApplications(userTotalApplications);
      setPendingApproval(userPendingApprovals);
      setTotalRepaid(userRepaidLoans);
    } catch (error) {
      console.error("Error fetching loan statistics:", error);
    }
  }

  // Format lovelace to ADA
  function lovelaceToAda(lovelace: bigint | null): string {
    if (!lovelace) return "0";
    return (Number(lovelace) / 1_000_000).toFixed(2);
  }
  
  // Format ADA to NGN
  function adaToNgn(ada: string): string {
    if (!adaToNgnRate) return "0";
    return (parseFloat(ada) * adaToNgnRate).toFixed(2);
  }

  // Format wallet address for display
  function formatAddress(address: string | undefined): string {
    if (!address) return "";
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  }
  
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  return (
  <div>
    {/* Dashboard Header */}
    <div className="flex items-center justify-between mb-3 mt-3">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold mb-2 pt-5">Welcome, {userName} 👋</h1>
        <p className="text-gray-600 pb-8">Your personal loan management dashboard</p>
      </div>

      {/* User Actions Section */}
      <div className="">
        <div className="flex items-center absolute  right-0 mx-6 my-5  top-0 space-x-6">
          {/* Notification Icon */}
          <button className="relative text-gray-600  hover:text-gray-800" >
            <i className="bx bx-bell text-2xl"></i>
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings Icon */}
          <button className="text-gray-600 cursor-pointer hover:text-gray-800" onClick={() => navigate("/dashboard/settings")}>
            <i className="bx bx-cog text-2xl"></i>
          </button>

          {/* User Avatar */}
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <div className="flex items-center space-x-2">
              <img
                src={default_profile}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                ▼
              </button>
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 p-4">
              <p className="text-sm text-gray-600">Signed in as</p>
              <p className="font-medium">{userName || "User"}</p>
            
              {connection?.address && (
                <>
                  <hr className="my-2 border-gray-300" />
                  <p className="text-sm text-gray-600">Wallet Address:</p>
                  <p className="text-xs font-mono break-all text-blue-600">
                    {shortenAddress(connection.address)}
                  </p>
                </>
              )}
            </div>  
            )}
          </div>

        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Applications - Updated to show dynamic value */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
          <div className="bg-orange-100 text-orange-500 p-2 rounded-full">
            <i className="bx bx-file text-lg"></i>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{totalApplications}</p>
        <p className="text-sm text-blue-500 flex items-center mt-2">
          <i className="bx bx-info-circle mr-1"></i> All loan requests made
        </p>
      </div>

      {/* Active Loans - Updated to show dynamic value */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Active Loans</h3>
          <div className="bg-orange-100 text-orange-500 p-2 rounded-full">
            <i className="bx bx-money text-lg"></i>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{activeLoans}</p>
        <p className="text-sm text-green-500 flex items-center mt-2">
          <i className="bx bx-trending-up mr-1"></i> Not expired & unfunded
        </p>
      </div>

      {/* Pending Approval - Updated to show dynamic value */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
          <div className="bg-orange-100 text-orange-500 p-2 rounded-full">
            <i className="bx bx-time text-lg"></i>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{pendingApproval}</p>
        <p className="text-sm text-yellow-500 mt-2 flex items-center">
          <i className="bx bx-time mr-1"></i> Awaiting funding
        </p>
      </div>

      {/* Total Repaid */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Total Repaid</h3>
          <div className="bg-orange-100 text-orange-500 p-2 rounded-full">
            <i className="bx bx-check-circle text-lg"></i>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{totalRepaid}</p>
        <p className="text-sm text-green-500 mt-2 flex items-center">
          <i className="bx bx-trending-up mr-1"></i> Repaid Loans
        </p>
      </div>
    </div>

    {/* Wallet Balance Section */}
    <div className="bg-gradient-to-r  from-orange-500 to-orange-400 rounded-2xl shadow-xl p-4 md:p-6  mb-6 mt-9 max-w-3xl"> 
      <div className="flex justify-between  items-center mb-6">
        <div>
         <h2 className="text-lg font-semibold text-black">Wallet Balance</h2> <div className=" flex justify-center items-center flex-col text-black"><hr className="w-30 h-1 border-2 rounded-2xl bg-black"/></div>
        </div>
        {!connection ? (
          <div className="flex w-full justify-end flex-wrap gap-1">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => connectWallet(wallet)}
                disabled={isConnecting}
                className="flex items-center bg-black text-[13px]  delay-100  hover:text-orange-400 duration-200 cursor-pointer text-white px-4 py-1.5 rounded-2xl transition" 
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt={wallet.name} className="w-4 h-4 mr-1" /> 
                )}
                {isConnecting ? "Connecting..." : `Connect ${wallet.name}`}
              </button>
            ))}
          </div>
        ) : null}
      

        <div>
          {connection && (
            <div className="text-zinc-800 mb-3 pl-10">
              <p>
                <span className="font-semibold">Connected:</span> {formatAddress(connection.address)}
              </p>
            </div>
          )}
       </div>
     </div>
      <div className="grid grid-cols-2 gap-0">
        <div className="p-3 ">
          <p className="md:text-lg text-gray-700 mb-1">Total Balance (₦)</p> 
          <h3 className="md:text-xl text-lg font-bold text-black">
          ₦ {connection ? adaToNgn(lovelaceToAda(walletBalance)) : "0"}
          </h3>
        </div>

        <div className="bg-orange-300 p-3 rounded-md">
          <p className=" md:text-lg text-gray-700 mb-1">Total Balance (ADA)</p>
          <h3 className="md:text-xl text-lg font-bold text-black"> 
            {connection ? lovelaceToAda(walletBalance) : "0"} ADA
          </h3>
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">

      {/* Chart Section */}
      <div className="md:col-span-2 p-4">
        <RepaymentTimelineChart />
      </div>

      {/* Verification Status Section */}
      <div className="md:col-span-1 bg-white rounded-lg mt-4 shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Verification Status</h2>

        {/* KYC Level Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">KYC Level</span>
            <span className="text-sm text-gray-900 font-bold">Level 1</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="h-2 rounded-full bg-orange-400" style={{ width: "33%" }}></div>
          </div>
          <a href="#" className="text-orange-500 text-sm font-medium mt-2 inline-block">
            Upgrade to Level 2 →
          </a>
        </div>

        {/* Credit Reputation Score */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Credit Reputation Score</span>
            <span className="text-sm text-gray-900 font-bold">600</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: "10%" }}></div>
          </div>
          <div className="bg-green-100 text-green-800 text-sm p-2 mt-2 rounded-md shadow">
            <p className="font-medium">Good credit score</p>
            <p>You qualify for loans up to $20 with competitive interest rates.</p>
          </div>
        </div>

        {/* Verification Button for New Users */}
        <button className="bg-orange-500 text-white w-full py-3 mt-4 rounded-full hover:scale-105 cursor-pointer duration-300 hover:bg-orange-600 transition">
          Verify Your Account
        </button>
      </div>
    </div>

    
    <Outlet />
  </div>
  );
};
export default DefaultDashboardContent;