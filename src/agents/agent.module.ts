import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentController } from './agent.controller';
import { ColossalModule } from './colossal/colossal.module';

@Module({
  imports: [ConfigModule, ColossalModule],
  controllers: [AgentController],
})
export class AgentModule {}
