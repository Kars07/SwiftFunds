use aiken/interval
use assets/helper as t
use assets/types.{
  BorrowerDatum, FundLoanAction, RepayLoanAction, Request, RequestEdit,
}
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use loansystem/loan_system

// --- Loan Tests ---
test requestLoan() {
  let borrower = #"beef"

  let loanDatum =
    BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

  let oref = t.oref(#"cafe", 0)

  let loanInput =
    t.input(
      oref,
      t.output(
        t.scriptAddress(#"deaf"),
        assets.from_lovelace(0),
        InlineDatum(loanDatum),
      ),
    )

  let tx =
    Transaction {
      ..placeholder,
      inputs: [loanInput],
      outputs: [],
      extra_signatories: [borrower],
    }

  loan_system.loanrequest.spend(Some(loanDatum), Request, oref, tx)
}

test loanEdit() {
  let borrower =
    "addr_test1qpqxsmjasp8n6zz29wgdmswen6penflp330g93auh9h8689keekkjcuqcsskmtw8tz90pg2s6vu8a4f26n9jwxgltleqheu80l"

  let oldLoanDatum =
    BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

  let loanAction =
    RequestEdit { loan_amount: 5500, interest: 500, deadline: 30 }

  let newLoanDatum =
    BorrowerDatum { borrower, loan_amount: 5500, interest: 500, deadline: 30 }

  let oref = t.oref(#"cafe", 0)

  let oldValue = assets.from_lovelace(3000)

  let borrowerInput =
    t.input(
      oref,
      t.output(t.scriptAddress(#"deaf"), oldValue, InlineDatum(oldLoanDatum)),
    )

  let borrowerOutput =
    t.output(t.scriptAddress(#"deaf"), oldValue, InlineDatum(newLoanDatum))

  let tx =
    Transaction {
      ..placeholder,
      inputs: [borrowerInput],
      outputs: [borrowerOutput],
      extra_signatories: [borrower],
    }

  loan_system.loanrequest.spend(Some(oldLoanDatum), loanAction, oref, tx)
}

test fundLoan() {
  let borrower =
    "addr_test1qpqxsmjasp8n6zz29wgdmswen6penflp330g93auh9h8689keekkjcuqcsskmtw8tz90pg2s6vu8a4f26n9jwxgltleqheu80l"

  let lender =
    "addr_test1qr6kkw3lmmgr55wxdd4zrpnnjxwqzcv8xlae8q95h9gg3nnr62p4sn24mqx08pef7sr0zyksp76u0d6cyh9gu0v963wqvh7gsx"

  let loanDatum =
    BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

  let loanAction = FundLoanAction { lender, fund_loan: 5000 }
  let loanValue = assets.from_lovelace(5000)

  // Loan amount being sent to borrower
  let oref = t.oref(#"cafe", 1)

  // UTxO at the script address containing the loan request
  let loanIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(#"deaf"),
        assets.from_lovelace(2),
        InlineDatum(loanDatum),
      ),
    )

  // Output where the borrower receives the loan amount
  let borrowerOut = t.output(t.walletAddress(borrower), loanValue, NoDatum)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [loanIn],
      outputs: [borrowerOut],
      extra_signatories: [lender],
    }

  loan_system.fundloan.spend(Some(loanDatum), loanAction, oref, tx)
}

test repayLoan() {
  let borrower =
    "addr_test1qpqxsmjasp8n6zz29wgdmswen6penflp330g93auh9h8689keekkjcuqcsskmtw8tz90pg2s6vu8a4f26n9jwxgltleqheu80l"

  let lender =
    "addr_test1qr6kkw3lmmgr55wxdd4zrpnnjxwqzcv8xlae8q95h9gg3nnr62p4sn24mqx08pef7sr0zyksp76u0d6cyh9gu0v963wqvh7gsx"

  let loanDatum =
    BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

  let loanAction = RepayLoanAction { debt_amount: 5500 }
  let oref = t.oref(#"cafe", 1)

  // UTxO from the script being spent
  let loanIn =
    t.input(
      oref,
      t.output(
        t.scriptAddress(#"deaf"),
        assets.from_lovelace(2),
        InlineDatum(loanDatum),
      ),
    )

  // Output to lender: total repayment = loan_amount + interest
  let repayment =
    t.output(t.walletAddress(lender), assets.from_lovelace(5500), NoDatum)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [loanIn],
      outputs: [repayment],
      extra_signatories: [borrower],
      validity_range: interval.before(30),
    }

  loan_system.repayloan.spend(Some(loanDatum), loanAction, oref, tx)
}
// // --- Fail Tests ---
// test request_Loan() fail {
//   let borrower = #"beef"

//   let loanDatum =
//     BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

//   let action = Request

//   let oref = t.oref(#"cafe", 0)

//   let value = assets.from_lovelace(1000)

//   let borrowerInput =
//     t.input(
//       oref,
//       t.output(t.scriptAddress(#"deaf"), value, InlineDatum(loanDatum)),
//     )

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [borrowerInput],
//       outputs: [],
//       extra_signatories: [],
//     }

//   // ❌ No borrower signature!
//   loan_system.loanrequest.spend(Some(loanDatum), action, oref, tx)
// }

// test fund_Loan() fail {
//   let borrower = #"beef"
//   let lender = #"face"

//   let loanDatum =
//     BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

//   let action = FundLoanAction { lender, fund_loan: 4000 }
//   let oref = t.oref(#"cafe", 0)

//   let scriptInput =
//     t.input(
//       oref,
//       t.output(
//         t.scriptAddress(#"deaf"),
//         assets.from_lovelace(2),
//         InlineDatum(loanDatum),
//       ),
//     )

//   let lenderInput =
//     t.input(
//       t.oref(#"cece", 1),
//       t.output(t.walletAddress(lender), assets.from_lovelace(5000), NoDatum),
//     )

//   let wrongLoanOutput =
//     t.output(t.walletAddress(borrower), assets.from_lovelace(4000), NoDatum)

//   // ❌ Less than expected
//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [scriptInput, lenderInput],
//       outputs: [wrongLoanOutput],
//       extra_signatories: [lender],
//     }

//   // ❌ Loan amount received is not equal to expected (5000)
//   loan_system.fundloan.spend(Some(loanDatum), action, oref, tx)
// }

// test repay_Loan() fail {
//   let borrower = #"beef"

//   let loanDatum =
//     BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

//   let action = RepayLoanAction { debt_amount: 4000 }
//   let oref = t.oref(#"cafe", 0)

//   let scriptInput =
//     t.input(
//       oref,
//       t.output(
//         t.scriptAddress(#"deaf"),
//         assets.from_lovelace(2),
//         InlineDatum(loanDatum),
//       ),
//     )

//   let wrongRepayment =
//     t.output(
//       t.walletAddress(#"face"),
//       assets.from_lovelace(4000),
//       // ❌ Less than loan_amount + interest (should be 5500)
//       NoDatum,
//     )

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [scriptInput],
//       outputs: [wrongRepayment],
//       extra_signatories: [borrower],
//       validity_range: interval.before(30),
//     }

//   // ❌ Repayment is too small (4000 instead of 5500)
//   loan_system.repayloan.spend(Some(loanDatum), action, oref, tx)
// }

// test edit_Loan() fail {
//   let borrower = #"beef"

//   let originalDatum =
//     BorrowerDatum { borrower, loan_amount: 5000, interest: 500, deadline: 30 }

//   let action = RequestEdit { loan_amount: 5500, interest: 500, deadline: 30 }

//   let wrongEditedDatum =
//     BorrowerDatum {
//       borrower,
//       loan_amount: 6000,
//       // ❌ This doesn't match redeemer.loan_amount (5500)
//       interest: 500,
//       deadline: 30,
//     }

//   let oref = t.oref(#"cafe", 0)

//   let scriptInput =
//     t.input(
//       oref,
//       t.output(
//         t.scriptAddress(#"deaf"),
//         assets.from_lovelace(2),
//         InlineDatum(originalDatum),
//       ),
//     )

//   let borrowerOutput =
//     t.output(
//       t.walletAddress(borrower),
//       assets.from_lovelace(2),
//       InlineDatum(wrongEditedDatum),
//     )

//   let tx =
//     Transaction {
//       ..placeholder,
//       inputs: [scriptInput],
//       outputs: [borrowerOutput],
//       extra_signatories: [borrower],
//     }

//   // ❌ Output datum loan_amount is 6000, but expected 5500
//   loan_system.loanrequest.spend(Some(originalDatum), action, oref, tx)
// }
