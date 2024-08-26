import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import {
  LOGGING_CONSOLE_LEVEL,
  LOGGING_FILE_LEVEL,
  LOG_FILE_PATH,
} from 'src/app.environment';

const pinoHttp = {
  useLevelLabels: true,
  genReqId: (req, res) => {
    if (req.id) return req.id;
    let id = req.get('X-Request-Id');
    if (id) return id;
    id = randomUUID();
    res.header('X-Request-Id', id);
    return id;
  },
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: LOGGING_CONSOLE_LEVEL,
        options: {
          singleLine: true,
        },
      },
      {
        target: 'pino/file',
        level: LOGGING_FILE_LEVEL,
        options: {
          destination: LOG_FILE_PATH,
          mkdir: true,
          sync: false,
        },
      },
    ],
  },
};

export default LoggerModule.forRoot({
  pinoHttp: pinoHttp,
});
