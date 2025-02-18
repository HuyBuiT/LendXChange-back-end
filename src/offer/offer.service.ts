import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNotEmpty } from 'class-validator';
import { Duration, sub } from 'date-fns';
import { isEmpty, isNil, map } from 'lodash';
import { PagingRequest } from 'src/common/common.component';
import { LoanStatus, OfferStatus, SortDirection } from 'src/common/common.enum';
import { Loan } from 'src/loan/loan.entity';
import { Repository } from 'typeorm';
import { Offer, OfferTemplate, OfferTemplateView } from './offer.entity';
import {
  BestOffersDashboardRequest,
  ListOfferRequest,
  LoanBorrowedDTO,
  SummaryOfferDashboardDTO,
  SuppliedAssetDTO,
} from './offer.type';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Offer>,
    @InjectRepository(OfferTemplate)
    private readonly offerTemplateRepository: Repository<OfferTemplate>,
  ) {}

  async listOffers(params: ListOfferRequest): Promise<[Offer[], number]> {
    const { walletAddress, templateId, status } = params;
    const query = this.offerRepository
      .createQueryBuilder('offer')
      .addSelect(
        `CASE
          WHEN offer.status = 'Created'   THEN 1
          WHEN offer.status = 'Canceling' THEN 2
          WHEN offer.status = 'Cancelled' THEN 2
          ELSE 4
        END`,
        'offer_status_idx',
      )
      .leftJoinAndSelect('offer.account', 'account')
      .leftJoinAndSelect('offer.events', 'events')
      .leftJoinAndSelect(Loan, 'loan', 'loan.lendOfferId = offer.offerId');

    if (isNil(status)) {
      query.andWhere('offer.status in (:...statuses)', {
        statuses: [
          OfferStatus.CREATED,
          OfferStatus.CANCELING,
          OfferStatus.CANCELLED,
        ],
      });
    } else {
      query.andWhere('offer.status = :status', { status });
    }

    if (isNotEmpty(walletAddress)) {
      query.andWhere('account.walletAddress = :walletAddress', {
        walletAddress: walletAddress,
      });
    }
    if (isNotEmpty(templateId)) {
      query.andWhere('offer.templateId = :templateId', {
        templateId: templateId,
      });
    }

    const [pageNum, pageSize, sort] = params.pagination;

    if (sort) {
      query.orderBy(sort);
    } else {
      query.orderBy(`offer_status_idx`, 'ASC');
    }

    return query
      .take(pageSize)
      .skip(pageNum * pageSize)
      .getManyAndCount();
  }

  async listTemplates(
    params: PagingRequest,
    @Param('network') network: string,
  ): Promise<[OfferTemplate[], number]> {
    const query =
      this.offerTemplateRepository.createQueryBuilder('offerTemplate');
    const [pageNum, pageSize, sorts] = params.pagination;

    query.where('offerTemplate.network = :network', {
      network: network,
    });

    if (!isNil(sorts)) {
      query.orderBy(sorts);
    }

    return query
      .take(pageSize)
      .skip(pageNum * pageSize)
      .getManyAndCount();
  }

  async getTemplateIdForBestOffers(
    templateIds: string[],
  ): Promise<Map<string, Offer>> {
    if (isEmpty(templateIds)) {
      return new Map();
    }

    const offers = await this.offerRepository
      .createQueryBuilder('o')
      .innerJoin(
        OfferTemplateView,
        't',
        'o.templateId = t.id and o.interestRate = t.minInterestRate',
      )
      .leftJoinAndSelect('o.account', 'account')
      .leftJoinAndSelect(Loan, 'loan', 'loan.lendOfferId = o.offerId')
      .where('o.templateId IN (:...templateIds)', { templateIds: templateIds })
      .andWhere('loan.lendOfferId is null')
      .andWhere('o.status = :status', { status: OfferStatus.CREATED })
      .getMany();
    return new Map(
      map(
        offers,
        (value: Offer) => [value.templateId, value] as [string, Offer],
      ),
    );
  }

  async getTemplateIdForVolumes(
    templateIds: string[],
    duration: Duration,
  ): Promise<Map<string, number>> {
    if (isEmpty(templateIds)) {
      return new Map();
    }

    const currentDate = new Date();
    const volumes = await this.offerRepository
      .createQueryBuilder('o')
      .select('o.templateId', 'templateId')
      .addSelect('SUM(o.amount)', 'volume')
      .where('o.is_active = TRUE AND o.templateId IN (:...templateIds)', {
        templateIds: templateIds,
      })
      .andWhere('o.updatedAt >= :startTime and o.updatedAt <= :endTime', {
        startTime: sub(currentDate, duration),
        endTime: currentDate,
      })
      .groupBy('o.templateId')
      .getRawMany();
    return new Map(map(volumes, (vol) => [vol.templateId, vol.volume]));
  }

  async getSummaryOfferDashboard(
    accountId: number,
  ): Promise<SummaryOfferDashboardDTO> {
    //TODO: missing calculate waiting interest
    const loanSummary = await this.offerRepository
      .createQueryBuilder('offer')
      .innerJoin(Loan, 'loan', 'offer.offerId = loan.lendOfferId')
      .where('offer.account_id = :accountId', { accountId })
      .select(
        `sum(case
        when loan.status = '${LoanStatus.FINISHED}'
        then offer.amount * offer.interest_rate * offer.duration / 31536000
        else 0
        end)`,
        'totalInterestEarned',
      )
      .addSelect(
        `sum(case
        when loan.status != '${LoanStatus.FINISHED}'
        then offer.amount * offer.interest_rate / 100 * offer.duration / 31536000
        else 0
        end)`,
        'totalInterestInActiveContract',
      )
      .addSelect(
        `sum(case
        when loan.status = '${LoanStatus.FINISHED}'
        then 1
        else 0
        end)`,
        'totalInterestEarnedContracts',
      )
      .addSelect(
        `sum(case
        when loan.status != '${LoanStatus.FINISHED}'
        then offer.amount
        else 0
        end)`,
        'totalActiveContractsValue',
      )
      .addSelect(
        `sum(case
        when loan.status != '${LoanStatus.FINISHED}'
        then 1
        else 0
        end)`,
        'totalActiveContracts',
      )
      .getRawOne();

    const offerSummary = await this.offerRepository
      .createQueryBuilder('offer')
      .select(
        `sum(case
        when offer.status = '${OfferStatus.CREATED}'
        then offer.amount
        else 0
        end)`,
        'totalOpenOffersValue',
      )
      .addSelect(
        `sum(case
        when offer.status = '${OfferStatus.CREATED}'
        then 1
        else 0
        end)`,
        'totalOpenOffersContracts',
      )
      .where('offer.account_id = :accountId', { accountId })
      .getRawOne();
    return {
      totalInterestEarned: Number(loanSummary.totalInterestEarned),
      totalInterestInActiveContract: Number(
        loanSummary.totalInterestInActiveContract,
      ),
      totalInterestEarnedContracts: Number(
        loanSummary.totalInterestEarnedContracts,
      ),
      totalActiveContractsValue: Number(loanSummary.totalActiveContractsValue),
      totalActiveContracts: Number(loanSummary.totalActiveContracts),
      totalOpenOffersValue: Number(offerSummary.totalOpenOffersValue),
      totalOpenOffersContracts: Number(offerSummary.totalOpenOffersContracts),
    };
  }

  async getBestOffersDashboard(
    params: BestOffersDashboardRequest,
  ): Promise<[Offer[], number]> {
    const { templateId, network, pagination } = params;
    const [pageNum, pageSize, sort] = pagination;

    const query = this.offerRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.account', 'account')
      .innerJoin('offer.offerTemplate', 'offerTemplate')
      .where('offer.network = :network', { network })
      .andWhere('offer.status = :status', { status: OfferStatus.CREATED })
      .andWhere('offerTemplate.id = :templateId', { templateId })
      .select([
        'offer.id',
        'offer.offerId',
        'account.walletAddress',
        'offer.interestRate',
      ]);

    const orderBy = isEmpty(sort)
      ? { 'offer.interestRate': SortDirection.ASC }
      : sort;

    return query
      .orderBy(orderBy)
      .take(pageSize)
      .skip(pageNum * pageSize)
      .getManyAndCount();
  }

  async getTotalLendSupplied(accountId: number): Promise<SuppliedAssetDTO> {
    const lendSupplied = await this.offerRepository.query(`
      SELECT 
        SUM(offer.amount) as total_lend_amount,
        SUM(
          offer.amount * offer.interest_rate / 100 * offer.duration / (365 * 24 * 60 *60)
        ) AS total_interest_earned,
        COUNT(1) AS total_active_offers,
        asset.name,
        asset.symbol,
        asset.decimals,
        asset.price_feed_id,
        asset.token_address,
        asset.network
      FROM offer
      INNER JOIN asset ON offer.asset_id = asset.id
      LEFT JOIN loan ON offer.offer_id = loan.lend_offer_id
      WHERE (offer.status = '${OfferStatus.CREATED}' or (offer.status = '${OfferStatus.LOANED}' AND loan.status != '${LoanStatus.FINISHED}'))
      AND offer.account_id = ${accountId}
      GROUP BY asset.id
    `);
    const collateralSupplied = await this.loanRepository.query(`
      SELECT 
        SUM(collateral.amount) as total_collateral_amount,
        collateral_asset.id,
        collateral_asset.name,
        collateral_asset.symbol,
        collateral_asset.decimals,
        collateral_asset.price_feed_id,
        collateral_asset.token_address,
        collateral_asset.network
      FROM loan
      inner join offer on loan.lend_offer_id = offer.offer_id
      inner join collateral on loan.id = collateral.loan_id
      inner join asset on loan.asset_id = asset.id
      inner join asset as collateral_asset on collateral.asset_id = collateral_asset.id
      WHERE loan.status in ('${LoanStatus.MATCHED}', '${LoanStatus.FUND_TRANSFERRED}') AND loan.borrower_account_id = ${accountId}
      GROUP BY collateral_asset.id
    `);
    const lendSuppliedMapped = lendSupplied.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        lendSuppliedAmount: Number(data.total_lend_amount),
        interestEarnedAmount: Number(data.total_interest_earned),
        activeContractPerAsset: Number(data.total_active_offers),
      };
    });
    const collateralSuppliedMapped = collateralSupplied.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        collateralSuppliedAmount: Number(data.total_collateral_amount),
      };
    });

    return {
      lendSupplied: lendSuppliedMapped,
      collateralSupplied: collateralSuppliedMapped,
    };
  }

  async getLoanBorrowed(accountId: number): Promise<LoanBorrowedDTO[]> {
    const result = await this.loanRepository.query(`
      SELECT 
        SUM(loan.amount) as total_loan_amount,
        SUM(loan.amount * loan.interest_rate / 100 * offer.duration / (365 * 24 * 60 *60)) as total_interest_owed,
        COUNT(1) as total_active_loan,
        asset.name,
        asset.symbol,
        asset.decimals,
        asset.price_feed_id,
        asset.token_address,
        asset.network
      FROM loan
      inner join offer on loan.lend_offer_id = offer.offer_id
      inner join collateral on loan.id = collateral.loan_id
      inner join asset on loan.asset_id = asset.id
      inner join asset as collateral_asset on collateral.asset_id = collateral_asset.id
      WHERE loan.status in ('${LoanStatus.MATCHED}', '${LoanStatus.FUND_TRANSFERRED}') AND loan.borrower_account_id = ${accountId}
      GROUP BY asset.id
    `);

    return result.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        borrowedAmount: Number(data.total_loan_amount),
        interestOwedAmount: Number(data.total_interest_owed),
        activeContractPerAsset: Number(data.total_active_loan),
      };
    });
  }

  async getSystemTotalLendSupplied(): Promise<SuppliedAssetDTO> {
    const lendSupplied = await this.offerRepository.query(`
      SELECT 
        SUM(offer.amount) as total_lend_amount,
        SUM(
          offer.amount * offer.interest_rate / 100 * offer.duration / (365 * 24 * 60 *60)
        ) AS total_interest_earned,
        COUNT(1) AS total_active_offers,
        asset.name,
        asset.symbol,
        asset.decimals,
        asset.price_feed_id,
        asset.token_address,
        asset.network
      FROM offer
      INNER JOIN asset ON offer.asset_id = asset.id
      LEFT JOIN loan ON offer.offer_id = loan.lend_offer_id
      WHERE (offer.status = '${OfferStatus.CREATED}' or (offer.status = '${OfferStatus.LOANED}' AND loan.status != '${LoanStatus.FINISHED}'))
      GROUP BY asset.id
    `);
    const collateralSupplied = await this.loanRepository.query(`
      SELECT 
        SUM(collateral.amount) as total_collateral_amount,
        collateral_asset.id,
        collateral_asset.name,
        collateral_asset.symbol,
        collateral_asset.decimals,
        collateral_asset.price_feed_id,
        collateral_asset.token_address,
        collateral_asset.network
      FROM loan
      inner join offer on loan.lend_offer_id = offer.offer_id
      inner join collateral on loan.id = collateral.loan_id
      inner join asset on loan.asset_id = asset.id
      inner join asset as collateral_asset on collateral.asset_id = collateral_asset.id
      WHERE loan.status in ('${LoanStatus.MATCHED}', '${LoanStatus.FUND_TRANSFERRED}')
      GROUP BY collateral_asset.id
    `);
    const lendSuppliedMapped = lendSupplied.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        lendSuppliedAmount: Number(data.total_lend_amount),
        interestEarnedAmount: Number(data.total_interest_earned),
        activeContractPerAsset: Number(data.total_active_offers),
      };
    });
    const collateralSuppliedMapped = collateralSupplied.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        collateralSuppliedAmount: Number(data.total_collateral_amount),
      };
    });

    return {
      lendSupplied: lendSuppliedMapped,
      collateralSupplied: collateralSuppliedMapped,
    };
  }

  async getSystemLoanBorrowed(): Promise<LoanBorrowedDTO[]> {
    const result = await this.loanRepository.query(`
      SELECT 
        SUM(loan.amount) as total_loan_amount,
        SUM(loan.amount * loan.interest_rate / 100 * offer.duration / (365 * 24 * 60 *60)) as total_interest_owed,
        COUNT(1) as total_active_loan,
        asset.name,
        asset.symbol,
        asset.decimals,
        asset.price_feed_id,
        asset.token_address,
        asset.network
      FROM loan
      inner join offer on loan.lend_offer_id = offer.offer_id
      inner join collateral on loan.id = collateral.loan_id
      inner join asset on loan.asset_id = asset.id
      inner join asset as collateral_asset on collateral.asset_id = collateral_asset.id
      WHERE loan.status in ('${LoanStatus.MATCHED}', '${LoanStatus.FUND_TRANSFERRED}')
      GROUP BY asset.id
    `);

    return result.map((data) => {
      return {
        asset: {
          network: data.network,
          symbol: data.symbol,
          name: data.name,
          decimals: data.decimals,
          tokenAddress: data.token_address,
          priceFeedId: data.price_feed_id,
        },
        borrowedAmount: Number(data.total_loan_amount),
        interestOwedAmount: Number(data.total_interest_owed),
        activeContractPerAsset: Number(data.total_active_loan),
      };
    });
  }
}
