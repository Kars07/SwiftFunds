import React, { useState, useEffect } from "react";
import { Address, validatorToAddress, SpendingValidator } from "@lucid-evolution/lucid";
import { useWallet } from "./Dashboard";

type CreditScoreData = {
    current_score: number;
    total_loans: number;
    on_time_payments: number;
    early_payments: number;
    late_payments: number;
};
// Define the API URL
const API_URL = "http://localhost:8080/Swiftfund/SwiftFunds/funded_loans.php";

type RepaidLoan = {
    id: string;           // Unique ID for the repaid loan (fundedLoanId)
    data: {
        repaidAt: number; // Timestamp when the loan was repaid
        repaymentTxHash: string; // Transaction hash of the repayment
        loanAmount: string; // Original loan amount (as string)
        interest: string; // Interest amount (as string)
        originalLoanId?: string; // Reference to the original loan request UTXO ID
        lenderPKH: string; // Payment key hash of the lender
        borrowerPKH: string; // Payment key hash of the borrower
        deadline: string; // Loan deadline timestamp
        fundedAt: number; // When the loan was funded
        paymentCategory?: string; // 'early', 'on_time', or 'late'
        daysEarlyLate?: number; // Number of days early (negative) or late (positive)
    };
};

const LoansIRepaid: React.FC = () => {
    const { wallets, connection, isConnecting, connectWallet } = useWallet();
    const [repaidLoans, setRepaidLoans] = useState<RepaidLoan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null);
    const [showCreditScore, setShowCreditScore] = useState<boolean>(false);

    // Function to load repayments from the API
    async function loadRepaymentHistory(userPkh: string): Promise<void> {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${API_URL}?action=getBorrowerRepaidLoans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ borrowerPKH: userPkh }),
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setRepaidLoans(data.repaidLoans);
                
                if (data.repaidLoans.length === 0) {
                    console.log("No repaid loans found for this user");
                }
            } else {
                console.error("API error:", data.message);
                setError(`Failed to load repayment history: ${data.message}`);
            }
        } catch (error) {
            console.error("Error loading repayment history:", error);
            setError("Failed to load repayment history. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchCreditScore(userPKH: string): Promise<void> {
        try {
            const response = await fetch(`${API_URL}?action=getCreditScore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userPKH }),
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setCreditScore(data.creditScore);
            } else {
                console.error("Error fetching credit score:", data.message);
            }
        } catch (error) {
            console.error("Error fetching credit score:", error);
        }
    }
    
    // Load repayment history when a wallet is connected
    useEffect(() => {
        if (connection && connection.pkh) {
            loadRepaymentHistory(connection.pkh);
            fetchCreditScore(connection.pkh);
        }
    }, [connection]);
    
    // Handle wallet connection
    const handleConnectWallet = async (wallet: any) => {
        try {
            setError(null);
            await connectWallet(wallet);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError("Failed to connect wallet. Please try again.");
        }
    };
    
    // Format lovelace to ADA
    function lovelaceToAda(lovelace: string): string {
        return (Number(lovelace) / 1_000_000).toFixed(6);
    }
    
    // Format date
    function formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleString();
    }
    
    // Function to copy text to clipboard
    function copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text)
            .then(() => {
                alert("Transaction hash copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
            });
    }

    function getCreditScoreColor(score: number): string {
        if (score >= 750) return 'text-green-600';
        if (score >= 650) return 'text-blue-600';
        if (score >= 550) return 'text-yellow-600';
        return 'text-red-600';
    }

    // Function to get credit score label
    function getCreditScoreLabel(score: number): string {
        if (score >= 750) return 'Excellent';
        if (score >= 650) return 'Good';
        if (score >= 550) return 'Fair';
        return 'Poor';
    }

    // Function to get payment timing display
    function getPaymentTimingDisplay(paymentCategory?: string, daysEarlyLate?: number) {
        if (!paymentCategory) {
            return <span className="text-gray-400">N/A</span>;
        }

        const days = Math.abs(daysEarlyLate || 0);
        const daysText = days === 1 ? 'day' : 'days';

        switch (paymentCategory) {
            case 'early':
                return (
                    <div className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-green-700 font-medium">Early</span>
                        {days > 0 && (
                            <span className="text-green-600 text-xs ml-1">
                                ({days} {daysText})
                            </span>
                        )}
                    </div>
                );
            case 'on_time':
                return (
                    <div className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-blue-700 font-medium">On Time</span>
                    </div>
                );
            case 'late':
                return (
                    <div className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        <span className="text-red-700 font-medium">Late</span>
                        {days > 0 && (
                            <span className="text-red-600 text-xs ml-1">
                                ({days} {daysText})
                            </span>
                        )}
                    </div>
                );
            default:
                return <span className="text-gray-400">Unknown</span>;
        }
    }

    return (
        <div className=" p-4 pt-10">
            <div className="flex justify-between">
                <h1 className="text-3xl font-medium mb-6">Loans I Have Repaid</h1>
                
                {/* Wallet Connection */}
                {!connection ? (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">Connect your wallet</h2>
                        <div className="flex flex-wrap gap-2">
                            {wallets.map((wallet) => (
                                <button
                                    key={wallet.name}
                                    onClick={() => handleConnectWallet(wallet)}
                                    disabled={isConnecting}
                                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                                >
                                    {wallet.icon && (
                                        <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 mr-2" />
                                    )}
                                    {isConnecting ? "Connecting..." : `Connect ${wallet.name}`}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 -translate-y-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-zinc-800">
                            <span className="font-semibold">Connected:</span> {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                        </p>
                    </div>
                )}
            </div>    
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            {connection && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Credit Score</h3>
                            {creditScore ? (
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl font-bold ${getCreditScoreColor(creditScore.current_score)}`}>
                                        {creditScore.current_score}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${getCreditScoreColor(creditScore.current_score)} bg-opacity-10`}>
                                        {getCreditScoreLabel(creditScore.current_score)}
                                    </span>
                                </div>
                            ) : (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowCreditScore(!showCreditScore)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            {showCreditScore ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                    
                    {showCreditScore && creditScore && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-2 bg-white rounded">
                                <div className="font-semibold text-gray-600">Total Loans</div>
                                <div className="text-lg font-bold text-blue-600">{creditScore.total_loans}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                                <div className="font-semibold text-gray-600">On Time</div>
                                <div className="text-lg font-bold text-green-600">{creditScore.on_time_payments}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                                <div className="font-semibold text-gray-600">Early</div>
                                <div className="text-lg font-bold text-blue-600">{creditScore.early_payments}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                                <div className="font-semibold text-gray-600">Late</div>
                                <div className="text-lg font-bold text-red-600">{creditScore.late_payments}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Repaid Loans List */}
            <div className="mb-10 p-9 mt-10 bg-white rounded-2xl shadow-2xl">
                <h2 className="text-xl font-semibold mb-4">Your Repaid Loans</h2>
                
                {isLoading ? (
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
                                        Repaid On
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Repaid
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
                                {repaidLoans.map((repayment) => {
                                    const loanAmount = repayment.data.loanAmount;
                                    const interest = repayment.data.interest;
                                    const totalRepaid = (Number(loanAmount) + Number(interest)).toString();
                                    
                                    return (
                                        <tr key={repayment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(repayment.data.repaidAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getPaymentTimingDisplay(repayment.data.paymentCategory, repayment.data.daysEarlyLate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {repayment.data.lenderPKH.substring(0, 8)}...{repayment.data.lenderPKH.substring(repayment.data.lenderPKH.length - 8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loanAmount)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(interest)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {lovelaceToAda(totalRepaid)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                                <a 
                                                    href={`https://preprod.cardanoscan.io/transaction/${repayment.data.repaymentTxHash}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="hover:underline flex items-center"
                                                >
                                                    <span>{repayment.data.repaymentTxHash.substring(0, 8)}...</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                                    </svg>
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {repayment.id.substring(0, 8)}...
                                                {repayment.data.originalLoanId && (
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        From loan: {repayment.data.originalLoanId.substring(0, 8)}...
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoansIRepaid;