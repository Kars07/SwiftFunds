import {
  Blockfrost,
  Data,
  Lucid,
  SpendingValidator,
  applyParamsToScript,
  applyDoubleCborEncoding,
  validatorToAddress,
  Constr,
  UTxO,
  getAddressDetails,
  LucidEvolution,
  AddressDetails,
  Address,
  TxBuilder,
  String,
  AddressType,
  Constructor,
  Datum,
  TxHash,
  ScriptRef,
  datumToHash,
  toScriptRef,
  fromScriptRef,
  Script,
  Redeemer,
  generatePrivateKey,
  PrivateKey,
  makeWalletFromPrivateKey
} from "@lucid-evolution/lucid";
import { readFile } from "fs/promises";


console.log("Initializing Lucid...");
  
const lucid = await Lucid(
  new Blockfrost(
    "https://cardano-preprod.blockfrost.io/api/v0",
    "preprodtJBS315srwdKRJldwtHxMqPJZplLRkCh"
  ),
  "Preprod"
);
console.log("Lucid initialized successfully");

const LenderSeedPhrase = ""
const LenderSignWithWallet = lucid.selectWallet.fromSeed(LenderSeedPhrase);
console.log("Lender Wallet selected");


const loanRequestValidatorScript: SpendingValidator = {
  type: "PlutusV2",
  script: "59030501010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cc0200092225980099b8748008c01cdd500144ca60026018003300c300d0019b87480012223322598009801800c566002601c6ea802600516403d15980099b874800800626464653001375a6028003375a6028007375a60280049112cc004c06001201116405430140013013001300e37540131640308060566002600260166ea800a33001300f300c37540052301030113011301130113011301130113011001911919800800801912cc00400629422b30013371e6eb8c04c00400e2946266004004602800280710112444b30013004300e375401513300137586004601e6ea8020dd7180918079baa0038999119912cc004c020c048dd5000c4cc88cc88c966002601a602e6ea8006264b30013370e9002180c1baa0018992cc004c03cc064dd5000c4c8c8c8ca60026eb4c0840066eb8c0840126eb4c08400e6eb4c0840092222598009813002c56600266e3cdd7181298111baa009375c604a60446ea805a2b30013370e6eb4c038c088dd50049bad30250138acc004cdc39bad300c302237540126eb4c0940462b30013370e6eb4c094c098c098c098c088dd50049bad3025302601189980a1bac3015302237540366eb8c094c088dd500b452820408a50408114a0810229410204590230c084004c080004c07c004c068dd5000c59018180e180c9baa0018b202e300230183754603660306ea80062c80b0cc01cdd61800980b9baa01025980099baf301b30183754603660306ea800400e266ebcc010c060dd50009802180c1baa30043018375400b14a080b0c060c054dd5180c180a9baa3001301537540044603260346034002602c60266ea80048c05cc0600062c8088c054008cc004dd6180a18089baa00a23375e602a60246ea8004024c03cdd5005111919800800801912cc0040062980103d87a80008992cc004c010006266e952000330160014bd7044cc00c00cc060009012180b000a02840348b2014300b375400e30083754005164018300800130033754011149a26cac80081"
};

const FundRequestValidatorScript: SpendingValidator = {
  type: "PlutusV2",
  script: "59028801010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c8cc8966002602a00713259800980318089baa0018acc004c018c044dd5003c4ca60026eb8c0580064602e60300033016301337540109112cc006600266e3c00cdd7180c980b1baa001a50a51405115980099b87375a603260340086eb4c008c058dd5000c5660026644b30013232598009807000c528c566002602600313259800980a180d1baa3007301b3754603c60366ea8016266e24004012266e200040110191bad301d301a375400514a080c1018180c1baa001301b30183754603660306ea800a26464b3001300e0018a508acc004c04c006264b30013014301a3754600e60366ea8c01cc06cdd5002c4cdc4802000c4cdc4002000a032375a603a60346ea800a2945018203030183754002603660306ea8c010c060dd50014528202c3019301a301a301a301a301a301a301a3016375401c6eb4c064c068c068c068c058dd5000c56600264660020026eb0c068c06cc06cc06cc06cc06cc06cc06cc06cc05cdd5007912cc00400629422b30013371e6eb8c06c0040162946266004004603800280b101944cdd7980c980b1baa30193016375400a01914a080a22941014452820288a5040503012375401b16404116404064660020026eb0c054c048dd5005112cc004006298103d87a80008992cc004cdd7980b980a1baa00100a899ba548000cc0580052f5c113300300330180024048602c00280a22c8090dd698090009bae30120023012001300d375401116402c3009375400716401c300800130033754011149a26cac80081",
};

const RepayRequestValidatorScript: SpendingValidator = {
  type: "PlutusV2",
  script: "59027201010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e2653001300d00198069807000cdc3a40009112cc004c004c030dd500444c8c966002602600513259800980218079baa0018acc004c010c03cdd5002c4cc89660026466446600400400244b30010018a508acc004cdc79bae30180010038a51899801001180c800a02640586eb0c058c05cc05cc05cc05cc05cc05cc05cc05cc04cdd50059bae30153012375400515980099b87375a602a60246ea8034cdc01bad3001301237540046eb4c054c058c058c048dd500145660026644b30013232598009805000c528c566002601e003132598009808180b1baa3006301737546034602e6ea8016266e24004012266e200040110151bad30193016375400514a080a1014180a1baa001301730143754602e60286ea800a26464b3001300a0018a508acc004c03c006264b3001301030163754600c602e6ea8c018c05cdd5002c4cdc4802000c4cdc4002000a02a375a6032602c6ea800a2945014202830143754002602e60286ea8c00cc050dd50014528202430153016301630163016301630163016301237540146eb4c054c058c058c058c048dd500144cdd7980a98091baa30153012375400601114a0808229410104528202030133010375400a46028602a00316403916403864660020026eb0c04cc040dd5004112cc004006298103d87a80008992cc004cdd7980a98091baa001008899ba548000cc0500052f5c113300300330160024040602800280922c8080dd6980880098069baa0088b201618049baa0038b200e180400098019baa0088a4d1365640041",
};

const LoanRequestAddress: Address = validatorToAddress("Preprod", loanRequestValidatorScript);
const FundLoanAddress: Address = validatorToAddress("Preprod", FundRequestValidatorScript);
const RepayLoanAddress: Address = validatorToAddress("Preprod", RepayRequestValidatorScript);


const BorrowerDetails: AddressDetails = getAddressDetails("addr_test1qpn5rttsu3zk0fsjzkpg04s8lpgrz7heqepavjh735gd5yp0h9u692rgepwzh7ys20akzrcp4prp8gtwhssgnpxnueesnuh85k");
const BorrowerPKH: string = BorrowerDetails.paymentCredential!?.hash
const BorrowerAddress: string = BorrowerDetails.address.bech32

const LenderDetails: AddressDetails = getAddressDetails("addr_test1qr6kkw3lmmgr55wxdd4zrpnnjxwqzcv8xlae8q95h9gg3nnr62p4sn24mqx08pef7sr0zyksp76u0d6cyh9gu0v963wqvh7gsx");
const LenderPKH: string = LenderDetails.paymentCredential!?.hash
const LenderAddress: string = LenderDetails.address.bech32

console.log("Borrower PKH:", BorrowerPKH);
console.log("Lender PKH:", BorrowerPKH);

const transactionfees = BigInt(5000)

const loanAmount = BigInt(1350000);
const interest = BigInt(350000);
const debtAmount = loanAmount + interest;
const deadline: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); 


const loanRequestSchema = Data.Object({
  borrowerPKH: Data.Bytes(),
  loanAmount: Data.Integer(),
  interest: Data.Integer(),
  deadline: Data.Integer(),
});
type BorrowerDatum = Data.Static<typeof loanRequestSchema>;
const BorrowerDatum = loanRequestSchema as unknown as BorrowerDatum;

const datum: BorrowerDatum = {
  borrowerPKH: BorrowerPKH,
  loanAmount: loanAmount,
  interest: interest,
  deadline: BigInt(deadline.getTime()),
};

const fundloanredeemerschema = Data.Object({
  lenderPKH: Data.Bytes(),
  loanAmount: Data.Integer(),
});
type redeemerType = Data.Static<typeof fundloanredeemerschema>
const redeemerType = fundloanredeemerschema as unknown as redeemerType
const FundRedeemer: redeemerType = {
   lenderPKH: LenderPKH,
   loanAmount: loanAmount
}

const dtm: Datum = Data.to<BorrowerDatum>(datum, BorrowerDatum);
const fundredeem: Redeemer = Data.to<redeemerType>(FundRedeemer, redeemerType);

async function requestLoan (
  lucid: LucidEvolution,
  borrowerPKH: string,
  loanAmount: bigint,
  interest: bigint,
  deadline: bigint
): Promise<TxHash>{

  const tx = await lucid
    .newTx()
    // .addSignerKey(borrowerPKH)
    .attach.SpendingValidator(loanRequestValidatorScript)
    .pay.ToContract(LoanRequestAddress, { kind: "inline", value: dtm}, {lovelace: transactionfees})
    .validFrom(Date.now() - 2592000)
    .complete();

    // const signedTx = await tx.sign.withPrivateKey(BorrowerPrivateKey).complete();
    // const txHash = await signedTx.submit();
  const signedTx = await tx.sign.withWallet().complete();
  const txHash = await signedTx.submit();
  console.log("Loan request submitted. Transaction hash:", txHash);
  return txHash;
}
console.log(await requestLoan(lucid, BorrowerPKH, loanAmount, interest, BigInt(deadline.getTime())));


