import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';
import { GetAssetsQueryParams } from './assets.type';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async getAssets({
    isCollateralAsset,
    isLendAsset,
    network,
  }: GetAssetsQueryParams) {
    const assets = await this.assetRepository
      .createQueryBuilder('asset')
      .where((qb) => {
        if (network) qb.where('asset.network = :network', { network });
        if (isLendAsset)
          qb.where('asset.isLendAsset = :isLendAsset', { isLendAsset });
        if (isCollateralAsset)
          qb.andWhere('asset.isCollateralAsset = :isCollateralAsset', {
            isCollateralAsset,
          });
      })
      .getMany();

    return assets;
  }
}
