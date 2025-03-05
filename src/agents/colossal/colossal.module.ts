import { forwardRef, Module } from '@nestjs/common';
import { ColossalService } from './colossal.service';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from '../agent.module';

@Module({
  imports: [ConfigModule, forwardRef(() => AgentModule)],
  providers: [ColossalService],
  exports: [ColossalService],
})
export class ColossalModule {}
