use aiken/collection/list
use aiken/interval
use aiken/primitive/string
use assets/types.{
  BorrowerDatum, FundLoanAction, LoanRequestAction, RepayLoanAction, Request,
  RequestEdit,
}
// use cardano/address.{VerificationKey}
// use cardano/assets
use cardano/transaction.{InlineDatum, OutputReference, Transaction}

validator loanrequest {
  spend(
    datum: Option<BorrowerDatum>,
    r: LoanRequestAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    trace @"Loan Request UTx0..."

    expect Some(d) = datum

    when r is {
      Request -> {
        trace @"Submitting loan request"
        // Ensure the borrower is part of the transaction's extra signatories
        list.has(tx.extra_signatories, d.borrower)
      }

      RequestEdit { loan_amount, interest, deadline } -> {
        expect Some(ownBorrowerInput) =
          list.find(tx.inputs, fn(input) { input.output_reference == oref })
        let ownBorrowerHash = ownBorrowerInput.output.address.payment_credential

        expect Some(ownBorrowerOutput) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == ownBorrowerHash && output.value == ownBorrowerInput.output.value
            },
          )
        expect InlineDatum(datum) = ownBorrowerOutput.datum
        expect newLoanDatum: BorrowerDatum = datum

        trace string.concat(
          @"Editing Loan Request amount to: ",
          string.from_int(newLoanDatum.loan_amount),
        )

        trace string.concat(
          @"Editing Loan Request interest to: ",
          string.from_int(newLoanDatum.interest),
        )

        trace string.concat(
          @"Editing Loan Request deadline to: ",
          string.from_int(newLoanDatum.deadline),
        )

        and {
          newLoanDatum.borrower == d.borrower,
          newLoanDatum.loan_amount == loan_amount,
          newLoanDatum.interest == interest,
          newLoanDatum.deadline == deadline,
          list.has(tx.extra_signatories, d.borrower),
        }
      }
    }
  }

  else(_) {
    fail
  }
}

validator fundloan {
  spend(
    datum: Option<BorrowerDatum>,
    r: FundLoanAction,
    out_ref: OutputReference,
    tx: Transaction,
  ) {
    trace @"Fund Loan UTx0..."

    // Use the usual way of fetching input
    expect Some(input1) = transaction.find_input(tx.inputs, out_ref)

    expect Some(d) = datum

    when r is {
      FundLoanAction { lender, fund_loan } -> {
        trace @"Funding loan"

        // Ensure the lender is not the same as the borrower
        let is_not_self_funding = lender != d.borrower
        let lender_signed = list.has(tx.extra_signatories, lender)
        let is_funding_valid = fund_loan == d.loan_amount
        let is_within_deadline =
          interval.contains(tx.validity_range, d.deadline)

        // Ensure the input matches the output reference
        let is_input_valid = input1.output_reference == out_ref

        and {
          is_not_self_funding,
          is_funding_valid,
          is_within_deadline,
          lender_signed,
          is_input_valid,
        }
      }
    }
  }

  else(_) {
    fail
  }
}

validator repayloan {
  spend(
    datum: Option<BorrowerDatum>,
    r: RepayLoanAction,
    out_ref: OutputReference,
    tx: Transaction,
  ) {
    trace @"Repay Loan UTx0..."

    // Use the usual way of fetching input
    expect Some(input1) = transaction.find_input(tx.inputs, out_ref)

    expect Some(d) = datum

    when r is {
      RepayLoanAction { debt_amount } -> {
        trace @"Repaying loan"

        // Ensure the borrower signed the transaction
        let borrower_signed = list.has(tx.extra_signatories, d.borrower)

        // Ensure the repayment matches the debt amount (loan amount + interest)
        let expected_debt_amount = d.loan_amount + d.interest
        let is_repayment_valid = debt_amount == expected_debt_amount

        // Repayment must happen before or at the deadline
        let within_deadline = interval.contains(tx.validity_range, d.deadline)

        // Ensure the input matches the output reference
        let is_input_valid = input1.output_reference == out_ref

        trace string.concat(
          @"Expected debt amount: ",
          string.from_int(expected_debt_amount),
        )
        trace string.concat(
          @"Provided debt amount: ",
          string.from_int(debt_amount),
        )

        and {
          borrower_signed,
          is_repayment_valid,
          within_deadline,
          is_input_valid,
        }
      }
    }
  }

  else(_) {
    fail
  }
}
