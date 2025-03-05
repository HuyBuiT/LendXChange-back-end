import { ApiProperty } from '@nestjs/swagger';

export class GetAgentsListResponse {
  @ApiProperty()
  agents: {
    id: string;
    name: string;
    clients: string[];
  }[];
}
