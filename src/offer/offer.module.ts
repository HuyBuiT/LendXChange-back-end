import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfferTemplate,
      OfferTemplateView,
      Offer,
      OfferEvent,
      AccountModule,
    ]),
    LoanModule,
  ],
  controllers: [OfferController],
  providers: [OfferService, OfferGateway],
})
export class OfferModule {}
