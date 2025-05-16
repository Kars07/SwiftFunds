import React, { useState, useEffect } from "react";
import { Address, LucidEvolution, validatorToAddress, SpendingValidator, UTxO, Data } from "@lucid-evolution/lucid";
import { useWallet } from "./Dashboard"; 

const loanRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59030501010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cc0200092225980099b8748008c01cdd500144ca60026018003300c300d0019b87480012223322598009801800c566002601c6ea802600516403d15980099b874800800626464653001375a6028003375a6028007375a60280049112cc004c06001201116405430140013013001300e37540131640308060566002600260166ea800a33001300f300c37540052301030113011301130113011301130113011001911919800800801912cc00400629422b30013371e6eb8c04c00400e2946266004004602800280710112444b30013004300e375401513300137586004601e6ea8020dd7180918079baa0038999119912cc004c020c048dd5000c4cc88cc88c966002601a602e6ea8006264b30013370e9002180c1baa0018992cc004c03cc064dd5000c4c8c8c8ca60026eb4c0840066eb8c0840126eb4c08400e6eb4c0840092222598009813002c56600266e3cdd7181298111baa009375c604a60446ea805a2b30013370e6eb4c038c088dd50049bad30250138acc004cdc39bad300c302237540126eb4c0940462b30013370e6eb4c094c098c098c098c088dd50049bad3025302601189980a1bac3015302237540366eb8c094c088dd500b452820408a50408114a0810229410204590230c084004c080004c07c004c068dd5000c59018180e180c9baa0018b202e300230183754603660306ea80062c80b0cc01cdd61800980b9baa01025980099baf301b30183754603660306ea800400e266ebcc010c060dd50009802180c1baa30043018375400b14a080b0c060c054dd5180c180a9baa3001301537540044603260346034002602c60266ea80048c05cc0600062c8088c054008cc004dd6180a18089baa00a23375e602a60246ea8004024c03cdd5005111919800800801912cc0040062980103d87a80008992cc004c010006266e952000330160014bd7044cc00c00cc060009012180b000a02840348b2014300b375400e30083754005164018300800130033754011149a26cac80081"
};

const FundRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59028801010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c8cc8966002602a00713259800980318089baa0018acc004c018c044dd5003c4ca60026eb8c0580064602e60300033016301337540109112cc006600266e3c00cdd7180c980b1baa001a50a51405115980099b87375a603260340086eb4c008c058dd5000c5660026644b30013232598009807000c528c566002602600313259800980a180d1baa3007301b3754603c60366ea8016266e24004012266e200040110191bad301d301a375400514a080c1018180c1baa001301b30183754603660306ea800a26464b3001300e0018a508acc004c04c006264b30013014301a3754600e60366ea8c01cc06cdd5002c4cdc4802000c4cdc4002000a032375a603a60346ea800a2945018203030183754002603660306ea8c010c060dd50014528202c3019301a301a301a301a301a301a301a3016375401c6eb4c064c068c068c068c058dd5000c56600264660020026eb0c068c06cc06cc06cc06cc06cc06cc06cc06cc05cdd5007912cc00400629422b30013371e6eb8c06c0040162946266004004603800280b101944cdd7980c980b1baa30193016375400a01914a080a22941014452820288a5040503012375401b16404116404064660020026eb0c054c048dd5005112cc004006298103d87a80008992cc004cdd7980b980a1baa00100a899ba548000cc0580052f5c113300300330180024048602c00280a22c8090dd698090009bae30120023012001300d375401116402c3009375400716401c300800130033754011149a26cac80081"
};

const RepayRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59027201010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c966002602600513259800980218079baa0018acc004c010c03cdd5002c4cc89660026466446600400400244b30010018a508acc004cdc79bae30180010038a51899801001180c800a02640586eb0c058c05cc05cc05cc05cc05cc05cc05cc05cc04cdd50059bae30153012375400515980099b87375a602a60246ea8034cdc01bad3001301237540046eb4c054c058c058c048dd500145660026644b30013232598009805000c528c566002601e003132598009808180b1baa3006301737546034602e6ea8016266e24004012266e200040110151bad30193016375400514a080a1014180a1baa001301730143754602e60286ea800a26464b3001300a0018a508acc004c03c006264b3001301030163754600c602e6ea8c018c05cdd5002c4cdc4802000c4cdc4002000a02a375a6032602c6ea800a2945014202830143754002602e60286ea8c00cc050dd50014528202430153016301630163016301630163016301237540146eb4c054c058c058c058c048dd500144cdd7980a98091baa30153012375400601114a0808229410104528202030133010375400a46028602a00316403916403864660020026eb0c04cc040dd5004112cc004006298103d87a80008992cc004cdd7980a98091baa001008899ba548000cc0500052f5c113300300330160024040602800280922c8080dd6980880098069baa0088b201618049baa0038b200e180400098019baa0088a4d1365640041"
};


