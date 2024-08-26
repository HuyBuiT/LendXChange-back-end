import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { LoanController } from './loan.controller';
import {
  Collateral,
  LatestLoanEventView,
  LiquidationEvent,
  Loan,
  LoanEvent,
  Payment,
} from './loan.entity';
import { LoanGateway } from './loan.gateway';
import { LoanService } from './loan.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      Collateral,
      Payment,
      LoanEvent,
      LatestLoanEventView,
      LiquidationEvent,
    ]),
    AccountModule,
  ],
  controllers: [LoanController],
  providers: [LoanService, LoanGateway],
  exports: [TypeOrmModule],
})
export class LoanModule {}
