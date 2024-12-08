import * as dotenv from 'dotenv';
import { LogLevel } from 'typeorm';

dotenv.config();

// Set server timezone
if (!process.env.TZ) {
  process.env.TZ = 'UTC';
}

export const TIMEZONE = process.env.TZ;

// Environment
export const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Server config
export const PORT: number = parseInt(process.env.PORT, 10) || 3000;
export const CONTEXT_PATH: string = process.env.CONTEXT_PATH || '/api';

// Swagger config
export const SWAGGER_ENDPOINT = process.env.SWAGGER_ENDPOINT || 'docs';

// Database connection
export const DATABASE_HOST: string = process.env.DATABASE_HOST || 'localhost';
export const DATABASE_PORT: number =
  parseInt(process.env.DATABASE_PORT, 10) || 5432;
export const DATABASE_USER: string = process.env.DATABASE_USER || 'postgres';
export const DATABASE_PASSWORD: string =
  process.env.DATABASE_PASSWORD || 'postgres';
export const DATABASE_NAME: string = process.env.DATABASE_NAME || 'postgres';

//TODO quite dump for just parsing env
export const TYPEORM_LOGGING: boolean | LogLevel[] = process.env.TYPEORM_LOGGING
  ? JSON.parse(process.env.TYPEORM_LOGGING)
  : false;
export const TYPEORM_SYNCHRONIZE: boolean = process.env.TYPEORM_SYNCHRONIZE
  ? JSON.parse(process.env.TYPEORM_SYNCHRONIZE)
  : false;
export const TYPEORM_LOGGING_SHOW_PARAMETERS: boolean = process.env
  .TYPEORM_LOGGING_SHOW_PARAMETERS
  ? JSON.parse(process.env.TYPEORM_LOGGING_SHOW_PARAMETERS)
  : false;

export const WALLET_NONCE_TTL: number =
  parseInt(process.env.WALLET_NONCE_TTL, 10) || 3000;

export const EMAIL_OTP_TTL: number =
  parseInt(process.env.EMAIL_OTP_TTL, 10) || 3000;

export const LOGGING_CONSOLE_LEVEL =
  process.env.LOGGING_CONSOLE_LEVEL || 'debug';
// Silent level mean no logging
export const LOGGING_FILE_LEVEL = process.env.LOGGING_FILE_LEVEL || 'silent';

export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logger.log';

export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'access-secret';
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'refresh-secret';
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '5m';
export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || '30m';

export const SMTP_HOST: string = process.env.SMTP_HOST || '';
export const SMTP_USER: string = process.env.SMTP_USER || '';
export const SMTP_PASSWORD: string = process.env.SMTP_PASSWORD || '';

export const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT: number = parseInt(process.env.REDIS_PORT, 10) || 6379;
export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD;
export const REDIS_DATABASE: number = parseInt(process.env.REDIS_DATABASE);

export const SYNC_TRANSACTION_QUEUE_JOB_OPTIONS = {
  attempts: 3,
  delays: 5000,
};
