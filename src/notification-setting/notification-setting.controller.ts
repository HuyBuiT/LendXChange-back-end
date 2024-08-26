import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { IRequestInfo } from 'src/common/interfaces/request-info.interface';
import { SettingNotificationDto } from './dto/setting-notification.dto';
import { NotificationSettingService } from './notification-setting.service';

@ApiTags('notification-setting')
@Controller('notification-setting')
export class NotificationSettingController {
  constructor(
    private readonly notificationSettingService: NotificationSettingService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getNotificationSetting(@Req() request: IRequestInfo) {
    return await this.notificationSettingService.getNotificationSetting(
      request.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('/')
  async settingNotification(
    @Body() input: SettingNotificationDto,
    @Req() request: IRequestInfo,
  ) {
    return await this.notificationSettingService.settingNotification(
      input,
      request.user.id,
    );
  }
}
