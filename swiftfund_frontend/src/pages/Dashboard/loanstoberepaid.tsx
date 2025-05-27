import React, { useState, useEffect } from "react";
import { Address, LucidEvolution, WalletApi, validatorToAddress, PaymentKeyHash, SpendingValidator, UTxO, Redeemer, Data, credentialToAddress } from "@lucid-evolution/lucid";
import { useWallet } from "./Dashboard";
import CreditScoreGuide from "./CreditScoreGuide";

const FundRequestValidatorScript: SpendingValidator = {
    type: "PlutusV2",
    script: "59028801010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c8cc8966002602a00713259800980318089baa0018acc004c018c044dd5003c4ca60026eb8c0580064602e60300033016301337540109112cc006600266e3c00cdd7180c980b1baa001a50a51405115980099b87375a603260340086eb4c008c058dd5000c5660026644b30013232598009807000c528c566002602600313259800980a180d1baa3007301b3754603c60366ea8016266e24004012266e200040110191bad301d301a375400514a080c1018180c1baa001301b30183754603660306ea800a26464b3001300e0018a508acc004c04c006264b30013014301a3754600e60366ea8c01cc06cdd5002c4cdc4802000c4cdc4002000a032375a603a60346ea800a2945018203030183754002603660306ea8c010c060dd50014528202c3019301a301a301a301a301a301a301a3016375401c6eb4c064c068c068c068c058dd5000c56600264660020026eb0c068c06cc06cc06cc06cc06cc06cc06cc06cc05cdd5007912cc00400629422b30013371e6eb8c06c0040162946266004004603800280b101944cdd7980c980b1baa30193016375400a01914a080a22941014452820288a5040503012375401b16404116404064660020026eb0c054c048dd5005112cc004006298103d87a80008992cc004cdd7980b980a1baa00100a899ba548000cc0580052f5c113300300330180024048602c00280a22c8090dd698090009bae30120023012001300d375401116402c3009375400716401c300800130033754011149a26cac80081"
};

const FundLoanAddress: Address = validatorToAddress("Preprod", FundRequestValidatorScript);
const API_URL = "http://localhost:8080/Swiftfund/SwiftFunds/funded_loans.php";
type Connection = {
    api: WalletApi;
    lucid: LucidEvolution;
    address: Address;
    pkh: PaymentKeyHash;
};
type FundedLoan = {
    txId: string;
    outputIndex: number;
    lenderPKH: string;
    loanAmount: bigint;
    borrowerPKH?: string;
    interest?: bigint;
    deadline?: bigint;
    utxo: UTxO;
    fundedLoanId: string; // Unique identifier for this specific funded loan UTXO
    originalLoanId?: string; // Reference to the original loan request UTXO ID
    repaymentInfo?: {
        repaidAt: number;
        repaymentTxHash: string;
    };
};
// credit score data type
type CreditScoreData = {
    current_score: number;
    total_loans: number;
    on_time_payments: number;
    early_payments: number;
    late_payments: number;
};

//repayment response type
type RepaymentResponse = {
    status: string;
    message: string;
    creditScore?: number;
    paymentCategory?: string;
    paymentDetails?: {
        category: string;
        days: number;
        loan_duration: number;
    };
};
// API Response Types
type ApiBorrowerLoan = {
    loanId: string;
    fundedLoanId: string;
    lenderPKH: string;
    borrowerPKH: string;
    loanAmount: string;
    interest: string;
    deadline: string;
    txHash: string;
    isActive: boolean;
    repaymentInfo?: {
        repaidAt: number;
        repaymentTxHash: string;
    };
};

