import { ApiProperty } from '@nestjs/swagger';
import { Network } from 'src/common/common.enum';

export class SyncTransactionRequest {
  @ApiProperty()
  transactionHash: string;
  @ApiProperty()
  network: Network;
}
