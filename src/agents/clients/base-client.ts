import { AgentRuntime } from '@elizaos/core';
import { ChatParams } from './chat-client/chat-client.type';

export abstract class BaseClient {
  protected agents: Map<string, AgentRuntime>; // container management

  constructor() {
    this.agents = new Map();
  }

  public abstract generateResponse(params: ChatParams): Promise<string | JSON>;

  public registerAgent(runtime: AgentRuntime) {
    // register any plugin endpoints?
    // but once and only once
    this.agents.set(runtime.agentId, runtime);
  }

  public unregisterAgent(runtime: AgentRuntime) {
    this.agents.delete(runtime.agentId);
  }
}
