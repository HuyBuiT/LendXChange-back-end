import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanModule } from '../loan/loan.module';
import { OfferController } from './offer.controller';
import {
  Offer,
  OfferEvent,
  OfferTemplate,
  OfferTemplateView,
} from './offer.entity';
import { OfferGateway } from './offer.gateway';
import { OfferService } from './offer.service';
import { Account } from 'src/account/account.entity';
import { Loan, LoanEvent } from 'src/loan/loan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfferTemplate,
      OfferTemplateView,
      Offer,
      OfferEvent,
      LoanEvent,
      OfferEvent,
      Account,
      Loan,
    ]),
    LoanModule,
  ],
  controllers: [OfferController],
  providers: [OfferService, OfferGateway],
})
export class OfferModule {}
