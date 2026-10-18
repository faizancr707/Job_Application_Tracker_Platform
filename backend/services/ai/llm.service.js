/**
 * @file llm.service.js
 * @description LangChain LLM service
 */

const { ChatOpenAI } = require('@langchain/openai');
const aiConfig = require('../../config/ai.config');

const primaryModel = new ChatOpenAI({
  modelName: aiConfig.models.primary,
  temperature: 0.3,
  maxRetries: 3,
  timeout: 30000,
  openAIApiKey: aiConfig.env.OPENAI_API_KEY,
});

const fastModel = new ChatOpenAI({
  modelName: aiConfig.models.fast,
  temperature: 0.2,
  maxRetries: 3,
  timeout: 30000,
  openAIApiKey: aiConfig.env.OPENAI_API_KEY,
});

/**
 * Generate structured output using model's withStructuredOutput
 * @param {ChatOpenAI} model 
 * @param {any} schema Zod schema
 * @param {string} prompt 
 * @param {string} input 
 * @returns {Promise<any>}
 */
async function generateStructuredOutput(model, schema, prompt, input) {
  try {
    const structuredModel = model.withStructuredOutput(schema);
    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: input }
    ];
    const result = await structuredModel.invoke(messages);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Basic text generation
 * @param {ChatOpenAI} model 
 * @param {Array<Object>} messages 
 * @returns {Promise<any>}
 */
async function generateText(model, messages) {
  try {
    const response = await model.invoke(messages);
    return { success: true, data: response.content };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Stream text generation yielding chunks
 * @param {ChatOpenAI} model 
 * @param {Array<Object>} messages 
 */
async function* streamText(model, messages) {
  const stream = await model.stream(messages);
  for await (const chunk of stream) {
    yield chunk.content;
  }
}

/**
 * Approximate token counting
 * @param {string} text 
 * @returns {number}
 */
function countTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Detect prompt injection in user input
 * @param {string} input 
 * @returns {Object}
 */
function detectPromptInjection(input) {
  if (!input) return { isInjection: false, pattern: null };
  
  const injectionPatterns = [
    /ignore previous/i,
    /ignore all previous/i,
    /system:/i,
    /you are now/i,
    /forget everything/i,
    /disregard/i,
    /new instructions/i,
    /```/ // Delimiter injection
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { isInjection: true, pattern: pattern.toString() };
    }
  }

  return { isInjection: false, pattern: null };
}

module.exports = {
  primaryModel,
  fastModel,
  generateStructuredOutput,
  generateText,
  streamText,
  countTokens,
  detectPromptInjection
};
