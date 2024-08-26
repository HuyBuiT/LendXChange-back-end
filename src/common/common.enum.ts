export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum Network {
  SOLANA = 'solana',
  ETHEREUM = 'ethereum',
  INJECTIVE = 'injective',
  SUI = 'sui',
}

export enum OfferStatus {
  CREATED = 'Created',
  CANCELING = 'Canceling',
  CANCELLED = 'Cancelled',
  LOANED = 'Loaned',
}

export enum LoanStatus {
  MATCHED = 'Matched',
  FUND_TRANSFERRED = 'FundTransferred',
  REPAY = 'Repay',
  BORROWER_PAID = 'BorrowerPaid',
  FINISHED = 'Finished',
  LIQUIDATING = 'Liquidating',
  LIQUIDATED = 'Liquidated',
}
