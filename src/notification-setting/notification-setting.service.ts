import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from '../notification-setting/notification-setting.entity';
import { SettingNotificationDto } from './dto/setting-notification.dto';
import { IUpsertNotificationSetting } from './interfaces/upsert-notification-setting.interface';

@Injectable()
export class NotificationSettingService {
  constructor(
    @InjectRepository(NotificationSetting)
    private readonly notificationSettingRepository: Repository<NotificationSetting>,
  ) {}

  async getNotificationSetting(
    accountId: number,
  ): Promise<NotificationSetting> {
    return await this.notificationSettingRepository.findOne({
      where: { accountId },
    });
  }

  async settingNotification(
    payload: SettingNotificationDto,
    accountId: number,
  ): Promise<NotificationSetting> {
    const notificationSetting = await this.findOneOrCreate({
      ...payload,
      accountId,
    });

    return await this.notificationSettingRepository.save(notificationSetting);
  }

  async findOneOrCreate(
    payload: IUpsertNotificationSetting,
  ): Promise<NotificationSetting> {
    const { accountId, healthRatioThreshold, isReceive } = payload;

    return this.notificationSettingRepository.merge(
      (await this.notificationSettingRepository.findOne({
        where: { accountId },
      })) ?? this.notificationSettingRepository.create({ accountId }),
      {
        isReceive,
        healthRatioThreshold,
      },
    );
  }
}
