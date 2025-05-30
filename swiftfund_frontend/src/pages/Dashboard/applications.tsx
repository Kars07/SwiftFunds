import React, { useState, useEffect } from "react";
import { Address, LucidEvolution, validatorToAddress, SpendingValidator, UTxO, Datum, Redeemer, Data, credentialToAddress } from "@lucid-evolution/lucid";
import { useWallet } from "./Dashboard";

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

// loan request fee constants (in lovelace)
const STANDARD_LOAN_FEE = BigInt(5_000_000); // 5 ADA in lovelace
const PREMIUM_LOAN_FEE = BigInt(10_000_000); // 10 ADA in lovelace
const MAX_LOAN_AMOUNT = 500000; // Maximum loan amount in Naira


const API_URL = "http://localhost:9000/funded_loans.php";

type CreditScoreData = {
    current_score: number;
    total_loans: number;
    on_time_payments: number;
    early_payments: number;
    late_payments: number;
};

// type LoanRequest = {
//     txId: string;
//     outputIndex: number;
//     borrowerPKH: string;
//     loanAmount: bigint;
//     interest: bigint;
//     deadline: bigint;
//     datumObject: any;
//     utxo: UTxO;
//     uniqueId: string; // Unique identifier for this specific loan request UTXO
// };

// type FundedLoan = {
//     txId: string;
//     outputIndex: number;
//     lenderPKH: string;
//     loanAmount: bigint;
//     borrowerPKH?: string;
//     interest?: bigint;
//     deadline?: bigint;
//     utxo: UTxO;
//     fundedLoanId: string; // Unique identifier for this specific funded loan UTXO
//     originalLoanId?: string; // Reference to the original loan request UTXO ID
// };
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

