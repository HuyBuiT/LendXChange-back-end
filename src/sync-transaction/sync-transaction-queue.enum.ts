import { InjectQueue } from '@nestjs/bull';

export enum SyncTransactionQueue {
  SYNC_TRANSACTION = 'sync-transaction',
}

export enum SyncTransactionQueueJob {
  SUI_TRANSACTION = 'sui-transaction',
}

export const InjectSyncTransactionQueue = () =>
  InjectQueue(SyncTransactionQueue.SYNC_TRANSACTION);

// queue config
export const SyncTransactionQueueConfig = {
  name: SyncTransactionQueue.SYNC_TRANSACTION,
  limiter: { max: 10, duration: 1000 },
};
