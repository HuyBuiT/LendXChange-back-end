import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, AccountSession } from './account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountSession])],
  exports: [TypeOrmModule],
})
export class AccountModule {}
