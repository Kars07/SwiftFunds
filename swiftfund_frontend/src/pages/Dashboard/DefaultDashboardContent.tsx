import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import default_profile from "../../assets/default_profile.png";
import { Address, Blockfrost, Lucid, LucidEvolution, paymentCredentialOf, SpendingValidator, validatorToAddress, WalletApi, UTxO, Data } from "@lucid-evolution/lucid";

// Define types
type Wallet = {
  name: string;
  icon: string;
  apiVersion: string;
  enable(): Promise<WalletApi>;
  isEnabled(): Promise<boolean>;
};

type Connection = {
  api: WalletApi;
  lucid: LucidEvolution;
  address: Address;
  pkh: string;
};

type LoanRequest = {
  txId: string;
  outputIndex: number;
  borrowerPKH: string;
  loanAmount: bigint;
  interest: bigint;
  deadline: bigint;
  datumObject: any;
  utxo: any;
  isActive: boolean;
};

// Import validator scripts
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
  const [isNaira, setIsNaira] = useState<boolean>(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [adaToNgnRate, setAdaToNgnRate] = useState<number | null>(null);
  
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<bigint | null>(null);
  const [activeLoans, setActiveLoans] = useState<number>(0);

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const navigate = useNavigate();

  // Get available wallets
  useEffect(() => {
    function getWallets(): Wallet[] {
      const wallets: Wallet[] = [];
      const { cardano } = window as any;

      if (!cardano) {
        console.error("Cardano object not found. Please install a wallet extension.");
        return wallets;
      }

      for (const c in cardano) {
        const wallet = cardano[c];
        if (!wallet.apiVersion) continue;
        wallets.push(wallet);
      }

      return wallets.sort((l, r) => {
        return l.name.toUpperCase() < r.name.toUpperCase() ? -1 : 1;
      });
    }

    setWallets(getWallets());
  }, []);

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
        setExchangeRate(rate);
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
        setUserEmail(parsedUser.email || "user@example.com");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Connect wallet function
  async function connectWallet(wallet: Wallet): Promise<void> {
    try {
      setIsConnecting(true);
      const api = await wallet.enable();
      const lucid = await Lucid(new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodtJBS315srwdKRJldwtHxMqPJZplLRkCh"), "Preprod");
      lucid.selectWallet.fromAPI(api);

      const address = await lucid.wallet().address();
      const pkh = paymentCredentialOf(address).hash;

      const conn = { api, lucid, address, pkh };
      setConnection(conn);
      
      // Get wallet balance
      const utxos = await lucid.wallet().getUtxos();
      const balance = utxos.reduce((acc, utxo) => {
        return acc + utxo.assets.lovelace;
      }, BigInt(0));
      setWalletBalance(balance);
      
      // Fetch active loans
      await fetchActiveLoans(conn);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  }

  // Fetch active loans 
  async function fetchActiveLoans(conn: Connection): Promise<void> {
    try {
      const { lucid, pkh } = conn;
      
      // Get all loan requests from the script address
      const utxosAtScript: UTxO[] = await lucid.utxosAt(LoanRequestAddress);
      console.log("UTXOs at loan request address:", utxosAtScript);
      
      // Also get funded loans to check status
      const fundedUtxos: UTxO[] = await lucid.utxosAt(FundLoanAddress);
      console.log("UTXOs at fund loan address:", fundedUtxos);
      
      // Extract loanAmount from funded loans to check if a loan is active
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
      
      for (const utxo of utxosAtScript) {
        if (!utxo.datum) continue;
        
        try {
          const datumObject = Data.from(utxo.datum, BorrowerDatum);
          
          // Check if this loan request belongs to the connected user
          if (datumObject.borrowerPKH === pkh) {
            // Check if this loan is active (not funded)
            const isActive = !fundedLoanAmounts.has(datumObject.loanAmount.toString());
            
            // Only count active loans
            if (isActive) {
              userActiveLoans++;
            }
          }
        } catch (error) {
          console.error("Error parsing datum:", error, "UTxO:", utxo);
        }
      }

      setActiveLoans(userActiveLoans);
    } catch (error) {
      console.error("Error fetching active loans:", error);
    }
  }

  const handleToggleCurrency = () => {
    setIsNaira(!isNaira);
  };
  
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

  return (
    <>
      {/* Main content with Outlet */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {userName} 👋</h1>
        <p className="text-gray-600">Access & manage your account effortlessly.</p>
      </div>

      {/* Wallet Balance Section */}
      <div className="bg-blue-600 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Wallet Balance</h2>
          {!connection ? (
            <div className="flex flex-wrap gap-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => connectWallet(wallet)}
                  disabled={isConnecting}
                  className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                >
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 mr-2" />
                  )}
                  {isConnecting ? "Connecting..." : `Connect ${wallet.name}`}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={handleToggleCurrency}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
            >
              {isNaira ? "Show ADA" : "Show NGN"}
            </button>
          )}
        </div>

        {connection && (
          <div className="text-white mb-4">
            <p>
              <span className="font-semibold">Connected:</span> {formatAddress(connection.address)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-700 rounded-lg p-6">
            <p className="text-gray-300 mb-2">Total Balance {isNaira ? "(₦)" : "(ADA)"}</p>
            <h3 className="text-3xl font-bold text-white">
              {isNaira 
                ? `₦${connection ? adaToNgn(lovelaceToAda(walletBalance)) : "0"}`
                : `${connection ? lovelaceToAda(walletBalance) : "0"} ADA`}
            </h3>
          </div>
          <div className="bg-blue-700 rounded-lg p-6">
            <p className="text-gray-300 mb-2">Total Balance {!isNaira ? "(₦)" : "(ADA)"}</p>
            <h3 className="text-3xl font-bold text-white">
              {!isNaira 
                ? `₦${connection ? adaToNgn(lovelaceToAda(walletBalance)) : "0"}`
                : `${connection ? lovelaceToAda(walletBalance) : "0"} ADA`}
            </h3>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Credit Score</h2>
          <p className="text-4xl font-bold text-white">200<span className="text-gray-400 text-lg">/600</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Active Loans</h2>
          <p className="text-4xl font-bold text-white">{connection ? activeLoans : "0"}</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Verification Level</h2>
          <p className="text-4xl font-bold text-white">Level 1</p>
          <a href="#" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">KYC Verification &rarr;</a>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-center">
        <p className="text-gray-400 italic">More dashboard content coming soon...</p>
      </div>

      <Outlet />
    </>
  );
};

export default DefaultDashboardContent;