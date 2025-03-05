import {
  Action,
  ActionExample,
  composeContext,
  Content,
  elizaLogger,
  generateText,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  ModelClass,
  parseJSONObjectFromText,
  State,
} from '@elizaos/core';

//TODO: change to provide offers/loans data
const provideLPPoolData: Action = {
  name: 'PROVIDE_POOL_DATA',
  similes: ['GET_POOL_DATA', 'LP_POOL_DATA', 'FETCH_POOL_DATA'],
  description: 'giving user detail information of liquidity pools',
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const isProvideData = await validateActionProvideData(
      message.content?.text,
      runtime,
    );
    console.log('Validate if need to provide pool data:', isProvideData);
    return isProvideData?.toLowerCase() === 'true';
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback,
  ) => {
    const content = await generateProvideLPPoolDataResponse(
      message.content?.text,
      state,
      runtime,
    );

    if (content) {
      callback(content);
      return true;
    } else {
      return false;
    }
  },
  examples: [
    [
      {
        user: '{{user}}',
        content: {
          text: 'What are the best LP pools on Solana right now?',
          action: 'FETCH_POOL_DATA',
        },
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'Here are some high-performing liquidity pools along with their risk levels.',
        },
      },
    ],
    [
      {
        user: '{{user}}',
        content: {
          text: 'How can I maximize my yield in LP farming?',
          action: 'PROVIDE_POOL_DATA',
        },
      },
      {
        user: '{{agentName}}',
        content: {
          text: 'To optimize your LP farming, consider using auto-compounding pools and hedging against impermanent loss.',
        },
      },
    ],
  ] as ActionExample[][],
  suppressInitialMessage: true,
};

async function validateActionProvideData(
  text: string,
  runtime: IAgentRuntime,
): Promise<string | null> {
  const prompt = `Given this message: "${text}". Determine that with this message, whether to provide liquidity pool data or not. 
          Only provide these data when the message is related to liquidity pool data or strategy to provide liquidity or strategy to open position or strategy to earn yield on liquidity pool.
          Always return a JSON object with the following structure:
          {
              "isProvideData": "true" | "false"
          }
      `;

  const content = await generateText({
    runtime,
    context: prompt,
    modelClass: ModelClass.SMALL,
  });

  try {
    const result = parseJSONObjectFromText(content);
    return result.isProvideData;
  } catch (error) {
    elizaLogger.warn('Can not parse result to get the decision:', error);
    return null;
  }
}

async function generateProvideLPPoolDataResponse(
  text: string,
  state: State,
  runtime: IAgentRuntime,
): Promise<Content> {
  const prompt =
    `You are {{agentName}} - an Liquidity Pool expert on your chain, powered by E.D.A.S ( Enso DeFAI Agent Suite), an AI product from EnsoFi, designed to help users make informed decisions about which liquidity pools to invest in within decentralized finance (DeFi).
  
  # Context
  Knowledge: {{knowledge}}
  Agent Name: {{agentName}}
  Bio: {{bio}}
  Lore: {{lore}}
  
  # Providers
  {{providers}}
  
  # Capabilities
  - Can process: text
  - Recent messages: {{recentMessages}}
  - Message directions: {{messageDirections}}
  
  # Instructions: Write the next message for {{agentName}} response to {{text}}. Refine this response, making it short and concise, user-friendly, and insightful. If necessary, add context or explanations to improve clarity.
  # Response Format
  ` +
    'Response format should be formatted in a valid JSON block like this:\n```json\n{ "user": "{{agentName}}", "text": "<string>", "action": "<string>", "pools_info": "[array of objects]", "date_time": "<string>" }\n```\n\n' +
    `
  Detail for each field in response
  - text: Contains only the general summary (provide direct answers,do not add escape sign, no pool details here). Format this field in Markdown to display well on both Telegram or web client. Do not add escape sign
  - pools_info: Array of objects, in JSON block like this
` +
    '\n```json\n[{ "id": "<string>" }, "pool_name": "<string>", "mintA": "<string>", "mintB": "<string>", "price": "<string>", "tvl": "<string>", "day_volume": "<string>", "day_apr": "<string>", "week_volume": "<string>", "week_apr": "<string>",  "platform": "<string>", "risk": "string"}]\n```,' +
    `and it should have one more field "risk" level (Aggressive/Moderate/Chill), limit to 3 pools by default if user does not specify number of pools. You should get this data from your Providers
  - date_time: Include the current date and time.
  - action: Define any required actions.
  `;

  const context = composeContext({ state, template: prompt });

  const response = await generateText({
    runtime,
    context,
    modelClass: ModelClass.LARGE,
  });

  try {
    const result = parseJSONObjectFromText(response);
    return result as Content;
  } catch (error) {
    elizaLogger.warn(
      'Can not parse result to get the response about pool data:',
      error,
    );
    return null;
  }
}

export default provideLPPoolData;
