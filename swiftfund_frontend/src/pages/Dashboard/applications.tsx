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

// Define loan request fee constants (in lovelace)
const STANDARD_LOAN_FEE = BigInt(5_000_000); // 5 ADA in lovelace
const PREMIUM_LOAN_FEE = BigInt(10_000_000); // 10 ADA in lovelace
const MAX_LOAN_AMOUNT = 500000; // Maximum loan amount in Naira

type LoanRequest = {
    txId: string;
    outputIndex: number;
    borrowerPKH: string;
    loanAmount: bigint;
    interest: bigint;
    deadline: bigint;
    datumObject: any;
    utxo: UTxO;
    uniqueId: string; // Unique identifier for this specific loan request UTXO
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
};


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
    const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
    const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingFund, setLoadingFund] = useState<string | null>(null);
    
    // Exchange rate state
    const [adaToNgnRate, setAdaToNgnRate] = useState<number>(0);
    
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
        
        // Enforce maximum limit
        if (value > MAX_LOAN_AMOUNT) {
            setInputError(prev => ({ 
                ...prev, 
                loanAmount: `Maximum loan amount is ${formatNaira(MAX_LOAN_AMOUNT)}`
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

        // Validate loan amount
        if (loanAmountNaira <= 0) {
            setError("Loan amount must be greater than zero");
            return;
        }

        // Check if loan amount exceeds maximum
        if (loanAmountNaira > MAX_LOAN_AMOUNT) {
            setError(`Loan amount cannot exceed ${formatNaira(MAX_LOAN_AMOUNT)}`);
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
        <div className="md:p-4  pt-10">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-medium mb-6">Loan Applications</h1>
                
                {/* Exchange Rate Display */}
                {adaToNgnRate > 0 && (
                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="font-medium">Current ADA Rate:</span> {formatNaira(adaToNgnRate)}
                    </div>
                )}
            </div>

            {/* Wallet Connection Status */}
            {!connection ? (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Connect your wallet :</h2>
                    <div className="flex flex-wrap gap-2">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => connectWallet(wallet)}
                                disabled={isConnecting}
                                className="flex items-center bg-black text-[13px] delay-100  hover:bg-orange-500 duration-200 cursor-pointer text-white px-4 py-2 rounded-2xl transition"
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
                <div className="mb-6 p-4  bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-zinc-800">
                        <span className="font-semibold">Connected:</span> {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                    </p>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}
            
            {txHash && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                        <span className="font-semibold">Transaction submitted!</span>
                        <br />
                        Hash: {txHash}
                    </p>
                </div>
            )}
            
            {/* Loading exchange rate indicator */}
            {adaToNgnRate === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                        <span className="font-semibold">Loading exchange rates...</span>
                        <br />
                        Please wait while we fetch the current ADA to Naira exchange rate.
                    </p>
                </div>
            )}
            
            {/* Create Loan Request Form */}
            {connection && (
                <div className="mb-10 p-9 mt-10 bg-white rounded-2xl shadow-2xl">
                    <h2 className="text-xl font-semibold mb-4">Create Loan Request</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loan Amount (Naira)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                <input
                                    type="number"
                                    value={loanAmountNaira}
                                    onChange={(e) => handleLoanAmountChange(Number(e.target.value))}
                                    className={`w-full pl-8 pr-3 py-2 border ${
                                        inputError.loanAmount ? 'border-red-500' : 'border-gray-300'
                                    } rounded-md appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                    disabled={isSubmitting || adaToNgnRate === 0}
                                    min="0"
                                    max={MAX_LOAN_AMOUNT}
                                    step="1000"
                                />
                            </div>
                            {adaToNgnRate > 0 && (
                                <div className="mt-1">
                                    <div className="text-xs text-gray-500">≈ {formatAda(nairaToAda(loanAmountNaira))}</div>
                                    {inputError.loanAmount && (
                                        <div className="text-red-500 text-sm font-medium mt-1">
                                            {inputError.loanAmount}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Interest (Naira)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                                <input
                                    type="number"
                                    value={interestNaira}
                                    onChange={(e) => setInterestNaira(Number(e.target.value))}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    disabled={isSubmitting || adaToNgnRate === 0}
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            {adaToNgnRate > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    <div>≈ {formatAda(nairaToAda(interestNaira))}</div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline (Days)
                            </label>
                            <input
                                type="number"
                                value={deadlineDays}
                                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={isSubmitting}
                                min="1"
                                max="365"
                            />
                        </div>
                    </div>
                    
                    {/* Loan Summary */}
                    {adaToNgnRate > 0 && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Loan Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Loan Amount:</span>
                                    <span className="font-medium">{formatNaira(loanAmountNaira)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Interest:</span>
                                    <span className="font-medium">{formatNaira(interestNaira)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="font-medium">Total to Repay:</span>
                                    <span className="font-bold text-lg">{formatNaira(loanAmountNaira + interestNaira)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Interest Rate:</span>
                                    <span>{loanAmountNaira > 0 ? ((interestNaira / loanAmountNaira) * 100).toFixed(1) : 0}%</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    <div>Total ADA equivalent: ≈ {formatAda(nairaToAda(loanAmountNaira + interestNaira))}</div>
                                </div>
                                
                                {/* Loan Type and Fee Information */}
                                <div className="mt-3 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between">
                                        <span>Loan Type:</span>
                                        <span className="font-medium">
                                            {getLoanTypeName(Math.min(loanAmountNaira, MAX_LOAN_AMOUNT))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Application Fee:</span>
                                        <span className="font-medium">
                                            {formatAda(lovelaceToAda(getLoanRequestFee(Math.min(loanAmountNaira, MAX_LOAN_AMOUNT))))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={createLoanRequest}
                        disabled={isSubmitting || adaToNgnRate === 0 || loanAmountNaira > MAX_LOAN_AMOUNT}
                        className="border-2 border-amber-600 text-[15px] cursor-pointer text-orange-600 hover:bg-orange-600 hover:shadow-lg font-medium delay-150 duration-200 hover:text-white px-6 py-3 rounded-3xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Submitting..." : 
                         adaToNgnRate === 0 ? "Loading rates..." : 
                         loanAmountNaira > MAX_LOAN_AMOUNT ? "Loan amount too high" :
                         "Create Loan Request"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Applications;