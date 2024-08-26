import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Network } from '../common/common.enum';
import { WalletSignatureDTO } from './auth.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/wallet/:walletAddress/nonce')
  getNonce(@Param('walletAddress') walletAddress: string): any {
    return this.authService.getNonce(walletAddress);
  }

  @Post('/:network/login')
  login(
    @Param('network') network: Network,
    @Body() walletSignature: WalletSignatureDTO,
  ): any {
    return this.authService.login(network, walletSignature);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  logout(@Req() request): any {
    return this.authService.logout(request);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  refreshAccessToken(@Req() request): any {
    return this.authService.refreshAccessToken(request);
  }
}
