import { forwardRef, Module } from '@nestjs/common';
import { ColossalService } from './colossal.service';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from '../agent.module';
import { LoanDataProvider } from '../providers/loan-data';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule, forwardRef(() => AgentModule)],
  providers: [ColossalService, LoanDataProvider],
  exports: [ColossalService],
})
export class ColossalModule {}