// Define addresses based on validators
const LoanRequestAddress: Address = validatorToAddress("Preprod", loanRequestValidatorScript);
const FundLoanAddress: Address = validatorToAddress("Preprod", FundRequestValidatorScript);
const RepayLoanAddress: Address = validatorToAddress("Preprod", RepayRequestValidatorScript);

// Define data schemas
const fundloanredeemerschema = Data.Object({
    lenderPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
});
type redeemerType = Data.Static<typeof fundloanredeemerschema>;
const redeemerType = fundloanredeemerschema as unknown as redeemerType;

// Define types for funded loan details - kept as is
type FundedLoanDetails = {
    loanId: string;                // Original loan request UTXO ID
    fundedLoanId: string;          // Funded loan UTXO ID
    fundedAt: number;              // Timestamp when loan was funded
    lenderPKH: string;             // Payment key hash of the lender (should match current user)
    borrowerPKH: string;           // Payment key hash of the borrower
    loanAmount: string;            // Loan amount in lovelace (as string)
    interest: string;              // Interest amount in lovelace (as string)
    deadline: string;              // Deadline timestamp (as string)
    txHash: string;                // Transaction hash of the funding transaction
    fundedWith: Array<{            // UTxO details used for funding
        txHash: string;
        outputIndex: number;
    }>;
    isActive: boolean;             // Whether the loan is still active (not repaid)
    repaymentInfo?: {              // Repayment details if loan has been repaid
        repaidAt: number;
        repaymentTxHash: string;
    };
};

