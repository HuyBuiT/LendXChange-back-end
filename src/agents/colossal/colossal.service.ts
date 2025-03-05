import { Injectable, OnModuleInit } from '@nestjs/common';

import { AgentService } from '../agent.service';
import { messageHandlerTemplate } from './templates';
import bootstrapPlugin from '@elizaos/plugin-bootstrap';
import provideLPPoolData from '../common-actions/lp-pool-data/provide-lp-pool-data';
import { ConfigService } from '@nestjs/config';
import { ChatClient } from '../clients/chat-client';
import { AIAgentName } from '../../common/common.enum';

@Injectable()
export class ColossalService extends AgentService implements OnModuleInit {
  private readonly LOAD_COLOSSAL = 'true';
  private readonly TOTAL_COLOSSAL_AGENT = 1;
  constructor(protected config: ConfigService) {
    super(config, AIAgentName.COLOSSAL, new ChatClient(messageHandlerTemplate));
  }

  async onModuleInit() {
    if (this.LOAD_COLOSSAL.toLowerCase() == 'true') {
      let path = '';
      for (let i = 1; i <= this.TOTAL_COLOSSAL_AGENT; i++) {
        path += `${process.cwd()}/src/resources/characters/colossal/colossal_${i}.character.json,`;
      }

      await this.startAgents(path, [bootstrapPlugin], [provideLPPoolData]);
    }
  }
}
