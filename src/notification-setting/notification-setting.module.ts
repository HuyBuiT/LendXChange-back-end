import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSetting } from '../notification-setting/notification-setting.entity';
import { NotificationSettingController } from './notification-setting.controller';
import { NotificationSettingService } from './notification-setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSetting])],
  exports: [TypeOrmModule],
  controllers: [NotificationSettingController],
  providers: [NotificationSettingService],
})
export class NotificationSettingModule {}