async function fundLoan(
  lucid: LucidEvolution,
  lenderPKH: string,
  loanAmount: bigint
): Promise<TxHash> {

  // Searching for the Loan Request
  let retries = 10; // Increased retries
  let delay = 15000; // Increased delay

  while (retries > 0) {
      console.log(`Fetching UTxOs at script address. Retries left: ${retries}`);
      const utxosAtScript: UTxO[] = await lucid.utxosAt(LoanRequestAddress);

      console.log("UTxOs at script address:", utxosAtScript);

      const borrowerUTxO: UTxO[] = utxosAtScript.filter((utxo: UTxO) => {
          if (!utxo.datum) {
              console.warn("UTxO without datum found:", utxo);
              return false;
          }
          try {
              const onChainDatum = Data.from(utxo.datum, BorrowerDatum);
              console.log("Comparing on-chain datum:", onChainDatum, "with expected datum:", datum);
              return (
                  onChainDatum.borrowerPKH === datum.borrowerPKH &&
                  onChainDatum.loanAmount === datum.loanAmount &&
                  onChainDatum.interest === datum.interest &&
                  onChainDatum.deadline === datum.deadline
              );
          } catch (error) {
              console.error("Error parsing datum:", error, "UTxO:", utxo);
              return false;
          }
      });

      if (borrowerUTxO && borrowerUTxO.length > 0) {
          console.log("Matching UTxOs found:", borrowerUTxO);
          const tx = await lucid
              .newTx()
              .readFrom(borrowerUTxO)
              .addSignerKey(lenderPKH)
              .attach.SpendingValidator(loanRequestValidatorScript)
              .attach.SpendingValidator(FundRequestValidatorScript)
              .pay.ToAddress(BorrowerAddress, { lovelace: loanAmount })
              .pay.ToContract(FundLoanAddress, {kind: "inline", value: fundredeem})
              .validFrom(Date.now() - 1000000000)
              .complete();

          const signedTx = await tx.sign.withWallet().complete();
          const txHash = await signedTx.submit();
          console.log("Loan funded successfully. Transaction hash:", txHash);
          return txHash;
      } else {
          console.log("No matching UTxOs found. Retrying...");
          retries--;
          await new Promise((resolve) => setTimeout(resolve, delay));
      }
  }

  throw new Error("No UTxOs found that can be funded after retries.");
}
console.log(await fundLoan(lucid, LenderPKH, loanAmount ))




// async function repayLoan(
//   lucid: LucidEvolution,
//   borrowerPKH: string,
//   debtAmount: bigint
// ): Promise<TxHash> {
  
//   //Search for Loan Funded Transaction
//   let retries = 10; // Increased retries
//   let delay = 15000; // Increased delay

//   while (retries > 0) {
//     console.log(`Fetching UTxOs at Fund Script Address. Retries left: ${retries}`);
//     const utxosAtScript: UTxO[] = await lucid.utxosAt(FundLoanAddress);

//     console.log("UTxOs at Fund Script Adresss:", utxosAtScript);

//     const fundloanUTxO: UTxO[] = utxosAtScript.filter((utxo: UTxO) => {
//       if (!utxo.datum) {
//           console.warn("UTxO without datum found:", utxo);
//           return false;
//       }
//       try {
//           const onChainDatum = Data.from(utxo.datum, redeemerType);
//           console.log("Comparing on chain Fund datum:", onChainDatum, "with expected Fund Datum", FundRedeemer);
//           return (
//             onChainDatum.lenderPKH === FundRedeemer.lenderPKH &&
//             onChainDatum.loanAmount === FundRedeemer.loanAmount
//           );
//       } catch (error) {
//         console.error("Error parsing datum:", error, "UTxO:", utxo)
//         return false;
//       }
//     });

//     if (fundloanUTxO && fundloanUTxO.length > 0) {
//       console.log("Matching Fund Loan UTxOs found:", fundloanUTxO)
//       const tx = await lucid
//           .newTx()
//           .readFrom(fundloanUTxO)
//           .addSignerKey(borrowerPKH)
//           .attach.SpendingValidator(loanRequestValidatorScript)
//           .attach.SpendingValidator(FundRequestValidatorScript)
//           .attach.SpendingValidator(RepayRequestValidatorScript)
//           .pay.ToAddress(LenderAddress, { lovelace: debtAmount })
//           .pay.ToContract(RepayLoanAddress, {kind: "inline", value: repay})
//           .complete();
        
//         const signedTx = await tx.sign.withWallet().complete();
//         const txHash = await signedTx.submit();
//         console.log("Debt Repaid Successfully.")
//         return txHash;
//     } else {
//         console.log("No matching Fund UTxOs found. Retrying...");
//         retries--;
//         await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//    }
//    throw new Error("No Fund UTxOs found that can be repaid after retries.");
// }
// console.log(await repayLoan(lucid, BorrowerPKH, debtAmount))
  





