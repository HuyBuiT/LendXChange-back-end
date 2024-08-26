import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { AbstractEntity } from '../common/common.entity';
import { LoanStatus } from '../common/common.enum';
import { transfromBigInt } from '../util/util.transformer';
import {
  LiquidatedCollateralEvent,
  LiquidatingCollateralEvent,
} from './loan.type';

@Entity({ name: 'collateral' })
export class Collateral extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'loan_id', type: 'bigint', transformer: transfromBigInt })
  loanId: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'network' })
  network: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_id', referencedColumnName: 'id' })
  loan: Relation<Loan>;
}

@Entity({ name: 'payment' })
export class Payment extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'loan_id', type: 'bigint', transformer: transfromBigInt })
  loanId: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'fee' })
  fee: number;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'network' })
  network: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_id', referencedColumnName: 'id' })
  loan: Relation<Loan>;
}

@Entity({ name: 'loan' })
export class Loan extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'loan_offer_id' })
  loanOfferId: string;

  @Column({ name: 'lend_offer_id' })
  lendOfferId: string;

  @Column({ name: 'template_id' })
  templateId: string;

  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  @ManyToOne(() => Account)
  lenderAccount: Account;

  @JoinColumn({ name: 'borrower_account_id', referencedColumnName: 'id' })
  @ManyToOne(() => Account)
  borrowerAccount: Account;

  @Column({ name: 'interest_rate', type: 'numeric' })
  interestRate: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'network' })
  network: string;

  @Column({ name: 'lender_fee' })
  lenderFee: number;

  @Column({ name: 'borrower_fee' })
  borrowerFee: number;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'is_paid' })
  isPaid: boolean;

  @Column({ name: 'is_due' })
  isDue: boolean;

  @Column({ name: 'status', enum: LoanStatus })
  status: LoanStatus;

  @Column({ name: 'start_date', type: 'timestamp without time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp without time zone' })
  endDate: Date;

  @OneToMany(() => Collateral, (collateral) => collateral.loan)
  @JoinColumn({ name: 'id', referencedColumnName: 'loanId' })
  collaterals: Collateral[];

  @OneToMany(() => Payment, (payment) => payment.loan)
  @JoinColumn({ name: 'id', referencedColumnName: 'loanId' })
  payments: Payment[];

  @OneToMany(() => LoanEvent, (event) => event.loan)
  @JoinColumn({ name: 'loanOfferId', referencedColumnName: 'loanOfferId' })
  events: LoanEvent[];

  @OneToMany(() => LiquidationEvent, (event) => event.loan)
  @JoinColumn({ name: 'loanOfferId', referencedColumnName: 'loanOfferId' })
  liquidationEvents: LiquidationEvent[];
}

@Entity({ name: 'loan_event' })
export class LoanEvent extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'loan_offer_id' })
  loanOfferId: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_offer_id', referencedColumnName: 'loanOfferId' })
  loan: Loan;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ name: 'signature' })
  signature: string;
}

@Entity({ name: 'latest_loan_event_view' })
export class LatestLoanEventView extends LoanEvent {}

@Entity({ name: 'liquidation_event' })
export class LiquidationEvent extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'loan_offer_id' })
  loanOfferId: string;

  @Column({ name: 'price' })
  price: number;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ name: 'signature' })
  signature: string;

  @Column({ name: 'metadata', type: 'jsonb' })
  metadata: LiquidatingCollateralEvent | LiquidatedCollateralEvent;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_offer_id', referencedColumnName: 'loanOfferId' })
  loan: Loan;
}
