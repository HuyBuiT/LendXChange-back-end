import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { isEmpty, map, omit, pick } from 'lodash';
import {
  ApiPaginatedResponse,
  ApiSortQuery,
  PagingRequest,
  PagingResponse,
} from 'src/common/common.component';
import { AccessTokenGuard } from '../auth/auth.guard';
import { Offer, OfferEvent } from './offer.entity';
import { OfferService } from './offer.service';
import {
  BestOffersDasboardDTO,
  BestOffersDashboardRequest,
  ListOfferRequest,
  LoanBorrowedDTO,
  OfferDTO,
  OfferTemplateDTO,
  SummaryOfferDashboardDTO,
  SuppliedAssetDTO,
  SystemStatisticDTO,
} from './offer.type';
import { IRequestInfo } from 'src/common/interfaces/request-info.interface';

@ApiTags('offers')
@ApiExtraModels(OfferDTO, OfferTemplateDTO, ListOfferRequest)
@Controller('offers')
export class OfferController {
  private readonly DEFAULT_OFFER_FIELDS = Array<keyof Offer>(
    'offerId',
    'interestRate',
    'amount',
    'duration',
    'network',
    'symbol',
    'isActive',
    'status',
    'createdAt',
    'updatedAt',
  );

  private readonly DEFAULT_OFFER_EVENT_FIELDS = Array<keyof OfferEvent>(
    'eventName',
    'signature',
    'createdAt',
  );

  constructor(private readonly offerService: OfferService) {}

  @ApiPaginatedResponse(OfferDTO)
  @ApiSortQuery('offer')
  @ApiOperation({
    summary: 'Get list of lend offers',
    description: `
      Use sorts[offer.status] to sort by status alphabetically.
      User sorts[offer_status_idx] to sort by status index.
      Created  :  1
      Canceling:  2
      Cancelled:  3
    `,
  })
  @Get('')
  async listOffers(
    @Query() params: ListOfferRequest,
  ): Promise<PagingResponse<OfferDTO>> {
    const [offers, count] = await this.offerService.listOffers(params);
    return {
      pageData: map(offers, (offer) => {
        return {
          ...pick(offer, this.DEFAULT_OFFER_FIELDS),
          lenderAddress: offer.account.walletAddress,
          waitingInterest: 0,
          events: map(offer.events, (event) =>
            pick(event, this.DEFAULT_OFFER_EVENT_FIELDS),
          ),
        };
      }),
      pageNum: params.pageNum,
      total: count,
    };
  }

  @ApiPaginatedResponse(OfferTemplateDTO)
  @ApiSortQuery('offerTemplate')
  @Get('/:network/templates')
  async listOfferTemplates(
    @Query() params: PagingRequest,
    @Param('network') network: string,
  ): Promise<PagingResponse<OfferTemplateDTO>> {
    const [templates, count] = await this.offerService.listTemplates(
      params,
      network,
    );
    const templateIds = map(templates, (template) => template.id);
    const templateIdForBestOffer =
      await this.offerService.getTemplateIdForBestOffers(templateIds);
    const templateIdForVolumes =
      await this.offerService.getTemplateIdForVolumes(templateIds, {
        hours: 24,
      });

    if (!isEmpty(templateIds)) {
      return {
        pageData: map(templates, (template) => {
          return {
            ...omit(template, 'createdAt', 'updatedAt'),
            bestOffer: {
              ...pick(
                templateIdForBestOffer.get(template.id),
                this.DEFAULT_OFFER_FIELDS,
              ),
              lenderAddress: templateIdForBestOffer.get(template.id)?.account
                .walletAddress,
              waitingInterest: 0,
            },
            volume24h: templateIdForVolumes.get(template.id),
          };
        }),
        pageNum: params.pageNum,
        total: count,
      };
    }

    return {
      pageData: [],
      pageNum: params.pageNum,
      total: 0,
    };
  }

  @ApiPaginatedResponse(BestOffersDasboardDTO)
  @ApiSortQuery('offer')
  @Get('/best-offers')
  async bestOffersByTemplateId(
    @Query() params: BestOffersDashboardRequest,
  ): Promise<PagingResponse<BestOffersDasboardDTO>> {
    const [offers, count] = await this.offerService.getBestOffersDashboard(
      params,
    );

    return {
      pageData: map(offers, (offer) => {
        return {
          lenderAddress: offer.account.walletAddress,
          lendOfferId: offer.offerId,
          interestPercent: offer.interestRate,
        };
      }),
      pageNum: params.pageNum,
      total: count,
    };
  }

  @Get('dashboard')
  @UseGuards(AccessTokenGuard)
  async getSummaryOfferDashboard(
    @Req() req: any,
  ): Promise<SummaryOfferDashboardDTO> {
    const account = req.user;
    return await this.offerService.getSummaryOfferDashboard(account.id);
  }

  @ApiResponse({ type: SuppliedAssetDTO })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('supplied-asset')
  async getTotalLendSupplied(
    @Req() request: IRequestInfo,
  ): Promise<SuppliedAssetDTO> {
    const accountId = request.user.id;
    return await this.offerService.getTotalLendSupplied(accountId);
  }

  @ApiResponse({ type: LoanBorrowedDTO })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('loan-borrowed')
  async getTotalBorrow(
    @Req() request: IRequestInfo,
  ): Promise<LoanBorrowedDTO[]> {
    const accountId = request.user.id;
    return await this.offerService.getLoanBorrowed(accountId);
  }

  @ApiResponse({ type: SuppliedAssetDTO })
  @Get('system-supplied-asset')
  async getSystemTotalLendSupplied(): Promise<SuppliedAssetDTO> {
    return await this.offerService.getSystemTotalLendSupplied();
  }

  @ApiResponse({ type: LoanBorrowedDTO })
  @Get('system-loan-borrowed')
  async getSystemTotalBorrow(): Promise<LoanBorrowedDTO[]> {
    return await this.offerService.getSystemLoanBorrowed();
  }

  @ApiResponse({ type: SystemStatisticDTO })
  @Get('system-statistic')
  async getSystemStatistic(): Promise<SystemStatisticDTO> {
    return await this.offerService.getSystemStatistics();
  }
}
