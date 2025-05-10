import React, { useState, useEffect } from "react";
import { Address, Blockfrost, Lucid, LucidEvolution, paymentCredentialOf, WalletApi, validatorToAddress, PaymentKeyHash, SpendingValidator, UTxO, Datum, Redeemer, Data, credentialToAddress } from "@lucid-evolution/lucid";

// Import validator scripts
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
    pkh: PaymentKeyHash;
};

type LoanToRepay = {
    txId: string;
    outputIndex: number;
    lenderPKH: string;
    loanAmount: bigint;
    interest: bigint;
    deadline: bigint;
    datumObject: any;
    utxo: UTxO;
};

// Define data schemas
// Loan Request Datum (from applications.tsx)
const loanRequestSchema = Data.Object({
    borrowerPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
    interest: Data.Integer(),
    deadline: Data.Integer(),
});
type BorrowerDatum = Data.Static<typeof loanRequestSchema>;
const BorrowerDatum = loanRequestSchema as unknown as BorrowerDatum;

// Fund Loan Datum
const fundLoanSchema = Data.Object({
    lenderPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
});
type FundLoanDatum = Data.Static<typeof fundLoanSchema>;
const FundLoanDatum = fundLoanSchema as unknown as FundLoanDatum;

// Repay Loan Redeemer
const repayLoanSchema = Data.Object({
    borrowerPKH: Data.Bytes(),
    loanAmount: Data.Integer(),
    interest: Data.Integer(),
    deadline: Data.Integer(),
});
type RepayLoanRedeemer = Data.Static<typeof repayLoanSchema>;
const RepayLoanRedeemer = repayLoanSchema as unknown as RepayLoanRedeemer;

