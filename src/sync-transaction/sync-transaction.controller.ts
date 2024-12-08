import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SyncTransactionService } from './sync-transaction.service';
import { SyncTransactionRequest } from './sync-transaction.type';

@ApiTags('sync-transaction')
@Controller('sync-transaction')
export class SyncTransactionController {
  constructor(
    private readonly syncTransactionService: SyncTransactionService,
  ) {}

  @Post()
  async syncTransaction(@Body() params: SyncTransactionRequest) {
    await this.syncTransactionService.syncTransaction(params);
  }
}
