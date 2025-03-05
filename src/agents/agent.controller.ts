import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { GetAgentsListResponse } from './agent.type';
import { AgentService } from './agent.service';
import { ColossalService } from './colossal/colossal.service';
import { AIAgentName } from '../common/common.enum';
import { ChatParams } from './clients/chat-client/chat-client.type';

@ApiTags('AGENTS')
@Controller('agents')
export class AgentController {
  private readonly COLOSSAL_AGENT_ID = 'a4e7a67e-a65f-0f98-b572-8bfa86a8ec61';
  constructor(private readonly colossalService: ColossalService) {}

  @Get('/:agentType')
  @ApiResponse({ type: GetAgentsListResponse })
  async getAirdropInfo(
    @Param('agentType') agentType: AIAgentName,
  ): Promise<GetAgentsListResponse> {
    const agentService = this.getAgentServiceByAgentType(agentType);

    if (!agentService) {
      return { agents: [] };
    }

    const agentsList = await agentService.getAgentsList();
    return { agents: agentsList };
  }

  @Post()
  async getAgentResponse(@Body() input: ChatParams): Promise<any> {
    input.agentId = this.COLOSSAL_AGENT_ID;
    const agentService = this.colossalService;
    return agentService.generateAgentResponse(input);
  }

  private getAgentServiceByAgentType(agentType: AIAgentName) {
    let agentService: AgentService;

    switch (agentType.toLowerCase()) {
      case AIAgentName.COLOSSAL:
        agentService = this.colossalService;
        break;
    }

    return agentService;
  }
}
