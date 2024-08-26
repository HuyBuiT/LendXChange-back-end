import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class SettingNotificationDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isReceive: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  healthRatioThreshold: number;
}
