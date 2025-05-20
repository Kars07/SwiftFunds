import React, { useState, useEffect } from "react";
import { Address, LucidEvolution, WalletApi, validatorToAddress, PaymentKeyHash, SpendingValidator, UTxO, Redeemer, Data, credentialToAddress } from "@lucid-evolution/lucid";
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
const LoanRequestAddress: Address = validatorToAddress("Preprod", loanRequestValidatorScript);
const FundLoanAddress: Address = validatorToAddress("Preprod", FundRequestValidatorScript);
const RepayLoanAddress: Address = validatorToAddress("Preprod", RepayRequestValidatorScript);


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
};

type RepaymentInfo = {
    repaidAt: number;
    repaymentTxHash: string;
};

// Define data schemas - same as in application.tsx
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
            
            // Get funded loans and repaid loans tracking from localStorage
            const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            const repaidLoansTracking = JSON.parse(localStorage.getItem('repaidLoans') || '{}');
            
            // Filter only loans that:
            // 1. Have the current user as borrower
            // 2. Have not been repaid yet (based on the unique fundedLoanId)
            const loansNeedingRepayment = allFundedLoans.filter(loan => {
                const trackingInfo = Object.values(fundedLoansTracking).find(
                    (info: any) => info.fundedLoanId === loan.fundedLoanId
                ) as any;
                
                if (!trackingInfo) return false;
                
                const isBorrower = trackingInfo.borrowerPKH === pkh;
                const isRepaid = repaidLoansTracking[loan.fundedLoanId];
                
                console.log(`Loan ${loan.fundedLoanId} - Borrower: ${isBorrower}, Repaid: ${isRepaid ? 'Yes' : 'No'}`);
                
                return isBorrower && !isRepaid;
            });
            
            console.log("Loans needing repayment:", loansNeedingRepayment);
            setLoansToRepay(loansNeedingRepayment);
            
        } catch (error) {
            console.error("Error fetching loans to repay:", error);
            setError("Failed to fetch loans to repay. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchFundedLoans(lucidInstance: LucidEvolution): Promise<FundedLoan[]> {
        const fundedUtxos: UTxO[] = await lucidInstance.utxosAt(FundLoanAddress);
        console.log("UTXOs at fund loan address:", fundedUtxos);
        
        const fundedLoans: FundedLoan[] = [];
        
        // Get funded loans tracking from localStorage
        const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
        
        for (const utxo of fundedUtxos) {
            if (!utxo.datum) continue;
            
            try {
                const datumObject = Data.from(utxo.datum, redeemerType);
                
                // Create unique identifier for this funded loan UTXO
                const fundedLoanId = createUtxoId(utxo.txHash, utxo.outputIndex);
                
                // Find the tracking information for this funded loan
                const trackingInfo = Object.values(fundedLoansTracking).find(
                    (info: any) => info.fundedLoanId === fundedLoanId
                ) as any;
                
                // If we have tracking info, use it to enrich our loan data
                let borrowerPKH, interest, deadline, originalLoanId;
                if (trackingInfo) {
                    borrowerPKH = trackingInfo.borrowerPKH;
                    interest = BigInt(trackingInfo.interest);
                    deadline = BigInt(trackingInfo.deadline);
                    originalLoanId = Object.keys(fundedLoansTracking).find(
                        key => fundedLoansTracking[key].fundedLoanId === fundedLoanId
                    );
                }
                
                fundedLoans.push({
                    txId: utxo.txHash,
                    outputIndex: utxo.outputIndex,
                    lenderPKH: datumObject.lenderPKH,
                    loanAmount: datumObject.loanAmount,
                    borrowerPKH,
                    interest,
                    deadline,
                    utxo,
                    fundedLoanId,
                    originalLoanId
                });
            } catch (error) {
                console.error("Error parsing funded loan datum:", error, "UTxO:", utxo);
            }
        }
        
        return fundedLoans;
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
            setLoadingRepay(fundedLoan.fundedLoanId);
            
            const { lucid, pkh } = connection;
            
            // Get tracking information for this loan from localStorage
            const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            const loanTrackingInfo = Object.values(fundedLoansTracking).find(
                (info: any) => info.fundedLoanId === fundedLoan.fundedLoanId
            ) as any;
            
            if (!loanTrackingInfo) {
                throw new Error("Cannot find tracking information for this loan");
            }
            
            // Ensure we're the borrower
            if (loanTrackingInfo.borrowerPKH !== pkh) {
                throw new Error("You are not the borrower of this loan");
            }
            
            // Create the repayment redeemer
            const repayRedeemer: RepayRedeemerType = {
                lenderPKH: fundedLoan.lenderPKH,
                borrowerPKH: pkh,
                loanAmount: fundedLoan.loanAmount,
                interest: BigInt(loanTrackingInfo.interest)
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
            const repaymentAmount = fundedLoan.loanAmount + BigInt(loanTrackingInfo.interest);
            
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
            
            // After successful repayment, track it in localStorage
            const repaidLoansTracking = JSON.parse(localStorage.getItem('repaidLoans') || '{}');
            
            // Use the fundedLoanId as the key for tracking repayments
            repaidLoansTracking[fundedLoan.fundedLoanId] = {
                repaidAt: Date.now(),
                repaymentTxHash: txHash,
                loanAmount: fundedLoan.loanAmount.toString(),
                interest: loanTrackingInfo.interest,
                originalLoanId: fundedLoan.originalLoanId
            };
            localStorage.setItem('repaidLoans', JSON.stringify(repaidLoansTracking));
            
            // Wait for a moment and then refresh the loan data
            setTimeout(() => {
                if (connection) {
                    fetchLoansToRepay(connection);
                }
            }, 10000);
            
        } catch (error) {
            console.error("Error repaying loan:", error);
            setError(`Failed to repay loan: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoadingRepay(null);
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

    return (
        <div className="md:p-4 pt-10">
            <div className="md:flex justify-between">
                <h1 className="text-3xl font-medium mb-6">Loans to Repay</h1>
                
                {/* Wallet Connection Status */}
                {!connection ? (
                    <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
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
                        <span className="font-semibold">Transaction submitted!</span>
                        <br />
                        Hash: {txHash}
                    </p>
                </div>
            )}
            
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
                                    // Get tracking information for this loan
                                    const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
                                    const loanTrackingInfo = Object.values(fundedLoansTracking).find(
                                        (info: any) => info.fundedLoanId === loan.fundedLoanId
                                    ) as any;
                                    
                                    const interest = loanTrackingInfo ? BigInt(loanTrackingInfo.interest) : BigInt(0);
                                    const deadline = loanTrackingInfo ? BigInt(loanTrackingInfo.deadline) : BigInt(0);
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