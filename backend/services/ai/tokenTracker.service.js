/**
 * @file tokenTracker.service.js
 * @description Token and cost tracking service
 */

const aiConfig = require('../../config/ai.config');
let AiUsage; // Lazy require

function getAiUsageModel() {
  if (!AiUsage) {
    try {
      // Assuming models are defined in a models directory
      AiUsage = require('../../models/AiUsage');
    } catch (e) {
      // If model not yet implemented, ignore
      console.warn('AiUsage model not found, usage will not be tracked to DB');
    }
  }
  return AiUsage;
}

/**
 * Calculate cost in USD
 * @param {string} model 
 * @param {number} inputTokens 
 * @param {number} outputTokens 
 * @returns {number}
 */
function calculateCost(model, inputTokens, outputTokens) {
  const rates = aiConfig.cost[model] || { input: 0, output: 0 };
  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;
  return inputCost + outputCost;
}

/**
 * Track usage and save to DB
 * @param {Object} params 
 * @returns {Promise<any>}
 */
async function trackUsage({ userId, feature, model, inputTokens = 0, outputTokens = 0, latencyMs, success, error }) {
  try {
    const cost = calculateCost(model, inputTokens, outputTokens);
    const AiUsageModel = getAiUsageModel();
    
    if (AiUsageModel) {
      await AiUsageModel.create({
        userId,
        feature,
        model,
        inputTokens,
        outputTokens,
        totalCost: cost,
        latencyMs,
        success,
        error: error ? String(error) : null
      });
    }
    
    return { success: true, data: { cost } };
  } catch (err) {
    console.error('Error tracking usage:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Get aggregated user usage stats
 * @param {string|number} userId 
 * @param {number} days 
 * @returns {Promise<any>}
 */
async function getUserUsage(userId, days = 30) {
  try {
    const AiUsageModel = getAiUsageModel();
    if (!AiUsageModel) {
      return { success: false, message: 'AiUsage model not available' };
    }

    const { Op } = require('sequelize');
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const usage = await AiUsageModel.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: dateLimit
        }
      }
    });

    // Aggregate stats
    const stats = usage.reduce((acc, curr) => {
      acc.totalCost += curr.totalCost || 0;
      acc.totalInputTokens += curr.inputTokens || 0;
      acc.totalOutputTokens += curr.outputTokens || 0;
      acc.totalRequests += 1;
      return acc;
    }, { totalCost: 0, totalInputTokens: 0, totalOutputTokens: 0, totalRequests: 0 });

    return { success: true, data: stats };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Create a LangChain callback handler
 * @param {string|number} userId 
 * @param {string} feature 
 * @returns {Object}
 */
function createLangChainCallback(userId, feature) {
  const startTime = Date.now();
  
  return {
    handleLLMEnd: async (output) => {
      try {
        const latencyMs = Date.now() - startTime;
        let inputTokens = 0;
        let outputTokens = 0;
        let model = 'gpt-4o'; 

        if (output.llmOutput && output.llmOutput.tokenUsage) {
          inputTokens = output.llmOutput.tokenUsage.promptTokens || 0;
          outputTokens = output.llmOutput.tokenUsage.completionTokens || 0;
        }
        
        // Sometimes the model name is returned in the payload, this depends on the specific langchain implementation
        if (output.llmOutput && output.llmOutput.modelName) {
            model = output.llmOutput.modelName;
        }

        await trackUsage({
          userId,
          feature,
          model,
          inputTokens,
          outputTokens,
          latencyMs,
          success: true
        });
      } catch (error) {
        console.error('Error in LangChain callback:', error);
      }
    },
    handleLLMError: async (error) => {
       try {
        const latencyMs = Date.now() - startTime;
        await trackUsage({
          userId,
          feature,
          model: 'unknown',
          inputTokens: 0,
          outputTokens: 0,
          latencyMs,
          success: false,
          error: error.message
        });
      } catch (err) {
        console.error('Error in LangChain callback:', err);
      }
    }
  };
}

module.exports = {
  trackUsage,
  calculateCost,
  getUserUsage,
  createLangChainCallback
};
