import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { BASE_PROVIDER_PATH } from 'src/app.environment';

@Injectable()
export class LoanDataProvider implements Provider {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  public name = 'market';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(
    _runtime: IAgentRuntime,
    _message: Memory,
    state?: State,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const dataPath = 'loan-data.csv';
        const filePath = BASE_PROVIDER_PATH + dataPath;
        console.log('Reading market data from CSV:', filePath);
        const results: any[] = [];

        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(JSON.stringify(results)))
          .on('error', (error) => reject(error));
      } catch (error) {
        console.error('Error reading market data from CSV:', error);
        reject(JSON.stringify([]));
      }
    });
  }
}