const LoansToBeRepaid: React.FC = () => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [connection, setConnection] = useState<Connection | null>(null);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [loansToRepay, setLoansToRepay] = useState<LoanToRepay[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingRepay, setLoadingRepay] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Function to get available wallets
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
            
            // After connection, fetch loans to repay
            await fetchLoansToRepay(lucid, pkh);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError("Failed to connect wallet. Please try again.");
        } finally {
            setIsConnecting(false);
        }
    }

    // Fetch loans to be repaid from the blockchain
    async function fetchLoansToRepay(lucidInstance: LucidEvolution, borrowerPKH: string): Promise<void> {
        try {
            setIsLoading(true);
            setError(null);
            
            // 1. First, get all loan requests from LoanRequestAddress
            
            // This is to get the original loan details (including interest and deadline)
            const loanRequestUtxos: UTxO[] = await lucidInstance.utxosAt(LoanRequestAddress);
            console.log("UTxOs at loan request address:", loanRequestUtxos);
            
            // Parse loan requests to get original details
            const loanRequestDetails = new Map<string, {
                borrowerPKH: string,
                loanAmount: bigint,
                interest: bigint,
                deadline: bigint
            }>();
            
            for (const utxo of loanRequestUtxos) {
                if (!utxo.datum) continue;
                
                try {
                    const datumObject = Data.from(utxo.datum, BorrowerDatum);
                    // Use loanAmount as key to match with funded loans
                    loanRequestDetails.set(datumObject.loanAmount.toString(), {
                        borrowerPKH: datumObject.borrowerPKH,
                        loanAmount: datumObject.loanAmount,
                        interest: datumObject.interest,
                        deadline: datumObject.deadline
                    });
                } catch (error) {
                    console.error("Error parsing loan request datum:", error);
                }
            }
            
            // 2. Get all funded loans
            const fundedLoanUtxos: UTxO[] = await lucidInstance.utxosAt(FundLoanAddress);
            console.log("UTxOs at fund loan address:", fundedLoanUtxos);
            
            // 3. Get all repaid loans to filter them out
            const repaidLoanUtxos: UTxO[] = await lucidInstance.utxosAt(RepayLoanAddress);
            console.log("UTxOs at repay loan address:", repaidLoanUtxos);
            
            // Create a set of repaid loan amounts for efficient lookup
            const repaidLoanAmounts = new Set<string>();
            
            for (const utxo of repaidLoanUtxos) {
                if (!utxo.datum) continue;
                
                try {
                    const datumObject = Data.from(utxo.datum, RepayLoanRedeemer);
                    // Add this loan amount to the set of repaid loans
                    repaidLoanAmounts.add(datumObject.loanAmount.toString());
                } catch (error) {
                    console.error("Error parsing repaid loan datum:", error);
                }
            }
            
            const loans: LoanToRepay[] = [];

            for (const utxo of fundedLoanUtxos) {
                if (!utxo.datum) continue;
                
                try {
                    const datumObject = Data.from(utxo.datum, FundLoanDatum);
                    
                    // Skip if this loan has been repaid
                    if (repaidLoanAmounts.has(datumObject.loanAmount.toString())) {
                        console.log(`Loan with amount ${datumObject.loanAmount} has been repaid, skipping`);
                        continue;
                    }
                    
                    // Look up the original loan request details using loanAmount as the key
                    const originalLoanDetails = loanRequestDetails.get(datumObject.loanAmount.toString());
                    
                    // Only add loans where the connected user is the borrower
                    if (originalLoanDetails && originalLoanDetails.borrowerPKH === borrowerPKH) {
                        loans.push({
                            txId: utxo.txHash,
                            outputIndex: utxo.outputIndex,
                            lenderPKH: datumObject.lenderPKH,
                            loanAmount: datumObject.loanAmount,
                            interest: originalLoanDetails.interest,
                            deadline: originalLoanDetails.deadline,
                            datumObject,
                            utxo
                        });
                    }
                } catch (error) {
                    console.error("Error parsing fund loan datum:", error, "UTxO:", utxo);
                }
            }

            setLoansToRepay(loans);
            
            if (loans.length === 0) {
                console.log("No active loans to repay found for this user");
            }
        } catch (error) {
            console.error("Error fetching loans to repay:", error);
            setError("Failed to fetch loans to repay. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Repay loan function
    async function repayLoan(loan: LoanToRepay): Promise<void> {
        if (!connection) {
            setError("Please connect your wallet first");
            return;
        }

        try {
            setLoadingRepay(loan.txId);
            setError(null);
            setTxHash(null);
            
            const { lucid, pkh } = connection;
            
            // Calculate total repayment amount
            const totalRepayment = loan.loanAmount + loan.interest;
            
            // Create the redeemer with the actual loan details
            const repayRedeemer: RepayLoanRedeemer = {
                borrowerPKH: pkh,
                loanAmount: loan.loanAmount,
                interest: loan.interest,
                deadline: loan.deadline
            };
            
            const redeemer: Redeemer = Data.to<RepayLoanRedeemer>(repayRedeemer, RepayLoanRedeemer);
            
            // Get the lender address from PKH
            const lenderAddressDetails = {
                paymentCredential: {
                    hash: loan.lenderPKH,
                    type: "Key" as const
                },
                stakeCredential: undefined,
                network: "Preprod" as const
            };
            
            const lenderAddress = credentialToAddress("Preprod", lenderAddressDetails.paymentCredential);
            
            console.log("Lender Address:", lenderAddress);
            console.log("Loan UTXO:", loan.utxo);
            console.log("Repayment Amount:", totalRepayment.toString());
            
            // Create and submit the transaction
            const tx = await lucid
                .newTx()
                .readFrom([loan.utxo])
                .addSignerKey(pkh)
                .attach.SpendingValidator(FundRequestValidatorScript)
                .attach.SpendingValidator(RepayRequestValidatorScript)
                .pay.ToAddress(lenderAddress, { lovelace: totalRepayment })
                .pay.ToContract(RepayLoanAddress, { kind: "inline", value: redeemer })
                .validFrom(Date.now() - 1000000)
                .complete();
            
            const signedTx = await tx.sign.withWallet().complete();
            const txHash = await signedTx.submit();
            
            console.log("Loan repaid successfully. Transaction hash:", txHash);
            setTxHash(txHash);
            
            // Wait for a moment and then refresh the loans to repay
            setTimeout(() => {
                fetchLoansToRepay(lucid, pkh);
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
    
    // Check if loan is expired
    function isLoanExpired(deadline: bigint): boolean {
        return Date.now() > Number(deadline);
    }

    // Calculate days remaining until deadline
    function getDaysRemaining(deadline: bigint): string {
        const now = Date.now();
        const deadlineMs = Number(deadline);
        
        if (now > deadlineMs) {
            return "Expired";
        }
        
        const daysRemaining = Math.ceil((deadlineMs - now) / (1000 * 60 * 60 * 24));
        return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    }
    
    // Get status display with appropriate styling
    function getLoanStatus(deadline: bigint): {text: string, colorClass: string} {
        const isExpired = isLoanExpired(deadline);
        
        if (isExpired) {
            return {
                text: "Expired",
                colorClass: "text-red-600 font-medium"
            };
        } else {
            return {
                text: "Active",
                colorClass: "text-green-600 font-medium"
            };
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Loans To Be Repaid</h1>
            
            {/* Wallet Connection */}
            {!connection ? (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Connect your wallet</h2>
                    <div className="flex flex-wrap gap-2">
                        {wallets.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => connectWallet(wallet)}
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
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
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
            
            {/* Loans To Repay List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Active Loans To Repay</h2>
                
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Loading your loans to repay...</p>
                    </div>
                ) : loansToRepay.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">You don't have any active loans to repay at this time.</p>
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
                                        Total Repayment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loansToRepay.map((loan) => {
                                    const totalRepayment = loan.loanAmount + loan.interest;
                                    const expired = isLoanExpired(loan.deadline);
                                    const status = getLoanStatus(loan.deadline);
                                    
                                    return (
                                        <tr key={`${loan.txId}-${loan.outputIndex}`} className={expired ? "bg-red-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {loan.lenderPKH.substring(0, 8)}...{loan.lenderPKH.substring(loan.lenderPKH.length - 8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loan.loanAmount)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lovelaceToAda(loan.interest)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {lovelaceToAda(totalRepayment)} ADA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={status.colorClass}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex flex-col">
                                                    <span className={expired ? "text-red-600 font-medium" : "text-gray-900"}>
                                                        {formatDate(loan.deadline)}
                                                    </span>
                                                    <span className={expired ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                                                        {getDaysRemaining(loan.deadline)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => repayLoan(loan)}
                                                    disabled={!connection || loadingRepay === loan.txId}
                                                    className={`${
                                                        expired 
                                                        ? "bg-red-600 hover:bg-red-700" 
                                                        : "bg-green-600 hover:bg-green-700"
                                                    } text-white px-4 py-2 rounded-md transition disabled:opacity-50`}
                                                >
                                                    {loadingRepay === loan.txId 
                                                        ? "Processing..." 
                                                        : expired 
                                                            ? "Repay Overdue Loan" 
                                                            : "Repay Loan"}
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

export default LoansToBeRepaid;