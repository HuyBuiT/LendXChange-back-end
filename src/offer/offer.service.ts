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
  SummaryOfferDashboardDTO,
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
    return new Map(map(offers, (value: Offer) => [value.templateId, value]));
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
}
