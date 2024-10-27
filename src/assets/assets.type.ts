import { ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from 'src/common/common.enum';

export class GetAssetsQueryParams {
  @ApiPropertyOptional()
  isLendAsset: boolean;

  @ApiPropertyOptional()
  isCollateralAsset: boolean;

  @ApiPropertyOptional()
  network: Network;
}