const LoansFunded: React.FC = () => {
    // Use the wallet context instead of managing wallet connection locally
    const { connection, isConnecting } = useWallet();
    
    // Keep existing state variables
    const [fundedLoans, setFundedLoans] = useState<FundedLoanDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [debugInfo, setDebugInfo] = useState<string>("No errors");

    // Mark as initialized on component mount
    useEffect(() => {
        setInitialized(true);
    }, []);

    // Effect to refresh data periodically (every 60 seconds) - keep as is
    useEffect(() => {
        if (connection) {
            const intervalId = setInterval(() => {
                setRefreshTrigger(prev => prev + 1);
            }, 60000);
            
            return () => clearInterval(intervalId);
        }
    }, [connection]);

    // Load data when connection changes or refresh is triggered
    useEffect(() => {
        if (connection && initialized) {
            loadFundedLoansData(connection.pkh, connection.lucid);
        }
    }, [connection, initialized]);

    // Effect to reload data when refresh is triggered - keep as is
    useEffect(() => {
        if (connection && refreshTrigger > 0) {
            loadFundedLoansData(connection.pkh, connection.lucid);
        }
    }, [refreshTrigger, connection]);

    // Function to create unique identifier for UTxO - keep as is
    function createUtxoId(txHash: string, outputIndex: number): string {
        return `${txHash}-${outputIndex}`;
    }

    // Function to load funded loans data - keep as is
    async function loadFundedLoansData(userPkh: string, lucidInstance: LucidEvolution): Promise<void> {
        try {
            setIsLoading(true);
            setError(null);
            
            // Get funded loans tracking from localStorage
            let fundedLoansTracking;
            try {
                fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            } catch (error) {
                console.error("Error parsing fundedLoans from localStorage:", error);
                setDebugInfo(`Error parsing fundedLoans from localStorage: ${error instanceof Error ? error.message : String(error)}`);
                fundedLoansTracking = {};
            }
            
            // Get repaid loans tracking from localStorage
            let repaidLoansTracking;
            try {
                repaidLoansTracking = JSON.parse(localStorage.getItem('repaidLoans') || '{}');
            } catch (error) {
                console.error("Error parsing repaidLoans from localStorage:", error);
                setDebugInfo(`Error parsing repaidLoans from localStorage: ${error instanceof Error ? error.message : String(error)}`);
                repaidLoansTracking = {};
            }
            
            // Build funded loans list for the current user
            const userFundedLoans: FundedLoanDetails[] = [];
            
            for (const [loanId, loanData] of Object.entries(fundedLoansTracking)) {
                try {
                    const loanInfo = loanData as any;
                    
                    // Validate loan data before using it
                    if (!loanInfo || typeof loanInfo !== 'object') {
                        console.warn(`Skipping invalid loan data for loan ID ${loanId}`);
                        continue;
                    }
                    
                    // Only include loans funded by the current user
                    if (loanInfo.lenderPKH === userPkh) {
                        // Check if this loan has been repaid
                        const repaymentInfo = repaidLoansTracking[loanInfo.fundedLoanId];
                        
                        const fundedLoan: FundedLoanDetails = {
                            loanId,
                            fundedLoanId: loanInfo.fundedLoanId || loanId, // Fallback if missing
                            fundedAt: loanInfo.fundedAt || Date.now(), // Fallback if missing
                            lenderPKH: loanInfo.lenderPKH,
                            borrowerPKH: loanInfo.borrowerPKH || "unknown", // Fallback if missing
                            loanAmount: loanInfo.loanAmount || "0", // Fallback if missing
                            interest: loanInfo.interest || "0", // Fallback if missing
                            deadline: loanInfo.deadline || "0", // Fallback if missing
                            txHash: loanInfo.txHash || "", // Fallback if missing
                            fundedWith: Array.isArray(loanInfo.fundedWith) ? loanInfo.fundedWith : [],
                            isActive: !repaymentInfo,
                            repaymentInfo: repaymentInfo ? {
                                repaidAt: repaymentInfo.repaidAt || Date.now(),
                                repaymentTxHash: repaymentInfo.repaymentTxHash || ""
                            } : undefined
                        };
                        
                        userFundedLoans.push(fundedLoan);
                    }
                } catch (error) {
                    console.error(`Error processing loan ${loanId}:`, error);
                    setDebugInfo(`Error processing loan ${loanId}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            
            // Sort by funding date (newest first)
            userFundedLoans.sort((a, b) => b.fundedAt - a.fundedAt);
            
            // Store the initial data from localStorage first
            setFundedLoans(userFundedLoans);
            
            // Then verify against on-chain data to update status
            try {
                await verifyOnChainState(lucidInstance, userFundedLoans);
            } catch (error) {
                console.error("Error in verifyOnChainState:", error);
                setDebugInfo(`Error in verifyOnChainState: ${error instanceof Error ? error.message : String(error)}`);
            
            }
            
        } catch (error) {
            console.error("Error loading funded loans data:", error);
            setError("Failed to load funded loans data. Please try again.");
            setDebugInfo(`Error loading funded loans data: ${error instanceof Error ? error.message : String(error)}`);
          
        } finally {
            setIsLoading(false);
        }
    }

    // Function to verify on-chain state and update loan statuses - keep as is
    async function verifyOnChainState(lucidInstance: LucidEvolution, loans: FundedLoanDetails[]): Promise<void> {
        try {
            // Get all UTXOs at fund loan address and repay address
            let fundedUtxos: UTxO[] = [];
            let repaidUtxos: UTxO[] = [];
            
            try {
                fundedUtxos = await lucidInstance.utxosAt(FundLoanAddress);
            } catch (error) {
                console.error("Error fetching funded UTXOs:", error);
                setDebugInfo(`Error fetching funded UTXOs: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            try {
                repaidUtxos = await lucidInstance.utxosAt(RepayLoanAddress);
            } catch (error) {
                console.error("Error fetching repaid UTXOs:", error);
                setDebugInfo(`Error fetching repaid UTXOs: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            // Get repaid loans tracking from localStorage 
            let repaidLoansTracking;
            try {
                repaidLoansTracking = JSON.parse(localStorage.getItem('repaidLoans') || '{}');
            } catch (error) {
                console.error("Error parsing repaidLoans from localStorage:", error);
                repaidLoansTracking = {};
            }
            
            // Create a map of active funded loan UTXOs
            const activeFundedUTXOs = new Map<string, UTxO>();
            
            for (const utxo of fundedUtxos) {
                try {
                    const utxoId = createUtxoId(utxo.txHash, utxo.outputIndex);
                    activeFundedUTXOs.set(utxoId, utxo);
                } catch (error) {
                    console.error("Error processing funded UTXO:", error);
                }
            }
            
            // Process repay transactions to find any newly repaid loans
            for (const utxo of repaidUtxos) {
                try {
                    if (!utxo.datum) continue;
                    const repayTxs = utxo.txHash;  
                } catch (error) {
                    console.error("Error parsing repay datum:", error);
                }
            }
            
            // Update the loan statuses based on on-chain verification
            const updatedLoans = loans.map(loan => {
                try {
                    const isStillOnChain = activeFundedUTXOs.has(loan.fundedLoanId);
                    
                    // If the funded loan UTXO is not on-chain but we don't have repayment info,
                    // it might have been repaid but not yet tracked in localStorage
                    if (!isStillOnChain && loan.isActive) {
                        // Check if we have new repayment info
                        const repaymentInfo = repaidLoansTracking[loan.fundedLoanId];
                        
                        if (repaymentInfo) {
                            return {
                                ...loan,
                                isActive: false,
                                repaymentInfo: {
                                    repaidAt: repaymentInfo.repaidAt,
                                    repaymentTxHash: repaymentInfo.repaymentTxHash
                                }
                            };
                        } else {
                            // Mark as inactive without specific repayment info
                            // This could happen if the blockchain state changed but localStorage wasn't updated
                            return {
                                ...loan,
                                isActive: false
                            };
                        }
                    }
                    
                    return loan;
                } catch (error) {
                    console.error(`Error updating loan status for ${loan.fundedLoanId}:`, error);
                    // Return the original loan object unchanged
                    return loan;
                }
            });
            
            setFundedLoans(updatedLoans);
        } catch (error) {
            console.error("Error verifying on-chain state:", error);
            setDebugInfo(`Error verifying on-chain state: ${error instanceof Error ? error.message : String(error)}`);
            // Don't update loans state if there was an error
            throw error; // Rethrow to be caught by caller
        }
    }
    
    // Format lovelace to ADA - keep as is
    function lovelaceToAda(lovelace: string): string {
        try {
            return (Number(lovelace) / 1_000_000).toFixed(6);
        } catch (error) {
            console.error("Error converting lovelace to ADA:", error);
            return "0.000000";
        }
    }
    
    // Format date - keep as is
    function formatDate(timestamp: number): string {
        try {
            return new Date(timestamp).toLocaleString();
        } catch (error) {
            console.error("Error formatting date:", error);
            return "Invalid date";
        }
    }
    
    // Calculate total amount (loan + interest) - keep as is
    function calculateTotal(loanAmount: string, interest: string): string {
        try {
            return (Number(loanAmount) + Number(interest)).toString();
        } catch (error) {
            console.error("Error calculating total:", error);
            return "0";
        }
    }
    
    // Check if loan is overdue (past deadline) - keep as is
    function isOverdue(deadline: string): boolean {
        try {
            return Number(deadline) < Date.now();
        } catch (error) {
            console.error("Error checking if loan is overdue:", error);
            return false;
        }
    }
    
    // Calculate days until/past deadline - keep as is
    function daysFromDeadline(deadline: string): { days: number; isPast: boolean } {
        try {
            const now = Date.now();
            const deadlineTime = Number(deadline);
            const diffMs = Math.abs(deadlineTime - now);
            const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            return { days, isPast: deadlineTime < now };
        } catch (error) {
            console.error("Error calculating days from deadline:", error);
            return { days: 0, isPast: false };
        }
    }

    // Function to manually trigger a refresh - simplified to use context connection
    const handleManualRefresh = () => {
        if (connection) {
            setIsLoading(true);
            loadFundedLoansData(connection.pkh, connection.lucid);
        }
    };

    // Filter active and repaid loans - keep as is
    const activeLoans = fundedLoans.filter(loan => loan.isActive);
    const repaidLoans = fundedLoans.filter(loan => !loan.isActive);
    
    // If we're still initializing, show a loading indicator
    if (!initialized) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
                <p>Initializing application...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Loans I Have Funded</h1>
            
            {/* Debug Info - Can be removed in production */}
            {debugInfo !== "No errors" && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    <strong>Debug:</strong> {debugInfo}
                </div>
            )}
            
            {/* Wallet Connection Status - Simplified to use context */}
            {!connection ? (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Wallet Connection Required</h2>
                    <p className="text-gray-600">
                        Please connect your wallet using the sidebar wallet connection panel to view your funded loans.
                    </p>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-green-800">
                            <span className="font-semibold">Connected:</span> {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                        </p>
                        <button 
                            onClick={handleManualRefresh}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition flex items-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            
            {/* Summary Stats - Always show, but populate with zeros when not connected */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-700">Total Loans Funded</h3>
                    <p className="text-2xl font-bold text-blue-900">{connection ? fundedLoans.length : 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-700">Loans Repaid</h3>
                    <p className="text-2xl font-bold text-green-900">{connection ? repaidLoans.length : 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-700">Active Loans</h3>
                    <p className="text-2xl font-bold text-yellow-900">{connection ? activeLoans.length : 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-700">Overdue Loans</h3>
                    <p className="text-2xl font-bold text-purple-900">
                        {connection ? activeLoans.filter(l => isOverdue(l.deadline)).length : 0}
                    </p>
                </div>
            </div>
            
            {/* Loans Display - Always render the container, but show appropriate content based on connection and loading state */}
            <div className="space-y-8">
                {/* Active Loans Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md mr-2 text-sm">
                            {connection ? activeLoans.length : 0}
                        </span>
                        Active Loans
                    </h2>
                    
                    {!connection ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Connect your wallet to view your active loans.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-600">Loading your active loans...</p>
                        </div>
                    ) : activeLoans.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">You don't have any active funded loans.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Funded On
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Borrower
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expected Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deadline
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activeLoans.map((loan) => {
                                        try {
                                            const totalExpected = calculateTotal(loan.loanAmount, loan.interest);
                                            const deadline = daysFromDeadline(loan.deadline);
                                            const isLoanOverdue = isOverdue(loan.deadline);
                                            
                                            return (
                                                <tr key={loan.fundedLoanId} className={`hover:bg-gray-50 ${isLoanOverdue ? 'bg-red-50' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(loan.fundedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {loan.borrowerPKH.substring(0, 8)}...{loan.borrowerPKH.substring(loan.borrowerPKH.length - 8)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {lovelaceToAda(loan.loanAmount)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {lovelaceToAda(loan.interest)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {lovelaceToAda(totalExpected)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(Number(loan.deadline))}
                                                        <br />
                                                        <span className={`text-xs ${
                                                            isLoanOverdue ? 'text-red-600 font-semibold' : 'text-green-600'
                                                        }`}>
                                                            {isLoanOverdue 
                                                                ? `${deadline.days} days overdue`
                                                                : `${deadline.days} days remaining`
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                        <a 
                                                            href={`https://preprod.cardanoscan.io/transaction/${loan.txHash}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="hover:underline flex items-center"
                                                        >
                                                            <span className="text-xs">Funding: </span>
                                                            <span>{loan.txHash.substring(0, 8)}...</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                                            </svg>
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        {loan.fundedLoanId}
                                                    </td>
                                                </tr>
                                            );
                                        } catch (error) {
                                            return null;
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {/* Repaid Loans Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md mr-2 text-sm">
                            {connection ? repaidLoans.length : 0}
                        </span>
                        Repaid Loans
                    </h2>
                    {!connection ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Connect your wallet to view your repaid loans.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2 text-gray-600">Loading your repaid loans...</p>
                        </div>
                    ) : repaidLoans.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">You don't have any repaid loans yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Funded On
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Borrower
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expected Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Deadline
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Repaid On
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan ID
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {repaidLoans.map((loan) => {
                                        try {
                                            const totalExpected = calculateTotal(loan.loanAmount, loan.interest);
                                            return (
                                                <tr key={loan.fundedLoanId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(loan.fundedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {loan.borrowerPKH.substring(0, 8)}...{loan.borrowerPKH.substring(loan.borrowerPKH.length - 8)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {lovelaceToAda(loan.loanAmount)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {lovelaceToAda(loan.interest)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {lovelaceToAda(totalExpected)} ADA
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(Number(loan.deadline))}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {loan.repaymentInfo ? formatDate(loan.repaymentInfo.repaidAt) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                        {loan.repaymentInfo ? (
                                                            <a 
                                                                href={`https://preprod.cardanoscan.io/transaction/${loan.repaymentInfo.repaymentTxHash}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="hover:underline flex items-center"
                                                            >
                                                                <span className="text-xs">Repayment: </span>
                                                                <span>{loan.repaymentInfo.repaymentTxHash.substring(0, 8)}...</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                                                </svg>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        {loan.fundedLoanId}
                                                    </td>
                                                </tr>
                                            );
                                        } catch (error) {
                                            return null;
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoansFunded;