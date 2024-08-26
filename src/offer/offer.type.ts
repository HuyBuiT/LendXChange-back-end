import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PagingRequest } from 'src/common/common.component';
import { OfferStatus } from '../common/common.enum';

export class OfferEventDTO {
  @ApiProperty()
  eventName: string;
  @ApiProperty()
  signature: string;
  @ApiProperty()
  createdAt: Date;
}

export class OfferDTO {
  @ApiProperty()
  offerId: string;

  @ApiProperty()
  lenderAddress: string;

  @ApiProperty()
  interestRate: number;

  @ApiProperty({ type: OfferEventDTO })
  events: OfferEventDTO[];

  @ApiProperty({ enum: OfferStatus })
  status: OfferStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OfferTemplateDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  network: string;

  @ApiProperty({
    name: 'duration',
    description: 'Duration (in seconds) of the loan when offer is taken',
  })
  duration: number;

  @ApiProperty()
  bestOffer?: OfferDTO;

  @ApiProperty()
  volume24h?: number;
}

export class ListOfferRequest extends PagingRequest {
  @ApiPropertyOptional()
  walletAddress: string;
  @ApiPropertyOptional()
  templateId: string;
  @ApiPropertyOptional()
  status: OfferStatus;
}

export class SummaryOfferDashboardDTO {
  @ApiProperty()
  totalInterestEarned: number;
  @ApiProperty()
  totalInterestInActiveContract: number;
  @ApiProperty()
  totalInterestEarnedContracts: number;
  @ApiProperty()
  totalActiveContractsValue: number;
  @ApiProperty()
  totalActiveContracts: number;
  @ApiProperty()
  totalOpenOffersValue: number;
  @ApiProperty()
  totalOpenOffersContracts: number;
}
