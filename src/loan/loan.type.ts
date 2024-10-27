import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { trim } from 'lodash';
import { PagingRequest } from '../common/common.component';
import { LoanStatus, Network } from '../common/common.enum';

export class ListLoanRequest extends PagingRequest {
  @ApiPropertyOptional()
  @Transform(({ value }) => trim(value))
  lenderAddress: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => trim(value))
  borrowerAddress: string;

  @ApiPropertyOptional()
  templateId: string;

  @ApiPropertyOptional()
  isActive: boolean;

  @ApiPropertyOptional()
  status: LoanStatus;
}

export class CollateralDTO {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  createdAt: Date;
}

export class PaymentDTO {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  createdAt: Date;
}

export class LoanEventDTO {
  @ApiProperty()
  eventName: string;

  @ApiProperty()
  signature: string;

  @ApiProperty()
  createdAt: Date;
}

export class LoanDTO {
  @ApiProperty()
  loanOfferId: string;

  @ApiProperty()
  lendOfferId: string;

  @ApiProperty()
  templateId: string;

  @ApiProperty()
  lenderAddress: string;

  @ApiProperty()
  borrowerAddress: string;

  @ApiProperty()
  interestRate: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  isDue: boolean;

  @ApiProperty({ enum: LoanStatus })
  status: LoanStatus;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ type: CollateralDTO })
  collaterals: CollateralDTO[];

  @ApiProperty({ type: PaymentDTO })
  payments: PaymentDTO[];

  @ApiProperty()
  events: LoanEventDTO[];
}

export class SummaryLoanDashboardDTO {
  @ApiProperty()
  totalInterestPaid: number;
  @ApiProperty()
  totalInterestInActiveContract: number;
  @ApiProperty()
  totalInterestPaidContracts: number;
  @ApiProperty()
  totalActiveContractsValue: number;
  @ApiProperty()
  totalActiveContracts: number;
  @ApiProperty()
  totalBorrowedValue: number;
  @ApiProperty()
  totalBorrowedContracts: number;
}

export interface LiquidatingCollateralEvent {
  offerId: string;
  liquidatingPrice: number;
  liquidatingAt: number;
  name: string;
  timestamp: Date;
  signatures: string[];
}

export interface LiquidatedCollateralEvent {
  loanOfferId: string;
  liquidatedPrice: number;
  liquidatedTx: string;
  system: string;
  lender: string;
  borrower: string;
  remainingFundToBorrower: number;
  collateralSwappedAmount: number;
  status: string;
  name: string;
  timestamp: Date;
  signatures: string[];
}

export class ActiveLoansDashboardRequest extends PagingRequest {
  @ApiProperty()
  templateId: string;

  @ApiProperty()
  network: Network;
}

export class ActiveLoansDashboardDTO {
  @ApiProperty()
  borrowOfferId: string;

  @ApiProperty()
  borrowerAddress: string;

  @ApiProperty()
  interestPercent: number;

  @ApiProperty()
  lendOfferId: string;

  @ApiProperty()
  lenderAddress: string;

  @ApiProperty()
  startDate: Date;
}
