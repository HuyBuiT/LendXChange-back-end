import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetAgentsListResponse } from './agent.type';
import { ColossalService } from './colossal/colossal.service';
import { ChatParams } from './clients/chat-client/chat-client.type';

@ApiTags('AGENTS')
@Controller('agents')
export class AgentController {
  constructor(private readonly colossalService: ColossalService) {}

  // @Get('')
  // @ApiResponse({ type: GetAgentsListResponse })
  // async getAgentInfo(): Promise<GetAgentsListResponse> {
  //   const agentService = this.getAgentService();

  //   if (!agentService) {
  //     return null;
  //   }

  //   const agentsList = agentService.getAgentsList();
  //   return {
  //     id: agentsList[0].id,
  //     name: agentsList[0].name,
  //   };
  // }

  @Post()
  async getAgentResponse(@Body() input: ChatParams): Promise<any> {
    const agentService = this.colossalService;
    return agentService.generateAgentResponse(input);
  }

  private getAgentService() {
    return this.colossalService;
  }
}
