// pub type LoanDatum {
//   borrower: ByteArray,
//   lender: ByteArray,
//   loan_amount: Int,
//   interest: Int,
//   deadline: Int,
//   debt_amount: Int,
// }

// pub type LoanRedeemer {
//   Request(borrower, loan_amount, interest, deadline)
//   RequestEdit { loan_amount: Int, interest: Int, deadline: Int }
//   Fund(lender, loan_amount)
//   Repay(debt_amount)
// }

pub type BorrowerDatum {
  borrower: ByteArray,
  loan_amount: Int,
  interest: Int,
  deadline: Int,
}

// pub type LenderDatum {
//   lender: ByteArray,
//   loan_amount: Int,
// }

pub type BorrowerRepayDatum {
  borrower: ByteArray,
  debt_amount: Int,
}

pub type LoanRequestAction {
  Request
  RequestEdit { loan_amount: Int, interest: Int, deadline: Int }
}

pub type FundLoanAction {
  lender: ByteArray,
  fund_loan: Int,
}

pub type RepayLoanAction {
  // borrower: ByteArray,
  debt_amount: Int,
}
// pub type LoanRedeemer {
//   Request(BorrowerDatum)
//   RequestEdit { loan_amount: Int, interest: Int, deadline: Int }
//   Fund(FundLoanAction)
//   Repay(RepayLoanAction)
// }