const Applications: React.FC = () => {
    const { connection, wallets, connectWallet, isConnecting } = useWallet();
    
    // Exchange rate state
    const [adaToNgnRate, setAdaToNgnRate] = useState<number>(0);
    
    // Credit score state
    const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null);
    const [loadingCreditScore, setLoadingCreditScore] = useState<boolean>(false);
    
    // Loan request form state - now in Naira
    const [loanAmountNaira, setLoanAmountNaira] = useState<number>(50000);
    const [interestNaira, setInterestNaira] = useState<number>(10000);
    const [deadlineDays, setDeadlineDays] = useState<number>(7);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputError, setInputError] = useState<{
        loanAmount?: string;
        interest?: string;
        deadline?: string;
    }>({});
    
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
                // Set a fallback rate if API fails (this should be updated with current rate)
                setAdaToNgnRate(400); // Fallback rate
            }
        };

        fetchExchangeRate();
        
        // Fetch exchange rate every 5 minutes
        const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Fetch credit score when wallet is connected
    async function fetchCreditScore(userPKH: string): Promise<void> {
        try {
            setLoadingCreditScore(true);
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
                // Set default credit score for new users
                setCreditScore({
                    current_score: 300,
                    total_loans: 0,
                    on_time_payments: 0,
                    early_payments: 0,
                    late_payments: 0
                });
            }
        } catch (error) {
            console.error("Error fetching credit score:", error);
            // Set default credit score for new users
            setCreditScore({
                current_score: 300,
                total_loans: 0,
                on_time_payments: 0,
                early_payments: 0,
                late_payments: 0
            });
        } finally {
            setLoadingCreditScore(false);
        }
    }

    // Load credit score when connection is established
    useEffect(() => {
        if (connection && connection.pkh) {
            fetchCreditScore(connection.pkh);
        }
    }, [connection]);

    // Get maximum loan amount based on credit score
    function getMaxLoanAmountByCreditScore(creditScore: number): number {
        if (creditScore >= 750) return MAX_LOAN_AMOUNT; // Excellent - can request any amount
        if (creditScore >= 650) return 100000; // Good - up to 100,000 naira
        if (creditScore >= 550) return 80000; // Fair - up to 80,000 naira
        return 40000; // Poor - up to 40,000 naira
    }

    // Get credit score color
    function getCreditScoreColor(score: number): string {
        if (score >= 750) return 'text-green-600';
        if (score >= 650) return 'text-blue-600';
        if (score >= 550) return 'text-yellow-600';
        return 'text-red-600';
    }

    // Get credit score label
    function getCreditScoreLabel(score: number): string {
        if (score >= 750) return 'Excellent';
        if (score >= 650) return 'Good';
        if (score >= 550) return 'Fair';
        return 'Poor';
    }

    // Get risk level
    function getRiskLevel(score: number): string {
        if (score >= 750) return 'Very Low Risk';
        if (score >= 650) return 'Low Risk';
        if (score >= 550) return 'Moderate Risk';
        return 'High Risk';
    }
    
    // Create a unique identifier for a specific UTxO
    function createUtxoId(txId: string, outputIndex: number): string {
        return `${txId}-${outputIndex}`;
    }

    // Convert Naira to ADA
    function nairaToAda(naira: number): number {
        if (adaToNgnRate === 0) return 0;
        return naira / adaToNgnRate;
    }
    
    // Convert Naira to lovelace
    function nairaToLovelace(naira: number): bigint {
        const ada = nairaToAda(naira);
        return BigInt(Math.round(ada * 1_000_000));
    }
    
    // Convert lovelace to ADA
    function lovelaceToAda(lovelace: bigint): number {
        return Number(lovelace) / 1_000_000;
    }
    
    // Convert lovelace to Naira
    function lovelaceToNaira(lovelace: bigint): number {
        const ada = lovelaceToAda(lovelace);
        return ada * adaToNgnRate;
    }
    
    // Format Naira currency
    function formatNaira(amount: number): string {
        return amount.toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }
    
    // Format ADA
    function formatAda(ada: number): string {
        return `${ada.toFixed(6)} ADA`;
    }

    // Determine loan request fee based on loan amount
    function getLoanRequestFee(loanAmountNaira: number): bigint {
        if (loanAmountNaira <= 100000) {
            return STANDARD_LOAN_FEE; // 5 ADA for Standard Loan
        } else if (loanAmountNaira <= 500000) {
            return PREMIUM_LOAN_FEE; // 10 ADA for Premium Loan
        } else {
            // This should not happen as we'll validate the amount in the UI
            throw new Error("Loan amount exceeds maximum allowed");
        }
    }

    // Get loan type name based on amount
    function getLoanTypeName(loanAmountNaira: number): string {
        if (loanAmountNaira <= 100000) {
            return "Standard Loan";
        } else {
            return "Premium Loan";
        }
    }

    // Handle loan amount change with validation
    function handleLoanAmountChange(value: number): void {
        // Clear previous input error
        setInputError(prev => ({ ...prev, loanAmount: undefined }));
        
        const maxAmount = creditScore ? getMaxLoanAmountByCreditScore(creditScore.current_score) : 40000;
        
        // Enforce credit score based limit
        if (value > maxAmount) {
            setInputError(prev => ({ 
                ...prev, 
                loanAmount: `Your credit score (${creditScore?.current_score || 'N/A'}) limits you to a maximum of ${formatNaira(maxAmount)}`
            }));
            // Still update the value to show user what they typed
            setLoanAmountNaira(value);
        } else {
            setLoanAmountNaira(value);
        }
    }

    // Create loan request function
    async function createLoanRequest(): Promise<void> {
        if (!connection) {
            setError("Please connect your wallet first");
            return;
        }

        if (adaToNgnRate === 0) {
            setError("Exchange rate not loaded. Please wait a moment and try again.");
            return;
        }

        if (!creditScore) {
            setError("Credit score not loaded. Please wait a moment and try again.");
            return;
        }

        // Validate loan amount
        if (loanAmountNaira <= 0) {
            setError("Loan amount must be greater than zero");
            return;
        }

        const maxAmount = getMaxLoanAmountByCreditScore(creditScore.current_score);
        
        // Check if loan amount exceeds credit score limit
        if (loanAmountNaira > maxAmount) {
            setError(`Your credit score (${creditScore.current_score}) limits you to a maximum loan of ${formatNaira(maxAmount)}`);
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            setTxHash(null);
            
            const { lucid, pkh } = connection;
            
            // Convert Naira amounts to lovelace
            const loanAmountLovelace = nairaToLovelace(loanAmountNaira);
            const interestLovelace = nairaToLovelace(interestNaira);
            
            // Get the appropriate loan request fee
            const LOAN_REQUEST_FEE = getLoanRequestFee(loanAmountNaira);
            
            // Create the deadline date
            const deadline: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * deadlineDays);
            
            // Create the datum
            const datum: BorrowerDatum = {
                borrowerPKH: pkh,
                loanAmount: loanAmountLovelace,
                interest: interestLovelace,
                deadline: BigInt(deadline.getTime()),
            };
            
            const dtm: Datum = Data.to<BorrowerDatum>(datum, BorrowerDatum);
            const SWIFTFUND_ADDRRESS = "addr_test1qrthkqeq2v9vkstw2mwkw6z97fvgvrq2gqj4hjvp5776fu5ly6hkduuy05uj2n0ww68x43z0cxpqqgfx38wclr45zt3q8kwyxs"
            
            // Create and submit the transaction
            const tx = await lucid
                .newTx()
                .attach.SpendingValidator(loanRequestValidatorScript)
                .pay.ToContract(LoanRequestAddress, { kind: "inline", value: dtm})
                .pay.ToAddress(SWIFTFUND_ADDRRESS, {lovelace: LOAN_REQUEST_FEE})
                .validFrom(Date.now() - 2592000)
                .complete();
                
            const signedTx = await tx.sign.withWallet().complete();
            const txHash = await signedTx.submit();
            
            console.log("Loan request submitted. Transaction hash:", txHash);
            setTxHash(txHash);
            
        } catch (error) {
            console.error("Error creating loan request:", error);
            setError("Failed to create loan request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    // Format date
    function formatDate(timestamp: bigint): string {
        return new Date(Number(timestamp)).toLocaleString();
    }
    
    // Calculate days remaining until deadline
    function daysRemaining(deadline: bigint): number {
        const now = Date.now();
        const deadlineTime = Number(deadline);
        const diffMs = deadlineTime - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 text-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-8 left-40 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative z-10 p-6 pt-16 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                <div className="mb-6 lg:mb-0">
                    <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent mb-4">
                        Loan Applications
                    </h1>
                    <p className="text-gray-600 text-lg">Submit your loan request to the decentralized lending ecosystem</p>
                </div>

                {/* Exchange Rate Display */}
                {adaToNgnRate > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                                <p className="text-gray-600 text-sm">Current ADA Rate</p>
                                <p className="text-orange-600 font-bold text-lg">{formatNaira(adaToNgnRate)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Wallet Connection Status */}
            {!connection ? (
                <div className="mb-8 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4 text-orange-600">Connect Wallet</h2>
                    <div className="flex flex-wrap gap-3">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => connectWallet(wallet)}
                                disabled={isConnecting}
                                className="group flex items-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50"
                            >
                                {wallet.icon && (
                                    <img src={wallet.icon} alt={wallet.name} className="w-5 h-5 mr-3 group-hover:animate-spin" />
                                )}
                                {isConnecting ? "Connecting..." : `Connect ${wallet.name}`}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mb-8 bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur-xl border border-green-200 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <p className="text-green-700 font-semibold">Wallet Connected</p>
                            <p className="text-gray-600 text-sm">
                                {connection.address.substring(0, 12)}...{connection.address.substring(connection.address.length - 12)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Score Display */}
            {connection && (
                <div className="mb-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border border-blue-200 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Credit Profile</h3>
                    {loadingCreditScore ? (
                        <div className="animate-pulse space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                                </div>
                            </div>
                        </div>
                    ) : creditScore ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-r ${
                                    creditScore.current_score >= 750 ? 'from-green-500 to-green-600' :
                                    creditScore.current_score >= 650 ? 'from-blue-500 to-blue-600' :
                                    creditScore.current_score >= 550 ? 'from-yellow-500 to-yellow-600' :
                                    'from-red-500 to-red-600'
                                }`}>
                                    {creditScore.current_score}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`px-4 py-2 rounded-xl text-lg font-bold ${getCreditScoreColor(creditScore.current_score)} bg-white/60 backdrop-blur-sm border border-white/40`}>
                                        {getCreditScoreLabel(creditScore.current_score)}
                                    </span>
                                    <span className="text-sm text-gray-600 mt-2">
                                        {getRiskLevel(creditScore.current_score)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        Maximum Loan Amount:
                                    </span>
                                    <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                                        {formatNaira(getMaxLoanAmountByCreditScore(creditScore.current_score))}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Based on your current credit score
                                </div>
                            </div>
                            
                            {creditScore.total_loans > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40 text-center">
                                        <div className="text-2xl font-bold text-green-600">{creditScore.on_time_payments}</div>
                                        <div className="text-sm text-gray-600">On Time</div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{creditScore.early_payments}</div>
                                        <div className="text-sm text-gray-600">Early</div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40 text-center">
                                        <div className="text-2xl font-bold text-red-600">{creditScore.late_payments}</div>
                                        <div className="text-sm text-gray-600">Late</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="text-gray-500">Unable to load credit score</div>
                        </div>
                    )}
                </div>
            )}

            {/* Status Messages */}
            {error && (
                <div className="mb-8 bg-gradient-to-r from-red-50/80 to-red-100/80 backdrop-blur-xl border border-red-200 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}
            
            {txHash && (
                <div className="mb-8 bg-gradient-to-r from-green-50/80 to-emerald-100/80 backdrop-blur-xl border border-green-200 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-green-700 font-semibold">Transaction Submitted Successfully!</p>
                    </div>
                    <p className="text-gray-600 text-sm break-all">Hash: {txHash}</p>
                </div>
            )}
            
            {/* Loading exchange rate indicator */}
            {adaToNgnRate === 0 && (
                <div className="mb-8 bg-gradient-to-r from-yellow-50/80 to-yellow-100/80 backdrop-blur-xl border border-yellow-200 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                        <div>
                            <p className="text-yellow-800 font-semibold">Loading exchange rates...</p>
                            <p className="text-yellow-700 text-sm">Please wait while we fetch the current ADA to Naira exchange rate.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Create Loan Request Form */}
            {connection && (
                <div className="bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                        <h2 className="text-3xl font-bold text-gray-800">Create Loan Request</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Loan Amount (Naira)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
                                <input
                                    type="number"
                                    value={loanAmountNaira}
                                    onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                                    className={`w-full pl-10 pr-4 py-4 bg-white/80 backdrop-blur-xl border ${
                                        inputError.loanAmount ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-orange-400'
                                    } rounded-xl transition-all duration-300 focus:ring-4 focus:ring-orange-100 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                    disabled={isSubmitting || adaToNgnRate === 0 || loadingCreditScore}
                                    min="0"
                                    max={creditScore ? getMaxLoanAmountByCreditScore(creditScore.current_score) : 40000}
                                    step="1000"
                                />
                            </div>
                            {adaToNgnRate > 0 && (
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500">≈ {formatAda(nairaToAda(loanAmountNaira))}</div>
                                    {creditScore && (
                                        <div className="text-sm text-blue-600">
                                            Max: {formatNaira(getMaxLoanAmountByCreditScore(creditScore.current_score))}
                                        </div>
                                    )}
                                    {inputError.loanAmount && (
                                        <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">
                                            {inputError.loanAmount}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Interest (Naira)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
                                <input
                                    type="number"
                                    value={interestNaira}
                                    onChange={(e) => setInterestNaira(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-4 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    disabled={isSubmitting || adaToNgnRate === 0}
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            {adaToNgnRate > 0 && (
                                <div className="text-sm text-gray-500">
                                    ≈ {formatAda(nairaToAda(interestNaira))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Deadline (Days)
                            </label>
                            <input
                                type="number"
                                value={deadlineDays}
                                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                                className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={isSubmitting}
                                min="1"
                                max="365"
                            />
                        </div>
                    </div>
                    
                    {/* Loan Summary */}
                    {adaToNgnRate > 0 && creditScore && (
                        <div className="mb-8 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                                Loan Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                                        <div className="text-sm text-gray-600">Loan Amount</div>
                                        <div className="text-xl font-bold text-orange-600">{formatNaira(loanAmountNaira)}</div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                                        <div className="text-sm text-gray-600">Interest</div>
                                        <div className="text-xl font-bold text-yellow-600">{formatNaira(interestNaira)}</div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-700">Total to Repay:</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                            {formatNaira(loanAmountNaira + interestNaira)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span>Interest Rate:</span>
                                        <span className="font-medium">{loanAmountNaira > 0 ? ((interestNaira / loanAmountNaira) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Total ADA equivalent: ≈ {formatAda(nairaToAda(loanAmountNaira + interestNaira))}
                                    </div>
                                </div>
                                
                                {/* Loan Type and Fee Information */}
                                <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Loan Type</div>
                                            <div className="font-semibold text-gray-800">
                                                {getLoanTypeName(Math.min(loanAmountNaira, getMaxLoanAmountByCreditScore(creditScore.current_score)))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Application Fee</div>
                                            <div className="font-semibold text-gray-800">
                                                {formatAda(lovelaceToAda(getLoanRequestFee(Math.min(loanAmountNaira, getMaxLoanAmountByCreditScore(creditScore.current_score)))))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={createLoanRequest}
                        disabled={
                            isSubmitting || 
                            adaToNgnRate === 0 || 
                            loadingCreditScore || 
                            !creditScore ||
                            (creditScore && loanAmountNaira > getMaxLoanAmountByCreditScore(creditScore.current_score))
                        }
                        className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Submitting...</span>
                            </div>
                        ) : adaToNgnRate === 0 ? "Loading rates..." :
                         loadingCreditScore ? "Loading credit score..." :
                         !creditScore ? "Credit score unavailable" :
                         (creditScore && loanAmountNaira > getMaxLoanAmountByCreditScore(creditScore.current_score)) ? 
                            "Amount exceeds credit limit" :
                         "Create Loan Request"}
                    </button>
                </div>
            )}
        </div>
    </div>
);
};

export default Applications;