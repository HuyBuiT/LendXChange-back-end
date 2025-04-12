import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { map, pick } from 'lodash';
import { AccessTokenGuard } from '../auth/auth.guard';
import {
  ApiPaginatedResponse,
  ApiSortQuery,
  PagingResponse,
} from '../common/common.component';
import {
  Collateral,
  LiquidationEvent,
  Loan,
  LoanEvent,
  Payment,
} from './loan.entity';
import { LoanService } from './loan.service';
import {
  ActiveLoansDashboardDTO,
  ActiveLoansDashboardRequest,
  ListLoanRequest,
  LoanDTO,
  SummaryLoanDashboardDTO,
} from './loan.type';

@ApiTags('loans')
@ApiExtraModels(LoanDTO)
@Controller('loans')
export class LoanController {
  private readonly DEFAULT_LOAN_FIELDS = Array<keyof Loan>(
    'loanOfferId',
    'lendOfferId',
    'templateId',
    'interestRate',
    'amount',
    'symbol',
    'network',
    'isActive',
    'isPaid',
    'isDue',
    'status',
    'lenderFee',
    'borrowerFee',
    'startDate',
    'endDate',
  );

  private readonly DEFAULT_COLLATERAL_FIELDS = Array<keyof Collateral>(
    'amount',
    'symbol',
    'network',
    'createdAt',
  );

  private readonly DEFAULT_PAYMENT_FIELDS = Array<keyof Payment>(
    'amount',
    'symbol',
    'network',
    'createdAt',
  );

  private readonly DEFAULT_LOAN_EVENT_FIELDS = Array<keyof LoanEvent>(
    'eventName',
    'signature',
    'createdAt',
  );

  private readonly DEFAULT_LOAN_LIQUIDATION_EVENT_FIELDS = Array<
    keyof LiquidationEvent
  >('eventName', 'metadata', 'signature', 'createdAt');

  constructor(private readonly loanService: LoanService) {}

  @ApiPaginatedResponse(LoanDTO)
  @ApiSortQuery('loan')
  @ApiOperation({
    summary: 'Get list of borrow contracts',
    description: `
      Use sorts[loan.status] to sort by status alphabetically.
      Use sorts[loan_status_idx] to sort by status index.
      Matched        :  1
      FundTransferred:  2
      Repay          :  3
      BorrowerPaid   :  4
      Liquidating    :  5
      Liquidated     :  6
      Finished       :  7
    `,
  })
  @Get('')
  async listLoans(
    @Query() params: ListLoanRequest,
  ): Promise<PagingResponse<LoanDTO>> {
    const [loans, count] = await this.loanService.listLoan(params);
    const pageData = map(loans, (loan) => {
      loan.symbol = 'USDC';
      loan.network = 'SUI';
      return {
        ...pick(loan, this.DEFAULT_LOAN_FIELDS),
        collaterals: map(loan.collaterals, (collateral) => {
          collateral.network = 'SUI';
          collateral.symbol = 'SUI';
          return pick(collateral, this.DEFAULT_COLLATERAL_FIELDS);
        }),
        payments: map(loan.payments, (payment) =>
          pick(payment, this.DEFAULT_PAYMENT_FIELDS),
        ),
        lenderAddress: loan.lenderAccount.walletAddress,
        borrowerAddress: loan.borrowerAccount.walletAddress,
        events: map(loan.events, (event) =>
          pick(event, this.DEFAULT_LOAN_EVENT_FIELDS),
        ),
        liquidationEvents: map(loan.liquidationEvents, (event) =>
          pick(event, this.DEFAULT_LOAN_LIQUIDATION_EVENT_FIELDS),
        ),
      };
    });

    return {
      pageData: pageData,
      pageNum: params.pageNum,
      total: count,
    };
  }

  @ApiPaginatedResponse(ActiveLoansDashboardDTO)
  @ApiSortQuery('loan')
  @Get('/active-loans')
  async activeLoansByTemplateId(
    @Query() params: ActiveLoansDashboardRequest,
  ): Promise<PagingResponse<ActiveLoansDashboardDTO>> {
    const [loans, count] = await this.loanService.getActiveLoansDashboard(
      params,
    );

    return {
      pageData: map(loans, (loan) => {
        return {
          borrowOfferId: loan.loanOfferId,
          borrowerAddress: loan.borrowerAccount.walletAddress,
          interestPercent: loan.interestRate,
          lendOfferId: loan.lendOfferId,
          lenderAddress: loan.lenderAccount.walletAddress,
          startDate: loan.startDate,
        };
      }),
      pageNum: params.pageNum,
      total: count,
    };
  }

  @Get('dashboard')
  @UseGuards(AccessTokenGuard)
  async getSummaryLoanDashboard(
    @Req() req: any,
  ): Promise<SummaryLoanDashboardDTO> {
    const account = req.user;
    return await this.loanService.getSummaryLoanDashboard(account.id);
  }
}
