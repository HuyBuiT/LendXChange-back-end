import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { isNil } from 'lodash';
import { Logger } from 'nestjs-pino';
import { Account, AccountSession } from 'src/account/account.entity';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  WALLET_NONCE_TTL,
} from 'src/app.environment';
import { Network } from 'src/common/common.enum';
import { verifyMessageSignature } from 'src/util/util.signature';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { v4 as uuidv4 } from 'uuid';
import { WalletSignatureDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AccountSession)
    private readonly accountSessionRepository: Repository<AccountSession>,
    private jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async getNonce(walletAddress: string): Promise<any> {
    let nonce: string = await this.cacheManager.get(
      `wallet:${walletAddress}:nonce`,
    );

    if (isNil(nonce)) {
      nonce = uuidv4();
      await this.cacheManager.set(
        `wallet:${walletAddress}:nonce`,
        nonce,
        WALLET_NONCE_TTL,
      );
    }

    return {
      walletAddress: walletAddress,
      nonce: nonce,
    };
  }

  @Transactional()
  async login(
    network: Network,
    walletSignature: WalletSignatureDTO,
  ): Promise<any> {
    const { walletAddress, signature } = walletSignature;
    const nonce: string = await this.cacheManager.get(
      `wallet:${walletAddress}:nonce`,
    );

    if (isNil(nonce)) {
      throw new UnauthorizedException('Expired nonce');
    }

    if (
      !(await verifyMessageSignature(network, nonce, signature, walletAddress))
    ) {
      throw new UnauthorizedException('Failed to verify wallet signature');
    }

    const account = await this.findOrCreateAccountByWalletAddress(
      walletAddress,
    );
    const session = await this.saveAccountSession(account);
    await this.cacheManager.del(`wallet:${walletAddress}:nonce`);
    return this.generateTokens(account, session);
  }

  @Transactional()
  async logout(request: any): Promise<any> {
    const accountSession = await this.accountSessionRepository.findOne({
      where: {
        id: request.user.sessionId,
        accountId: request.user.id,
      },
    });
    if (!isNil(accountSession)) {
      await this.accountSessionRepository.delete(accountSession);
    }
  }

  async refreshAccessToken(request: any): Promise<any> {
    const accountSession = await this.accountSessionRepository.findOne({
      where: {
        id: request.user.sessionId,
        accountId: request.user.id,
      },
    });

    if (isNil(accountSession)) {
      throw new UnauthorizedException();
    }

    const accountInfo = await this.accountRepository.findOne({
      where: {
        id: request.user.id,
      },
    });

    return this.generateTokens(accountInfo, accountSession);
  }

  private async findOrCreateAccountByWalletAddress(
    walletAddress: string,
  ): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: {
        walletAddress: walletAddress,
      },
    });

    if (!isNil(account)) {
      return account;
    }

    return await this.accountRepository.save(
      this.accountRepository.create({
        walletAddress: walletAddress,
      }),
    );
  }

  private async saveAccountSession(account: Account): Promise<AccountSession> {
    //TODO remove the find if support multi account session
    let accountSession = await this.accountSessionRepository.findOne({
      where: {
        accountId: account.id,
      },
    });

    if (isNil(accountSession)) {
      accountSession = this.accountSessionRepository.create({
        accountId: account.id,
      });

      return this.accountSessionRepository.save(accountSession);
    }

    return accountSession;
  }

  private generateTokens(account: Account, session: AccountSession): any {
    //TODO [accessToken, refreshToken] = await Promise.all(signAsync)

    const accessToken = this.jwtService.sign(
      { sub: account.id, session_id: session.id },
      {
        secret: JWT_ACCESS_SECRET,
        expiresIn: JWT_ACCESS_EXPIRES_IN,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: account.id, session_id: session.id },
      {
        secret: JWT_REFRESH_SECRET,
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      },
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
}
