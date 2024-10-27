import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { pick } from 'lodash';
import { Asset } from './asset.entity';
import { AssetsService } from './assets.service';
import { GetAssetsQueryParams } from './assets.type';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  private readonly DEFAULT_ASSET_FIELDS = Array<keyof Asset>(
    'network',
    'name',
    'symbol',
    'tokenAddress',
    'decimals',
    'priceFeedId',
    'priceFeedAccountAddress',
    'isLendAsset',
    'isCollateralAsset',
  );

  constructor(private readonly assetsService: AssetsService) {}

  @Get('/')
  async getAssets(@Query() params: GetAssetsQueryParams) {
    const assets = await this.assetsService.getAssets(params);

    return assets.map((asset) => pick(asset, this.DEFAULT_ASSET_FIELDS));
  }
}
