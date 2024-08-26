import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from 'src/common/common.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../account/account.entity';

@Entity({ name: 'notification_setting' })
export class NotificationSetting extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column({ name: 'is_receive' })
  isReceive: boolean;

  @ApiProperty()
  @Column({ name: 'health_ratio_threshold', type: 'float' })
  healthRatioThreshold: number;

  @ApiProperty()
  @Column({ name: 'account_id' })
  accountId: number;

  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;
}
