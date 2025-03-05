import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { cacheModule } from './config/config.cache';
import loggerModule from './config/config.logger';
import { dbOrmModuleAsync } from './config/config.typeorm';
import { LoanModule } from './loan/loan.module';
import { NotificationSettingModule } from './notification-setting/notification-setting.module';
import { OfferModule } from './offer/offer.module';
import { SyncTransactionModule } from './sync-transaction/sync-transaction.module';
import { AgentModule } from './agents/agent.module';
import { ColossalModule } from './agents/colossal/colossal.module';

@Module({
  imports: [
    dbOrmModuleAsync,
    loggerModule,
    cacheModule,
    AuthModule,
    OfferModule,
    LoanModule,
    NotificationSettingModule,
    AssetsModule,
    SyncTransactionModule,
    AgentModule,
    ColossalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
