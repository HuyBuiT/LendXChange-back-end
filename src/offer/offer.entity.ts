import { AbstractEntity } from 'src/common/common.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { OfferStatus } from '../common/common.enum';

@Entity({ name: 'offer_template' })
export class OfferTemplate extends AbstractEntity {
  @PrimaryColumn({ name: 'id' })
  id: string;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'network' })
  network: string;

  @Column({ name: 'duration', type: 'bigint' })
  duration: number;
}

//View will be created by liquibase
@Entity({ name: 'offer_template_view' })
export class OfferTemplateView {
  @PrimaryColumn({ name: 'id' })
  id: string;

  @Column({ name: 'min_interest_rate', type: 'float' })
  minInterestRate: number;

  @Column({ name: 'max_interest_rate', type: 'float' })
  maxInterestRate: number;
}

@Entity({ name: 'offer' })
export class Offer extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'offer_id' })
  offerId: string;

  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  @ManyToOne(() => Account)
  account: Account;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ name: 'interest_rate', type: 'float' })
  interestRate: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'symbol' })
  symbol: string;

  @Column({ name: 'network' })
  network: string;

  @Column({ name: 'duration', type: 'bigint' })
  duration: number;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'status', enum: OfferStatus })
  status: OfferStatus;

  @OneToMany(() => OfferEvent, (event) => event.offer)
  @JoinColumn({ name: 'offer_id', referencedColumnName: 'offerId' })
  events: Relation<OfferEvent[]>;
}

@Entity({ name: 'offer_event' })
export class OfferEvent extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'offer_id' })
  offerId: string;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ name: 'signature' })
  signature: string;

  @ManyToOne(() => Offer)
  @JoinColumn({ name: 'offer_id', referencedColumnName: 'offerId' })
  offer: Offer;
}
