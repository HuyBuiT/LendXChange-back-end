import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PagingRequest } from 'src/common/common.component';
import { Network, OfferStatus } from '../common/common.enum';

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

export class BestOffersDashboardRequest extends PagingRequest {
  @ApiProperty()
  templateId: string;
  @ApiProperty()
  network: Network;
}

export class BestOffersDasboardDTO {
  @ApiProperty()
  lenderAddress: string;

  @ApiProperty()
  lendOfferId: string;

  @ApiProperty()
  interestPercent: number;
}

export class AssetDTO {
  @ApiProperty()
  network: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  decimals: number;

  @ApiProperty()
  tokenAddress: string;

  @ApiProperty()
  priceFeedId: string;
}

export class AssetAmountDTO {
  @ApiProperty()
  asset: AssetDTO;

  @ApiProperty()
  amount: number;
}

export class LendSuppliedDTO {
  @ApiProperty()
  asset: AssetDTO;

  @ApiProperty()
  lendSuppliedAmount: number;

  @ApiProperty()
  interestEarnedAmount: number;

  @ApiProperty()
  activeContractPerAsset: number;
}

export class CollateralSuppliedDTO {
  @ApiProperty()
  asset: AssetDTO;

  @ApiProperty()
  collateralSuppliedAmount: number;
}

export class SuppliedAssetDTO {
  @ApiProperty()
  lendSupplied: LendSuppliedDTO[];

  @ApiProperty()
  collateralSupplied: CollateralSuppliedDTO[];
}

export class LoanBorrowedDTO {
  @ApiProperty()
  asset: AssetDTO;

  @ApiProperty()
  borrowedAmount: number;

  @ApiProperty()
  interestOwedAmount: number;

  @ApiProperty()
  activeContractPerAsset: number;
}
