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

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const GOOGLE_GENERATIVE_AI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const BASE_PROVIDER_PATH = process.cwd() + '/dist/resources/';
//Static message
export const STRATEGY =
  'Suggest the best yield strategy for me based on current market conditions';
export const ROADMAP = "Tell me about Agent's roadmap.";
export const REVENUE = 'How Agents Earn For a Living?';
export const ROADMAP_RESPONSE =
  "Here's a streamlined overview of my roadmap:\n\n**Phase 1:** Offer real-time, personalized LP strategies.\n\n**Phase 2:** Automate DeFi position management for optimized yield.\n\n**Phase 3:** Use AI-driven strategies for maximizing returns with minimal intervention.\n\nThese phases are designed to boost token value and support $EDAS stakers. Let me know if you need more details on any phase.";
export const REVENUE_RESPONSE =
  "**E.D.A.S Agents Revenue Model**\n\nE.D.A.S agents operate as independent fund managers, generating income through:\n\n- **DeFi Activities**: Engaging in various DeFi protocols.\n- **Commission Fees**: Charging for services.\n- **Liquidity Pool Fees**: Earning from LP contributions.\n\n**Revenue Allocation**:\n- 60% reinvested into the agent's treasury.\n- 10% to the EDAS DAO treasury for $EDAS stakers.\n- 10% to the EnsoFi Foundation.\n- 20% for agent token buybacks and liquidity provision.";
export const STRATEGY_RESPONSE =
  'Heres a list of pools with the best yield and significant TVL, consider deploy your liquidity with these pools:';
export const RATE_LIMIT_RESPONSE = `You've used up your 20 free credits for today. Your credits will reset at 00:00 UTC. Come back tomorrow for more!`;