const fundloanredeemerschema = Data.Object({
    lenderPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
});
type redeemerType = Data.Static<typeof fundloanredeemerschema>;
const redeemerType = fundloanredeemerschema as unknown as redeemerType;
// Define repayment redeemer schema
const repayLoanRedeemerSchema = Data.Object({
    lenderPKH: Data.Bytes(),
    borrowerPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
    interest: Data.Integer(),
});
type RepayRedeemerType = Data.Static<typeof repayLoanRedeemerSchema>;
const RepayRedeemerType = repayLoanRedeemerSchema as unknown as RepayRedeemerType;
const LoanToBeRepaid: React.FC = () => {
    const { connection, wallets, connectWallet, isConnecting } = useWallet();    
    const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
    const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null);
    const [paymentFeedback, setPaymentFeedback] = useState<{
    category: string;
    details: string;
} | null>(null);
    const [showCreditScore, setShowCreditScore] = useState<boolean>(false);
    const [loansToRepay, setLoansToRepay] = useState<FundedLoan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingRepay, setLoadingRepay] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Create a unique identifier for a specific UTxO 
    function createUtxoId(txId: string, outputIndex: number): string {
        return `${txId}-${outputIndex}`;
    }
    // Effect to fetch loans when connection changes
    useEffect(() => {
        if (connection) {
            fetchLoansToRepay(connection);
            fetchCreditScore(connection.pkh); // Add this line
        }
    }, [connection]);
    // Fetch funded loans and filter those that need to be repaid
    async function fetchLoansToRepay(conn: Connection): Promise<void> {
        try {
            setIsLoading(true);
            const { lucid, pkh } = conn;
            // First, fetch all funded loans
            const allFundedLoans = await fetchFundedLoans(lucid);
            setFundedLoans(allFundedLoans);
            // Fetch borrower's loans from API
            const borrowerLoans = await fetchBorrowerLoansFromApi(pkh);
            // Filter to get only active loans (not repaid)
            const loansNeedingRepayment = borrowerLoans.filter(loan => 
                loan.isActive && !loan.repaymentInfo
            );
            console.log("Loans needing repayment:", loansNeedingRepayment);
            // converting API loans to FundedLoan format
            const activeBorrowerFundedLoans = await convertApiLoansToFundedLoans(loansNeedingRepayment, lucid);
            setLoansToRepay(activeBorrowerFundedLoans);
        } catch (error) {
            console.error("Error fetching loans to repay:", error);
            setError("Failed to fetch loans to repay. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    async function fetchBorrowerLoansFromApi(borrowerPKH: string): Promise<ApiBorrowerLoan[]> {
        try {
            const response = await fetch(`${API_URL}?action=getBorrowerLoans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ borrowerPKH }),
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return data.loans;
            } else {
                console.error("API error:", data.message);
                return [];
            }
        } catch (error) {
            console.error("Error fetching borrower loans from API:", error);
            return [];
        }
    }
    async function convertApiLoansToFundedLoans(apiLoans: ApiBorrowerLoan[], lucidInstance: LucidEvolution): Promise<FundedLoan[]> {
        // Get all UTXOs at fund loan address
        const fundedUtxos: UTxO[] = await lucidInstance.utxosAt(FundLoanAddress);
        const result: FundedLoan[] = [];   
        for (const loan of apiLoans) {
            // Find matching UTXO by txHash
            const matchingUtxo = fundedUtxos.find(utxo => utxo.txHash === loan.txHash);
            if (!matchingUtxo) continue;
            try {
                if (!matchingUtxo.datum) continue;
                const datumObject = Data.from(matchingUtxo.datum, redeemerType);
                result.push({
                    txId: matchingUtxo.txHash,
                    outputIndex: matchingUtxo.outputIndex,
                    lenderPKH: loan.lenderPKH,
                    loanAmount: BigInt(loan.loanAmount),
                    borrowerPKH: loan.borrowerPKH,
                    interest: BigInt(loan.interest),
                    deadline: BigInt(loan.deadline),
                    utxo: matchingUtxo,
                    fundedLoanId: loan.fundedLoanId,
                    originalLoanId: loan.loanId,
                    repaymentInfo: loan.repaymentInfo
                });
            } catch (error) {
                console.error("Error parsing funded loan datum:", error, "UTxO:", matchingUtxo);
            }
        }   
        return result;
    }
    async function fetchFundedLoans(lucidInstance: LucidEvolution): Promise<FundedLoan[]> {
        const fundedUtxos: UTxO[] = await lucidInstance.utxosAt(FundLoanAddress);
        console.log("UTXOs at fund loan address:", fundedUtxos);
        const fundedLoans: FundedLoan[] = [];
        for (const utxo of fundedUtxos) {
            if (!utxo.datum) continue;
            try {
                const datumObject = Data.from(utxo.datum, redeemerType);
                // Create unique identifier for this funded loan UTXO
                const fundedLoanId = createUtxoId(utxo.txHash, utxo.outputIndex);
                fundedLoans.push({
                    txId: utxo.txHash,
                    outputIndex: utxo.outputIndex,
                    lenderPKH: datumObject.lenderPKH,
                    loanAmount: datumObject.loanAmount,
                    utxo,
                    fundedLoanId
                });
            } catch (error) {
                console.error("Error parsing funded loan datum:", error, "UTxO:", utxo);
            }
        }
        return fundedLoans;
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

    // Repay loan function
    async function repayLoan(fundedLoan: FundedLoan): Promise<void> {
        if (!connection) {
            setError("Please connect your wallet first");
            return;
        }
        try {
            setError(null);
            setTxHash(null);
            setPaymentFeedback(null);
            setLoadingRepay(fundedLoan.fundedLoanId);   
            const { lucid, pkh } = connection;
            // Ensure we're the borrower
            if (fundedLoan.borrowerPKH !== pkh) {
                throw new Error("You are not the borrower of this loan");
            }
            // Create the repayment redeemer
            const repayRedeemer: RepayRedeemerType = {
                lenderPKH: fundedLoan.lenderPKH,
                borrowerPKH: pkh,
                loanAmount: fundedLoan.loanAmount,
                interest: fundedLoan.interest || BigInt(0)
            };
            
            const redeemerData: Redeemer = Data.to<RepayRedeemerType>(repayRedeemer, RepayRedeemerType);
            
            // Get the lender address from PKH
            const lenderAddressDetails = {
                paymentCredential: {
                    hash: fundedLoan.lenderPKH,
                    type: "Key" as const
                },
                stakeCredential: undefined,
                network: "Preprod" as const
            };
            
            const lenderAddress = credentialToAddress("Preprod", lenderAddressDetails.paymentCredential);
            
            console.log("Lender Address:", lenderAddress);
            console.log("Funded Loan UTXO:", fundedLoan.utxo);
            
            // Calculate total repayment amount (loan + interest)
            const repaymentAmount = fundedLoan.loanAmount + (fundedLoan.interest || BigInt(0));
            
            // Create and submit the transaction
            const tx = await lucid
                .newTx()
                .readFrom([fundedLoan.utxo])
                .addSignerKey(pkh)
                .attach.SpendingValidator(FundRequestValidatorScript)
                .pay.ToAddress(lenderAddress, { lovelace: repaymentAmount })
                .validFrom(Date.now() - 1000000)
                .complete();
            
            const signedTx = await tx.sign.withWallet().complete();
            const txHash = await signedTx.submit();
            
            console.log("Loan repaid successfully. Transaction hash:", txHash);
            setTxHash(txHash);

            // Refresh full credit score data after repayment
            setTimeout(() => {
                if (connection) {
                    fetchCreditScore(connection.pkh);
                }
            }, 2000);

            // After successful repayment, record it in the API 
            await recordLoanRepayment(fundedLoan.fundedLoanId, txHash);

            // Wait for a moment and then refresh the loan data
            setTimeout(() => {
                if (connection) {
                    fetchLoansToRepay(connection);
                }
            }, 10000);
            
        } catch (error) {
            console.error("Error repaying loan:", error);
            setError(`Failed to repay loan: ${error instanceof Error ? error.message : String(error)}`);
            setPaymentFeedback(null);
        } finally {
            setLoadingRepay(null);
        }
    }
    
async function recordLoanRepayment(fundedLoanId: string, repaymentTxHash: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}?action=repay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fundedLoanId,
                repaidAt: Date.now(),
                repaymentTxHash
            }),
        });       
        
        const data: RepaymentResponse = await response.json();
        
        if (data.status === 'success') {
            // Update credit score if provided
            if (data.creditScore) {
                // Refresh credit score data
                if (connection) {
                    await fetchCreditScore(connection.pkh);
                }
            }
            
            // Set payment feedback for user
            if (data.paymentDetails) {
                const { category, days, loan_duration } = data.paymentDetails;
                let feedbackMessage = '';
                
                switch (category) {
                    case 'early':
                        if (days >= loan_duration * 0.25) {
                            feedbackMessage = `Excellent! Very early repayment (+100 credit points)`;
                        } else if (days >= loan_duration * 0.50) {
                            feedbackMessage = `Great! Early repayment (+75 credit points)`;
                        } else {
                            feedbackMessage = `Good! Early repayment (+50 credit points)`;
                        }
                        break;
                    case 'on_time':
                        if (days >= loan_duration * 0.75) {
                            feedbackMessage = `Great! Well ahead of deadline (+50 credit points)`;
                        } else if (days > 5) {
                            feedbackMessage = `Good! Repaid with time to spare (+35 credit points)`;
                        } else if (days >= 1) {
                            feedbackMessage = `Nice! Repaid before deadline (+15 credit points)`;
                        } else {
                            feedbackMessage = `Repaid on deadline day (no credit penalty)`;
                        }
                        break;
                    case 'late':
                        if (days === 1) {
                            feedbackMessage = `1 day late (-5 credit points)`;
                        } else if (days <= 5) {
                            feedbackMessage = `${Math.round(days)} days late (-30 credit points)`;
                        } else {
                            feedbackMessage = `${Math.round(days)} days late (-50 credit points)`;
                        }
                        break;
                }
                
                setPaymentFeedback({
                    category,
                    details: feedbackMessage
                });
            }
        } else {
            console.error("API error when recording repayment:", data.message);
        }
    } catch (error) {
        console.error("Error recording loan repayment in API:", error);
    }
}
    
    // Format date
    function formatDate(timestamp: bigint): string {
        return new Date(Number(timestamp)).toLocaleString();
    }
    
    // Format lovelace to ADA
    function lovelaceToAda(lovelace: bigint): string {
        return (Number(lovelace) / 1_000_000).toFixed(6);
    }
    
    // Calculate days remaining until deadline
    function daysRemaining(deadline: bigint): number {
        const now = Date.now();
        const deadlineTime = Number(deadline);
        const diffMs = deadlineTime - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    // Check if a deadline is expired
    function isDeadlineExpired(deadline: bigint): boolean {
        return Number(deadline) < Date.now();
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

    return (
        <div className="p-4 pt-10">
            <div className="flex justify-between">
                <h1 className="text-3xl font-medium mb-6">Loans to Repay</h1>
                
                {/* Wallet Connection Status */}
                {!connection ? (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">Connect your wallet to view loans</h2>
                        <p className="text-gray-600 mb-3">Please connect your wallet in the sidebar to view and manage your loans.</p>
                    </div>
                ) : (
                    <div className="mb-6 p-4 -translate-y-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-zinc-800">
                            <span className="font-semibold">Connected with:</span> {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                        </p>
                    </div>
                )}
            </div> 
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            

{txHash && (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
            <span className="font-semibold">Loan Successfully Repaid!</span>
            <br />
            <span className="text-sm">Transaction Hash: {txHash}</span>
            
            {/* Payment feedback */}
            {paymentFeedback && (
                <div className="mt-3 p-3 bg-white rounded border-l-4 border-green-400">
                    <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            paymentFeedback.category === 'early' ? 'bg-blue-500' :
                            paymentFeedback.category === 'on_time' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-sm font-medium text-gray-700">
                            Payment Impact: {paymentFeedback.details}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Credit score update */}
            {creditScore && (
                <div className="mt-2 text-sm">
                    <span>Credit score updated to: </span>
                    <span className={`font-bold ml-1 ${getCreditScoreColor(creditScore.current_score)}`}>
                        {creditScore.current_score}
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getCreditScoreColor(creditScore.current_score)} bg-opacity-10`}>
                        {getCreditScoreLabel(creditScore.current_score)}
                    </span>
                </div>
            )}
        </p>
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
{connection && <CreditScoreGuide />}


            
            {/* Loans to Repay List */}
            <div className="mb-10 p-9 bg-white rounded-2xl mt-10 shadow-2xl">
                <h2 className="text-xl font-semibold mb-4">Your Active Loans to Repay</h2>
                
                {!connection ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Connect your wallet to view loans that need repayment.</p>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading loans to repay...</p>
                    </div>
                ) : loansToRepay.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No active loans found that need repayment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                        Total to Repay
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loansToRepay.map((loan) => {
                                    const interest = loan.interest || BigInt(0);
                                    const deadline = loan.deadline || BigInt(0);
                                    const totalToRepay = loan.loanAmount + interest;
                                    const isExpired = isDeadlineExpired(deadline);
                                    
                                    return (
                                        <tr key={loan.fundedLoanId} className={isExpired ? "bg-red-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {loan.lenderPKH.substring(0, 8)}...{loan.lenderPKH.substring(loan.lenderPKH.length - 8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loan.loanAmount)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(interest)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {lovelaceToAda(totalToRepay)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(deadline)}
                                                <br />
                                                {isExpired ? (
                                                    <span className="text-red-600 font-medium">
                                                        Expired!
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">
                                                        {daysRemaining(deadline)} days remaining
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {loan.fundedLoanId.substring(0, 8)}...
                                                {loan.originalLoanId && (
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        From loan: {loan.originalLoanId.substring(0, 8)}...
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => repayLoan(loan)}
                                                    disabled={loadingRepay === loan.fundedLoanId}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                                                >
                                                    {loadingRepay === loan.fundedLoanId ? "Processing..." : "Repay Loan"}
                                                </button>
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
export default LoanToBeRepaid;