import {
  Action,
  AgentRuntime,
  Character,
  elizaLogger,
  IAgentRuntime,
  Plugin,
  Provider,
  stringToUuid,
} from '@elizaos/core';
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { initializeDatabase } from './database';
import { initializeDbCache } from './cache';
import * as path from 'path';
import * as fs from 'fs';
import {
  GOOGLE_GENERATIVE_AI_API_KEY,
  OPENAI_API_KEY,
  OPENROUTER_API_KEY,
} from '../app.environment';
import { AIAgentName, AIAgentProvider } from '../common/common.enum';
import { ConfigService } from '@nestjs/config';
import { ChatClient } from './clients/chat-client';
import { ChatParams } from './clients/chat-client/chat-client.type';
import PostgresDatabaseAdapter from '@elizaos/adapter-postgres';

export abstract class AgentService {
  constructor(
    protected readonly config: ConfigService,
    protected readonly agentName: AIAgentName,
    protected chatClient: ChatClient,
  ) {}

  private createAgent(
    character: any,
    db: any,
    cache: any,
    token: string,
    plugins: Plugin[],
    actions?: Action[],
  ) {
    elizaLogger.success(
      elizaLogger.successesTitle,
      'Creating runtime for character',
      character.name,
    );
    const providers: Provider[] = []; // TODO: add offer and loan data provider
    return new AgentRuntime({
      databaseAdapter: db,
      token,
      modelProvider: character.modelProvider,
      evaluators: [],
      character,
      plugins: [...plugins].filter(Boolean),
      providers: providers,
      actions: actions ?? [],
      services: [],
      managers: [],
      cacheManager: cache,
    });
  }

  private async startAgent(
    character: any,
    plugins?: Plugin[],
    actions?: Action[],
  ) {
    try {
      character.id ??= stringToUuid(character.name);
      character.username ??= character.name;

      const token = this.getTokenForProvider(
        character.modelProvider,
        character,
      );
      const dataDir = path.join(__dirname, '../data');

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const db = initializeDatabase(dataDir);
      await db.init();

      const cache = initializeDbCache(character, db);
      const runtime = this.createAgent(
        character,
        db,
        cache,
        token,
        plugins ?? [bootstrapPlugin],
        actions,
      );

      await runtime.initialize();
      runtime.clients = await this.initializeClients(character, runtime);
      this.chatClient.registerAgent(runtime);

      elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);
      return runtime;
    } catch (error) {
      elizaLogger.error(
        `Error starting agent for character ${character.name}:`,
        error,
      );
      throw error;
    }
  }

  private getTokenForProvider(_provider: string, _character: any) {
    if (_character?.settings?.secrets?.tokenKey) {
      return this.config.get(_character?.settings?.secrets?.tokenKey);
    } else if (_provider == AIAgentProvider.GOOGLE) {
      return GOOGLE_GENERATIVE_AI_API_KEY;
    } else if (_provider == AIAgentProvider.OPEN_ROUTER) {
      return OPENROUTER_API_KEY;
    } else if (_provider == AIAgentProvider.OPEN_AI) {
      return OPENAI_API_KEY;
    } else {
      throw Error('Invalid provider');
    }
  }

  public async startAgents(
    charactersArg: string,
    plugins: Plugin[],
    actions?: Action[],
  ) {
    let characters = [];
    if (charactersArg) {
      characters = await this.loadCharacters(charactersArg);
    }

    try {
      for (const char of characters) {
        await this.startAgent(char, plugins, actions);
      }
    } catch (error) {
      elizaLogger.error('Error starting agents:', error);
      throw error;
    }
  }

  async generateAgentResponse(params: ChatParams) {
    return this.chatClient.generateResponse(params);
  }

  private async loadCharacters(charactersArg: string) {
    const characterPaths = charactersArg
      .split(',')
      .filter((path) => !!path)
      .map((filePath) => {
        if (path.basename(filePath) === filePath) {
          filePath = './characters/' + filePath;
        }
        return path.resolve(process.cwd(), filePath.trim());
      });

    const loadedCharacters = [];
    for (const path of characterPaths) {
      try {
        const character = JSON.parse(fs.readFileSync(path, 'utf8'));
        loadedCharacters.push(character);
      } catch (error) {
        elizaLogger.error(`Error loading character from ${path}:`, error);
        throw error;
      }
    }

    return loadedCharacters;
  }

  private async initializeClients(
    character: Character,
    runtime: IAgentRuntime,
  ) {
    const clients = [];

    if (character.plugins?.length > 0) {
      for (const plugin of character.plugins) {
        if (plugin.clients) {
          for (const client of plugin.clients) {
            clients.push(await client.start(runtime));
          }
        }
      }
    }

    return clients;
  }

  public getAgentsList() {
    const agents = this.chatClient.getAgents();

    const agentsList = Array.from(agents.values()).map((agent) => ({
      id: agent.agentId,
      name: agent.character.name,
      clients: Object.keys(agent.clients),
    }));

    return agentsList;
  }

  public async getAvailableCredits(
    agentId: string,
    walletAddress: string,
    network: string,
  ) {
    if (!agentId || !walletAddress || !network) return;

    const runtime = this.chatClient.getAgentById(agentId);

    if (!runtime) {
      throw new Error('Agent not found');
    }

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const sql = `SELECT COUNT(*) AS total FROM memories WHERE "agentId" = $1 AND "userId" = $2 AND "createdAt" >= $3`;

      const userId = stringToUuid(
        `${walletAddress || 'default-user-id'}-${
          network.toLowerCase() || 'default-network'
        }`,
      );

      const totalMessages = await (
        runtime.databaseAdapter as PostgresDatabaseAdapter
      ).query(sql, [agentId, userId, startOfDay]);

      return {
        totalMessages: Number(totalMessages.rows[0]['total']),
        remainingCredits: 20 - totalMessages.rows[0]['total'],
      };
    } catch (error) {
      console.error('Error fetching memories:', error);
      return {
        totalMessages: 0,
        remainingCredits: 0,
      };
    }
  }
}
