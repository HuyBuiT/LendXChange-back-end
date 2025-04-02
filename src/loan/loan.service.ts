import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNotEmpty } from 'class-validator';
import { isEmpty } from 'lodash';
import { buildOrderBy } from 'src/util/util.query';
import { Repository } from 'typeorm';
import { LoanStatus, SortDirection } from '../common/common.enum';
import { Offer } from '../offer/offer.entity';
import { Loan } from './loan.entity';
import {
  ActiveLoansDashboardRequest,
  ListLoanRequest,
  SummaryLoanDashboardDTO,
} from './loan.type';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import { Parser } from 'json2csv';
import { BASE_PROVIDER_PATH } from 'src/app.environment';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly LoanRepository: Repository<Loan>,
  ) {}

  @Cron('*/1 * * * *') //Cronjob run every 5 minutes
  async handleUpdatePoolData() {
    const loans = await this.LoanRepository.find({
      relations: ['lenderAccount', 'borrowerAccount'],
    });

    // Extract necessary fields
    const csvData = loans.map((loan) => ({
      loanAddress: loan.loanOfferId,
      amount: loan.amount / 1000000,
      interestRate: loan.interestRate,
      status: loan.status,
      startDate: loan.startDate,
      endDate: loan.endDate,
      borrowerAddress: loan.lenderAccount.walletAddress,
      lenderAddress: loan.borrowerAccount.walletAddress, // Adjust based on the actual field structure
    }));

    // Convert to CSV format
    const parser = new Parser();
    const csv = parser.parse(csvData);

    const filePath = BASE_PROVIDER_PATH + 'loan-data.csv';

    console.log('Writing to file:', filePath);
    // Write to file
    fs.writeFileSync(filePath, csv);
    console.log('Updated offer data successfully and saved to loan-data.csv.');
  }

  async listLoan(params: ListLoanRequest): Promise<[Loan[], number]> {
    const { lenderAddress, borrowerAddress, templateId, isActive, statuses } =
      params;
    const query = this.LoanRepository.createQueryBuilder('loan')
      .addSelect(
        `CASE
          WHEN loan.status = 'Matched'          THEN 1
          WHEN loan.status = 'FundTransferred'  THEN 1
          WHEN loan.status = 'Repay'            THEN 2
          WHEN loan.status = 'Liquidating'      THEN 3
          WHEN loan.status = 'Liquidated'       THEN 3
          WHEN loan.status = 'BorrowerPaid'     THEN 4
          WHEN loan.status = 'Finished'         THEN 4
          ELSE 5
        END`,
        'loan_status_idx',
      )
      .addSelect(
        `CASE
          WHEN loan.status = 'Matched'          THEN loan.end_date
          WHEN loan.status = 'FundTransferred'  THEN loan.end_date
          WHEN loan.status = 'Finished'         THEN loan.end_date
          ELSE "loan".created_at
         END
        `,
        'target_date',
      )
      .leftJoinAndSelect('loan.lenderAccount', 'lenderAccount')
      .leftJoinAndSelect('loan.borrowerAccount', 'borrowerAccount')
      .leftJoinAndSelect('loan.collaterals', 'collaterals')
      .leftJoinAndSelect('loan.events', 'events')
      .leftJoinAndSelect('loan.liquidationEvents', 'liquidationEvents');

    if (isNotEmpty(lenderAddress)) {
      query.andWhere('lenderAccount.walletAddress = :walletAddress', {
        walletAddress: lenderAddress,
      });
    }

    if (isNotEmpty(borrowerAddress)) {
      query.andWhere('borrowerAccount.walletAddress = :walletAddress', {
        walletAddress: borrowerAddress,
      });
    }

    if (isNotEmpty(templateId)) {
      query.andWhere('loan.templateId = :templateId', {
        templateId: templateId,
      });
    }

    if (isNotEmpty(isActive)) {
      isActive.toString() == 'true'
        ? query.andWhere('loan.status in (:...statuses)', {
            statuses: [LoanStatus.MATCHED, LoanStatus.FUND_TRANSFERRED],
          })
        : query.andWhere('loan.status not in (:...statuses)', {
            statuses: [LoanStatus.MATCHED, LoanStatus.FUND_TRANSFERRED],
          });
    }

    if (isNotEmpty(statuses)) {
      query.andWhere('loan.status in (:...statuses)', {
        statuses,
      });
    }

    const [pageNum, pageSize, sort] = params.pagination;

    if (sort) {
      query.orderBy(sort);
    } else {
      query.orderBy('loan_status_idx', 'ASC');
    }

    return query
      .take(pageSize)
      .skip(pageNum * pageSize)
      .getManyAndCount();
  }

  async getSummaryLoanDashboard(
    accountId: number,
  ): Promise<SummaryLoanDashboardDTO> {
    const data = await this.LoanRepository.createQueryBuilder('loan')
      .innerJoinAndSelect(Offer, 'offer', 'loan.lendOfferId = offer.offerId')
      .where('loan.borrower_account_id = :accountId', { accountId })
      .select(
        `sum(case
        when loan.status IN ('${LoanStatus.FINISHED}', '${LoanStatus.BORROWER_PAID}', '${LoanStatus.LIQUIDATED}')
        then offer.amount * offer.interest_rate / 100 * offer.duration / 31536000
        else 0
        end)`,
        'totalInterestPaid',
      )
      .addSelect(
        `sum(case
        when loan.status NOT IN ('${LoanStatus.FINISHED}', '${LoanStatus.BORROWER_PAID}', '${LoanStatus.LIQUIDATED}')
        then offer.amount * offer.interest_rate / 100 * offer.duration / 31536000
        else 0
        end)`,
        'totalInterestInActiveContract',
      )
      .addSelect(
        `sum(case
        when loan.status IN ('${LoanStatus.FINISHED}', '${LoanStatus.BORROWER_PAID}', '${LoanStatus.LIQUIDATED}')
        then 1
        else 0
        end)`,
        'totalInterestPaidContracts',
      )
      .addSelect(
        `sum(case
        when loan.status NOT IN ('${LoanStatus.FINISHED}', '${LoanStatus.BORROWER_PAID}', '${LoanStatus.LIQUIDATED}')
        then loan.amount
        else 0
        end)`,
        'totalActiveContractsValue',
      )
      .addSelect(
        `sum(case
        when loan.status NOT IN ('${LoanStatus.FINISHED}', '${LoanStatus.BORROWER_PAID}', '${LoanStatus.LIQUIDATED}')
        then 1
        else 0
        end)`,
        'totalActiveContracts',
      )
      .addSelect('sum(loan.amount)', 'totalBorrowedValue')
      .addSelect('count(1)', 'totalBorrowedContracts')
      .getRawOne();
    return {
      totalInterestPaid: Number(data.totalInterestPaid),
      totalInterestInActiveContract: Number(data.totalInterestInActiveContract),
      totalInterestPaidContracts: Number(data.totalInterestPaidContracts),
      totalActiveContractsValue: Number(data.totalActiveContractsValue),
      totalActiveContracts: Number(data.totalActiveContracts),
      totalBorrowedValue: Number(data.totalBorrowedValue),
      totalBorrowedContracts: Number(data.totalBorrowedContracts),
    };
  }

  async getActiveLoansDashboard(
    params: ActiveLoansDashboardRequest,
  ): Promise<[loans: Loan[], count: number]> {
    const { templateId, network } = params;
    const query = this.LoanRepository.createQueryBuilder('loan')
      .leftJoin('loan.borrowerAccount', 'borrowerAccount')
      .leftJoin('loan.lenderAccount', 'lenderAccount')
      .leftJoin('loan.offer', 'offer')
      .leftJoin('offer.offerTemplate', 'offerTemplate')
      .where('loan.network = :network', { network })
      .andWhere('offerTemplate.id = :templateId', {
        templateId: templateId,
      })
      .select([
        'loan.id',
        'loan.loanOfferId',
        'borrowerAccount.walletAddress',
        'loan.interestRate',
        'lenderAccount.walletAddress',
        'loan.lendOfferId',
        'loan.startDate',
        'loan.createdAt',
      ]);

    const [pageNum, pageSize, sort] = params.pagination;

    return buildOrderBy(
      query,
      isEmpty(sort) ? { 'loan.createdAt': SortDirection.DESC } : sort,
    )
      .take(pageSize)
      .skip(pageNum * pageSize)
      .getManyAndCount();
  }
}
