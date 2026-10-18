/**
 * Copilot LangGraph Agent
 * ReAct agent with tool calling for the AI Career Copilot
 */
const { ChatOpenAI } = require('@langchain/openai');
const { createReactAgent } = require('@langchain/langgraph/prebuilt');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { createUserTools } = require('../tools.service');

const COPILOT_SYSTEM_PROMPT = `You are an AI Career Copilot — a personal career assistant helping users with their job search.

You have access to tools to search jobs, view applications, access resumes, get stats, perform semantic search, analyze skill gaps, and view interview history.

Guidelines:
- Be conversational yet professional
- Use markdown formatting for readability
- Provide specific, actionable advice
- Use tools to access the user's actual data before giving advice
- Proactively suggest next steps
- Keep responses focused and concise
- Never fabricate data — always use tools to get real information`;

/**
 * Create a copilot agent for a specific user
 * @param {number} userId
 * @returns {object} LangGraph agent
 */
function createCopilotAgent(userId) {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: true,
  });

  const tools = createUserTools(userId);

  const agent = createReactAgent({
    llm,
    tools,
  });

  return agent;
}

/**
 * Run the copilot agent with a message and chat history
 * @param {number} userId
 * @param {string} userMessage
 * @param {Array} chatHistory - Array of {role, content}
 * @returns {AsyncGenerator} Streams response chunks
 */
async function* runCopilot(userId, userMessage, chatHistory = []) {
  const agent = createCopilotAgent(userId);

  const messages = [
    new SystemMessage(COPILOT_SYSTEM_PROMPT),
    ...chatHistory.map(msg =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
    ),
    new HumanMessage(userMessage),
  ];

  const stream = await agent.stream(
    { messages },
    { recursionLimit: 10 }
  );

  for await (const event of stream) {
    if (event.agent?.messages) {
      for (const msg of event.agent.messages) {
        if (msg.content) {
          yield { type: 'content', data: msg.content };
        }
        if (msg.tool_calls?.length > 0) {
          for (const tc of msg.tool_calls) {
            yield { type: 'tool_call', data: { name: tc.name, args: tc.args } };
          }
        }
      }
    }
    if (event.tools?.messages) {
      for (const msg of event.tools.messages) {
        yield { type: 'tool_result', data: { name: msg.name, result: msg.content?.substring(0, 200) } };
      }
    }
  }
}

module.exports = { createCopilotAgent, runCopilot };
