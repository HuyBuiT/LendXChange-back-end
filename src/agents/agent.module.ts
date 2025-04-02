import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './agent.controller';
import { ColossalModule } from './colossal/colossal.module';
import { LoanDataProvider } from './providers/loan-data';

@Module({
  imports: [ConfigModule, ColossalModule],
  // providers: [LoanDataProvider],
  // exports: [LoanDataProvider],
  controllers: [AgentController],
})
export class AgentModule {}
