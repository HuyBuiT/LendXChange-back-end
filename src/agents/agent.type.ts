import { ApiProperty } from '@nestjs/swagger';

export class GetAgentsListResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
}
