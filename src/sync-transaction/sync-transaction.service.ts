import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { PinoLogger } from 'nestjs-pino';
import { SYNC_TRANSACTION_QUEUE_JOB_OPTIONS } from 'src/app.environment';
import {
  InjectSyncTransactionQueue,
  SyncTransactionQueueJob,
} from './sync-transaction-queue.enum';
import { SyncTransactionRequest } from './sync-transaction.type';
@Injectable()
export class SyncTransactionService {
  constructor(
    private readonly logger: PinoLogger,
    @InjectSyncTransactionQueue()
    private readonly syncTransactionQueue: Queue<any>,
  ) {
    logger.setContext(SyncTransactionService.name);
  }

  async syncTransaction(params: SyncTransactionRequest) {
    const { transactionHash, network } = params;
    const timestamp = Date.now();
    const data = {
      txHash: transactionHash,
      network,
      timestamp,
    };
    await this.syncTransactionQueue.add(
      SyncTransactionQueueJob.SUI_TRANSACTION,
      data,
      {
        ...SYNC_TRANSACTION_QUEUE_JOB_OPTIONS,
        jobId: `${SyncTransactionQueueJob.SUI_TRANSACTION}:${transactionHash}`,
      },
    );
    this.logger.debug(
      `Added job sync transaction, jobId:${SyncTransactionQueueJob.SUI_TRANSACTION}:${transactionHash}`,
    );
  }
}
