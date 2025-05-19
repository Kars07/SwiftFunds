import React, { useState, useEffect } from "react";
import { Address, LucidEvolution, validatorToAddress, SpendingValidator, UTxO, Redeemer, Data, credentialToAddress } from "@lucid-evolution/lucid";
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
    uniqueId: string;
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
    fundedLoanId: string;
    originalLoanId?: string;
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

const FundLoan: React.FC = () => {
    const { connection, wallets, connectWallet, isConnecting } = useWallet();
    const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingFund, setLoadingFund] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch loan data when connection changes
    useEffect(() => {
        if (connection) {
            fetchLoanData(connection.lucid);
        }
    }, [connection]);

    // Create a unique identifier for a specific UTxO
    function createUtxoId(txId: string, outputIndex: number): string {
        return `${txId}-${outputIndex}`;
    }

    // Fetch loan data (both requests and funded loans)
    async function fetchLoanData(lucidInstance: LucidEvolution): Promise<void> {
        try {
            setIsLoading(true);
            
            // First, fetch funded loans
            const fundedLoansData = await fetchFundedLoans(lucidInstance);
        
            
            // Then fetch loan requests and filter out the funded ones
            await fetchLoanRequests(lucidInstance, fundedLoansData);
        } catch (error) {
            console.error("Error fetching loan data:", error);
            setError("Failed to fetch loan data. Please try again.");
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
                
                // Try to find the original loan ID this funded loan is associated with
                let originalLoanId = undefined;
                
                // Look through the tracking data to find a match
                for (const [loanId, trackingInfo] of Object.entries(fundedLoansTracking)) {
                    const tracking = trackingInfo as any;
                    if (tracking.txHash === utxo.txHash) {
                        originalLoanId = loanId;
                        break;
                    }
                }
                
                fundedLoans.push({
                    txId: utxo.txHash,
                    outputIndex: utxo.outputIndex,
                    lenderPKH: datumObject.lenderPKH,
                    loanAmount: datumObject.loanAmount,
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

    async function fetchLoanRequests(lucidInstance: LucidEvolution, fundedLoansData: FundedLoan[]): Promise<void> {
        try {
            const utxosAtScript: UTxO[] = await lucidInstance.utxosAt(LoanRequestAddress);
            console.log("UTxOs at loan request address:", utxosAtScript);

            const requests: LoanRequest[] = [];
            const currentTime = Date.now();
            
            // Track funded loans in localStorage
            const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            
            // Create a map of original loan IDs that have funded loans
            const fundedLoanOriginalIds = new Set<string>();
            fundedLoansData.forEach(fl => {
                if (fl.originalLoanId) {
                    fundedLoanOriginalIds.add(fl.originalLoanId);
                }
            });

            for (const utxo of utxosAtScript) {
                if (!utxo.datum) continue;
                
                try {
                    const datumObject = Data.from(utxo.datum, BorrowerDatum);
                    
                    // Skip expired loan requests
                    if (Number(datumObject.deadline) < currentTime) {
                        console.log(`Loan request with deadline ${new Date(Number(datumObject.deadline)).toLocaleString()} has expired, skipping`);
                        continue;
                    }
                    
                    // Create a unique identifier for this loan request UTXO
                    const loanId = createUtxoId(utxo.txHash, utxo.outputIndex);
                    
                    // Check if this specific loan request has been funded
                    if (fundedLoanOriginalIds.has(loanId) || fundedLoansTracking[loanId]) {
                        console.log(`Loan request ${loanId} has been funded, skipping`);
                        continue;
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
                        uniqueId: loanId
                    });
                } catch (error) {
                    console.error("Error parsing datum:", error, "UTxO:", utxo);
                }
            }

            setLoanRequests(requests);
        } catch (error) {
            console.error("Error fetching loan requests:", error);
            setError("Failed to fetch loan requests. Please try again.");
        }
    }

    // Fund loan function
    async function fundLoan(loanRequest: LoanRequest): Promise<void> {
        if (!connection) {
            setError("Please connect your wallet first");
            return;
        }

        try {
            setError(null);
            setTxHash(null);
            
            if (connection.pkh === loanRequest.borrowerPKH) {
                setError("You cannot fund your own loan request");
                return;
            }

            setLoadingFund(loanRequest.txId);
            const { lucid, pkh } = connection;
            
            // Create the redeemer
            const FundRedeemer: redeemerType = {
                lenderPKH: pkh,
                loanAmount: loanRequest.loanAmount
            };
            
            const fundredeem: Redeemer = Data.to<redeemerType>(FundRedeemer, redeemerType);
            
            // Get the borrower address from PKH
            const borrowerAddressDetails = {
                paymentCredential: {
                    hash: loanRequest.borrowerPKH,
                    type: "Key" as const
                },
                stakeCredential: undefined,
                network: "Preprod" as const
            };
            
            const BorrowerAddress = credentialToAddress("Preprod", borrowerAddressDetails.paymentCredential);
            
            console.log("Borrower Address:", BorrowerAddress);
            console.log("Loan Request UTXO:", loanRequest.utxo);
            
            // Create and submit the transaction
            const tx = await lucid
                .newTx()
                .readFrom([loanRequest.utxo])
                .addSignerKey(pkh)
                .attach.SpendingValidator(loanRequestValidatorScript)
                .attach.SpendingValidator(FundRequestValidatorScript)
                .pay.ToAddress(BorrowerAddress, { lovelace: loanRequest.loanAmount })
                .pay.ToContract(FundLoanAddress, { kind: "inline", value: fundredeem })
                .validFrom(Date.now() - 1000000)
                .complete();
            
            const signedTx = await tx.sign.withWallet().complete();
            const txHash = await signedTx.submit();
            
            console.log("Loan funded successfully. Transaction hash:", txHash);
            setTxHash(txHash);

            // Get funding UTXO details
            const fundingTx = await lucid.awaitTx(txHash);
            console.log("Funding transaction confirmed:", fundingTx);
            
            // Find the output index of the funding at the FundLoanAddress
            let fundedOutputIndex = -1;
            const txOutputs = await lucid.utxosAt(FundLoanAddress);
            for (let i = 0; i < txOutputs.length; i++) {
                if (txOutputs[i].txHash === txHash) {
                    fundedOutputIndex = txOutputs[i].outputIndex;
                    break;
                }
            }

            // After successful funding, track it in localStorage
            const fundedLoansTracking = JSON.parse(localStorage.getItem('fundedLoans') || '{}');
            const loanId = loanRequest.uniqueId;
            
            // Create unique funded loan identifier using the specific funding transaction
            const fundedLoanId = createUtxoId(txHash, fundedOutputIndex >= 0 ? fundedOutputIndex : 0);
            
            fundedLoansTracking[loanId] = {
                fundedAt: Date.now(),
                lenderPKH: pkh,
                txHash: txHash,
                fundedLoanId: fundedLoanId,
                loanAmount: loanRequest.loanAmount.toString(),
                interest: loanRequest.interest.toString(),
                deadline: loanRequest.deadline.toString(),
                borrowerPKH: loanRequest.borrowerPKH,
                // Store the funding UTXO details for reference
                fundedWith: [{
                    txHash: txHash,
                    outputIndex: fundedOutputIndex >= 0 ? fundedOutputIndex : 0
                }]
            };
            localStorage.setItem('fundedLoans', JSON.stringify(fundedLoansTracking));
            
            // Wait for a moment and then refresh the loan data
            setTimeout(() => {
                fetchLoanData(lucid);
            }, 10000);
            
        } catch (error) {
            console.error("Error funding loan:", error);
            setError(`Failed to fund loan: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoadingFund(null);
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

    return (
        <div className="p-4 pt-10">
            <div className="flex justify-between">
                <h1 className="text-3xl font-medium mb-6">Fund Loans</h1>
                
                {/* Wallet Connection Status */}
                {!connection ? (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">Connect your wallet:</h2>
                        <div className="flex flex-wrap gap-2">
                            {wallets.map((wallet) => (
                                <button
                                    key={wallet.name}
                                    onClick={() => connectWallet(wallet)}
                                    disabled={isConnecting}
                                    className="flex items-center bg-black text-[13px] delay-100 hover:bg-orange-500 duration-200 cursor-pointer text-white px-4 py-2 rounded-2xl transition"
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
                    <div className="mb-6 p-4 -translate-y-2 bg-orange-50 border border-orange-200 rounded-lg">
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
            
            {txHash && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                        <span className="font-semibold">Transaction submitted!</span>
                        <br />
                        Hash: {txHash}
                    </p>
                </div>
            )}
            
            {/* Active Loan Requests List */}
            <div className="mb-8 w-full">
                <h2 className="text-xl font-semibold mb-4">Active Loan Requests</h2>
                
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading loan requests...</p>
                    </div>
                ) : loanRequests.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No active loan requests found.</p>
                    </div>
                ) : (
                    <div className="">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                {loanRequests.map((loan) => (
                                    <tr key={loan.uniqueId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {loan.borrowerPKH.substring(0, 8)}...{loan.borrowerPKH.substring(loan.borrowerPKH.length - 8)}
                                            {connection && loan.borrowerPKH === connection.pkh && (
                                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                    You
                                                </span>
                                            )}
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
                                            <span className="text-green-600">
                                                {daysRemaining(loan.deadline)} days remaining
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {loan.uniqueId.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {connection && loan.borrowerPKH === connection.pkh ? (
                                                <button
                                                    disabled
                                                    className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md cursor-not-allowed"
                                                    title="You cannot fund your own loan"
                                                >
                                                    Cannot Fund Own Loan
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => fundLoan(loan)}
                                                    disabled={!connection || loadingFund === loan.txId}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                                                >
                                                    {loadingFund === loan.txId ? "Processing..." : "Fund Loan"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundLoan;