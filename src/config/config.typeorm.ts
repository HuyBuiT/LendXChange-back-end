import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  TYPEORM_LOGGING,
  TYPEORM_LOGGING_SHOW_PARAMETERS,
  TYPEORM_SYNCHRONIZE,
} from 'src/app.environment';
import {
  AbstractLogger,
  DataSource,
  LoggerOptions,
  LogLevel,
  LogMessage,
  QueryRunner,
} from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

export class PinoTypeOrmLogger extends AbstractLogger {
  constructor(private readonly logger: PinoLogger, options?: LoggerOptions) {
    super(options);
    logger.setContext(PinoTypeOrmLogger.name);
  }

  /**
   * Write log to specific output.
   */
  protected writeLog(
    level: LogLevel,
    logMessage: LogMessage | LogMessage[],
    queryRunner?: QueryRunner,
  ) {
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: false,
      appendParameterAsComment: TYPEORM_LOGGING_SHOW_PARAMETERS,
    });

    for (const message of messages) {
      switch (message.type ?? level) {
        case 'log':
        case 'schema-build':
        case 'migration':
          this.logger.info(message.message);
          break;

        case 'info':
        case 'query':
          if (message.prefix) {
            this.logger.info(`${message.prefix} ${message.message}`);
          } else {
            this.logger.info(message.message);
          }
          break;

        case 'warn':
        case 'query-slow':
          if (message.prefix) {
            this.logger.warn(`${message.prefix} ${message.message}`);
          } else {
            this.logger.warn(message.message);
          }
          break;

        case 'error':
        case 'query-error':
          if (message.prefix) {
            this.logger.error(`${message.prefix} ${message.message}`);
          } else {
            this.logger.error(message.message);
          }
          break;
      }
    }
  }
}

export const dataSourceOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  autoLoadEntities: true,
  synchronize: TYPEORM_SYNCHRONIZE,
  logging: TYPEORM_LOGGING,
};

export const dbOrmModuleAsync = TypeOrmModule.forRootAsync({
  useFactory: (logger: PinoLogger) => {
    return {
      ...dataSourceOptions,
      logger: new PinoTypeOrmLogger(logger, dataSourceOptions.logging),
    };
  },
  dataSourceFactory: async (options) => {
    return addTransactionalDataSource(new DataSource(options));
  },
  inject: [PinoLogger],
});
