import React, { useState, useEffect } from "react";
import { Address,  validatorToAddress, UTxO, Data, SpendingValidator } from "@lucid-evolution/lucid";
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
    status: "active" | "funded" | "expired"; // Status of the loan request
};

// Define data schemas
const loanRequestSchema = Data.Object({
    borrowerPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
    interest: Data.Integer(),
    deadline: Data.Integer(),
});
type BorrowerDatum = Data.Static<typeof loanRequestSchema>;
const BorrowerDatum = loanRequestSchema as unknown as BorrowerDatum;

const MyLoanApplications: React.FC = () => {
    const { connection } = useWallet(); // Use the wallet connection from context
    const [myLoanRequests, setMyLoanRequests] = useState<LoanRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Create a unique identifier for a specific UTxO
    function createUtxoId(txId: string, outputIndex: number): string {
        return `${txId}-${outputIndex}`;
    }

    // Effect to fetch loan requests when connection changes
    useEffect(() => {
        if (connection) {
            fetchMyLoanRequests(connection);
        }
    }, [connection]);

    // Fetch user's loan requests
    async function fetchMyLoanRequests(conn: any): Promise<void> {
        try {
            setIsLoading(true);
            setError(null);
            
            const { lucid, pkh } = conn;
            
            // Get all loan requests from script address
            const utxosAtScript: UTxO[] = await lucid.utxosAt(LoanRequestAddress);
            console.log("UTxOs at loan request address:", utxosAtScript);

            const requests: LoanRequest[] = [];
            const currentTime = Date.now();
            
            // Get funded loans tracking from localStorage
            const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            
            for (const utxo of utxosAtScript) {
                if (!utxo.datum) continue;
                
                try {
                    const datumObject = Data.from(utxo.datum, BorrowerDatum);
                    
                    // Create a unique identifier for this loan request UTXO
                    const loanId = createUtxoId(utxo.txHash, utxo.outputIndex);
                    
                    // Only process if the borrower PKH matches the current user's PKH
                    if (datumObject.borrowerPKH === pkh) {
                        // Determine loan status
                        let status: "active" | "funded" | "expired" = "active";
                        
                        // Check if loan is expired
                        if (Number(datumObject.deadline) < currentTime) {
                            status = "expired";
                        }
                        
                        // Check if loan is funded
                        if (fundedLoansTracking[loanId]) {
                            status = "funded";
                        }
                        
                        requests.push({
                            txId: utxo.txHash,
                            outputIndex: utxo.outputIndex,
                            borrowerPKH: datumObject.borrowerPKH,
                            loanAmount: datumObject.loanAmount,
                            interest: datumObject.interest,
                            deadline: datumObject.deadline,
                            datumObject,
                            utxo,
                            uniqueId: loanId,
                            status
                        });
                    }
                } catch (error) {
                    console.error("Error parsing datum:", error, "UTxO:", utxo);
                }
            }

            // Sort by status (active first, then funded, then expired) and then by deadline (ascending)
            requests.sort((a, b) => {
                // Sort by status
                const statusOrder = { active: 0, funded: 1, expired: 2 };
                const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                if (statusDiff !== 0) return statusDiff;
                
                // If same status, sort by deadline (most urgent first)
                return Number(a.deadline) - Number(b.deadline);
            });

            setMyLoanRequests(requests);
        } catch (error) {
            console.error("Error fetching loan requests:", error);
            setError("Failed to fetch your loan requests. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }
    
    // Refresh loan data
    function refreshLoanData(): void {
        if (connection) {
            fetchMyLoanRequests(connection);
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
    function getDaysRemaining(deadline: bigint): number {
        const now = Date.now();
        const deadlineTime = Number(deadline);
        const diffMs = deadlineTime - now;
        return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Get status badge styling
    function getStatusBadge(status: "active" | "funded" | "expired"): { text: string, className: string } {
        switch (status) {
            case "active":
                return { 
                    text: "Active", 
                    className: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium" 
                };
            case "funded":
                return { 
                    text: "Funded", 
                    className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium" 
                };
            case "expired":
                return { 
                    text: "Expired", 
                    className: "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium" 
                };
        }
    }

    return (
        <div className=" md:p-4 pt-10">
            <div className="md:flex  justify-between">
                <h1 className="text-3xl font-medium mb-6">My Loan Applications</h1>
                
                {/* Wallet Status */}
                {!connection ? (
                    <div className="mb-6 p-3   bg-orange-50 border border-orange-200 rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">Wallet connection required :</h2>
                        <p className="text-gray-600">Please connect your wallet from the sidebar to view your loan applications.</p>
                    </div>
                ) : (
                    <div className="mb-6 p-4 -translate-y-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-zinc-800">
                            <span className="font-semibold">Wallet connected:</span> {connection.address.substring(0, 8)}...{connection.address.substring(connection.address.length - 8)}
                        </p>
                        <div className="">
                            <button 
                                onClick={refreshLoanData}
                                className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Loan Data
                            </button>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
            </div>
            
            {/* My Loan Requests List */}
            <div className="mb-10 p-9 mt-10  bg-white rounded-2xl shadow-2xl">
                <h2 className="text-xl font-semibold mb-4">Your Loan Requests</h2>
                
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading your loan requests...</p>
                    </div>
                ) : !connection ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Connect your wallet to view your loan requests.</p>
                    </div>
                ) : myLoanRequests.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">You haven't made any loan requests yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myLoanRequests.map((loan) => {
                                    const statusBadge = getStatusBadge(loan.status);
                                    const daysRemaining = getDaysRemaining(loan.deadline);
                                    
                                    return (
                                        <tr key={loan.uniqueId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={statusBadge.className}>
                                                    {statusBadge.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loan.loanAmount)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loan.interest)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(loan.deadline)}
                                                <br />
                                                {loan.status === "expired" ? (
                                                    <span className="text-red-600">Expired</span>
                                                ) : (
                                                    <span className={daysRemaining <= 1 ? "text-red-600" : "text-green-600"}>
                                                        {daysRemaining} days remaining
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                {loan.uniqueId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                <a 
                                                    href={`https://preprod.cardanoscan.io/transaction/${loan.txId}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {loan.txId.substring(0, 10)}...
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Summary Stats */}
            {connection && myLoanRequests.length > 0 && (
                <div className="bg-gray-50 rounded-2xl shadow-2xl p-6 md:h-[200px]">
                    <h3 className="text-lg font-semibold mb-3">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">Active Loans</p>
                            <p className="text-xl font-bold mt-1">
                                {myLoanRequests.filter(loan => loan.status === "active").length}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">Funded Loans</p>
                            <p className="text-xl font-bold mt-1">
                                {myLoanRequests.filter(loan => loan.status === "funded").length}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">Expired Loans</p>
                            <p className="text-xl font-bold mt-1">
                                {myLoanRequests.filter(loan => loan.status === "expired").length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLoanApplications;