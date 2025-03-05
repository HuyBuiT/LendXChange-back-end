import {
  composeContext,
  Content,
  elizaLogger,
  generateMessageResponse,
  getEmbeddingZeroVector,
  type Memory,
  ModelClass,
  stringToUuid,
} from '@elizaos/core';
import { ChatParams } from './chat-client.type';
import { BaseClient } from '../base-client';
import {
  ROADMAP,
  REVENUE,
  ROADMAP_RESPONSE,
  REVENUE_RESPONSE,
  STRATEGY,
  STRATEGY_RESPONSE,
} from '../../../app.environment';

export class ChatClient extends BaseClient {
  constructor(private readonly messageHandlerTemplate: string) {
    super();
    elizaLogger.log('ChatClient constructor');
  }

  async generateResponse(params: ChatParams): Promise<JSON> {
    const { agentId, text, network, accountId } = params;
    const roomId = stringToUuid('default-room-' + agentId);

    const userId = stringToUuid(
      `${accountId}-${network.toLowerCase() || 'default-network'}`,
    );

    let runtime = this.agents.get(agentId);

    // if runtime is null, look for runtime with the same name
    if (!runtime) {
      runtime = Array.from(this.agents.values()).find(
        (a) => a.character.name.toLowerCase() === agentId.toLowerCase(),
      );
    }

    if (!runtime) {
      throw new Error('Agent not found');
    }

    await runtime.ensureConnection(
      userId,
      roomId,
      accountId, // Use userId for username
      userId,
      'direct',
    );

    // if empty text, directly return
    if (!text) {
      return;
    }

    const messageId = stringToUuid(Date.now().toString());

    const content: Content = {
      text,
      source: 'direct',
      inReplyTo: undefined,
      accountId,
      network,
    };

    const userMessage = {
      content,
      userId,
      roomId,
      agentId: runtime.agentId,
    };

    const memory: Memory = {
      id: stringToUuid(messageId + '-' + userId),
      ...userMessage,
      agentId: runtime.agentId,
      userId,
      roomId,
      content,
      createdAt: Date.now(),
    };

    await runtime.messageManager.addEmbeddingToMemory(memory);
    await runtime.messageManager.createMemory(memory);

    let state = await runtime.composeState(userMessage, {
      agentName: runtime.character.name,
    });

    const context = composeContext({
      state,
      template: this.messageHandlerTemplate,
    });

    let response: Content;

    const { answer, needAction } = this.getStaticResponse(text);
    if (answer && needAction) {
      const agentName = runtime.character.name;
      response = {
        user: agentName,
        text: answer,
        action: needAction,
        date_time: new Date().toISOString(),
      };
    } else {
      response = await generateMessageResponse({
        runtime: runtime,
        context,
        modelClass: ModelClass.SMALL,
      });
    }

    if (!response) {
      throw new Error('No response from generateMessageResponse');
    }

    // save response to memory
    const responseMessage: Memory = {
      id: stringToUuid(messageId + '-' + runtime.agentId),
      ...userMessage,
      userId: runtime.agentId,
      content: response,
      embedding: getEmbeddingZeroVector(),
      createdAt: Date.now(),
    };

    await runtime.messageManager.createMemory(responseMessage);

    state = await runtime.updateRecentMessageState(state);

    let message = null as Content | null;

    await runtime.processActions(
      memory,
      [responseMessage],
      state,
      async (newMessages) => {
        message = newMessages;
        return [memory];
      },
    );

    await runtime.evaluate(memory, state);

    // Check if we should suppress the initial message
    const action = runtime.actions.find((a) => a.name === response.action);

    const shouldSuppressInitialMessage = action?.suppressInitialMessage;

    if (!shouldSuppressInitialMessage) {
      if (message) {
        return JSON.parse(JSON.stringify([response, message]));
      } else {
        return JSON.parse(JSON.stringify([response]));
      }
    } else {
      if (message) {
        return JSON.parse(JSON.stringify([message]));
      } else {
        return JSON.parse(JSON.stringify([]));
      }
    }
  }

  private getStaticResponse(message: string): {
    answer: string;
    needAction: string;
  } {
    if (message.toLowerCase() === ROADMAP.toLowerCase()) {
      return { answer: ROADMAP_RESPONSE, needAction: 'NONE' };
    } else if (message.toLowerCase() === REVENUE.toLowerCase()) {
      return { answer: REVENUE_RESPONSE, needAction: 'NONE' };
    } else if (message.toLowerCase() === STRATEGY.toLowerCase()) {
      return { answer: STRATEGY_RESPONSE, needAction: 'PROVIDE_POOL_DATA' };
    } else {
      return { answer: null, needAction: null };
    }
  }

  public getAgents() {
    return this.agents;
  }

  public getAgentById(agentId: string) {
    return this.agents.get(agentId);
  }
}
