import { AbstractEntity } from 'src/common/common.entity';
import { Network } from 'src/common/common.enum';
import { Collateral, Loan } from 'src/loan/loan.entity';
import { Offer, OfferTemplate } from 'src/offer/offer.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity({ name: 'asset' })
export class Asset extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({
    name: 'network',
    type: 'varchar',
    length: 255,
    default: Network.SUI,
  })
  network: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'symbol',
    type: 'varchar',
    length: 255,
    default: 'SUI',
  })
  symbol: string;

  @Column({
    name: 'token_address',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  tokenAddress: string;

  @Column({
    name: 'decimals',
    type: 'integer',
    nullable: false,
  })
  decimals: number;

  @Column({
    name: 'price_feed_id',
    type: 'varchar',
    length: 255,
  })
  priceFeedId: string;

  @Column({
    name: 'price_feed_account_address',
    type: 'varchar',
    length: 255,
  })
  priceFeedAccountAddress: string;

  @Column({
    name: 'is_lend_asset',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isLendAsset: boolean;

  @Column({
    name: 'is_collateral_asset',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isCollateralAsset: boolean;

  // @OneToMany(() => OfferTemplate, (offerTemplate) => offerTemplate.asset)
  // offerTemplates: Relation<OfferTemplate>[];

  // @OneToMany(() => Offer, (offer) => offer.asset)
  // offers: Relation<Offer>[];

  // @OneToMany(() => Loan, (loan) => loan.asset)
  // loans: Relation<Loan>[];

  // @OneToMany(() => Collateral, (collateral) => collateral.asset)
  // collaterals: Relation<Collateral>[];
}
