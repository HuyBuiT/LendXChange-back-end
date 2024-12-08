import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SyncTransactionQueueConfig } from './sync-transaction-queue.enum';
import { SyncTransactionController } from './sync-transaction.controller';
import { SyncTransactionService } from './sync-transaction.service';

@Module({
  imports: [BullModule.registerQueue(SyncTransactionQueueConfig)],
  providers: [SyncTransactionService],
  controllers: [SyncTransactionController],
})
export class SyncTransactionModule {}
