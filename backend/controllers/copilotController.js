/**
 * Copilot Controller
 * AI Career Copilot with SSE streaming and chat history
 */
const { v4: uuidv4 } = require('uuid');
const ChatHistory = require('../models/chatHistory');
const { runCopilot } = require('../services/agents/graphs/copilotGraph');
const { Op } = require('sequelize');

/**
 * POST /api/v1/copilot/chat
 * Stream copilot response via SSE
 */
const chat = async (req, res) => {
  try {
    const { message, sessionId: existingSessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const sessionId = existingSessionId || uuidv4();

    // Get chat history for this session
    const history = await ChatHistory.findAll({
      where: { userId: req.id, sessionId },
      order: [['createdAt', 'ASC']],
      limit: 20,
    });

    const chatHistory = history.map(h => ({ role: h.role, content: h.content }));

    // Save user message
    await ChatHistory.create({
      userId: req.id, sessionId, role: 'user', content: message,
      metadata: { timestamp: new Date().toISOString() },
    });

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Session-Id': sessionId,
    });

    // Send session ID
    res.write(`data: ${JSON.stringify({ type: 'session', sessionId })}\n\n`);

    let fullResponse = '';
    try {
      for await (const chunk of runCopilot(req.id, message, chatHistory)) {
        if (chunk.type === 'content') {
          fullResponse += chunk.data;
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else if (chunk.type === 'tool_call' || chunk.type === 'tool_result') {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
      }
    } catch (streamErr) {
      console.error('Copilot stream error:', streamErr.message);
      fullResponse = fullResponse || 'I encountered an error processing your request. Please try again.';
      res.write(`data: ${JSON.stringify({ type: 'error', data: 'Processing error occurred.' })}\n\n`);
    }

    // Save assistant response
    if (fullResponse) {
      await ChatHistory.create({
        userId: req.id, sessionId, role: 'assistant', content: fullResponse,
        metadata: { timestamp: new Date().toISOString() },
      });
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Copilot error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Copilot failed.' });
    }
    res.end();
  }
};

/**
 * GET /api/v1/copilot/sessions
 */
const getSessions = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const sessions = await ChatHistory.findAll({
      where: { userId: req.id },
      attributes: [
        'sessionId',
        [fn('MIN', col('content')), 'firstMessage'],
        [fn('MIN', col('createdAt')), 'startedAt'],
        [fn('MAX', col('createdAt')), 'lastMessageAt'],
        [fn('COUNT', col('id')), 'messageCount'],
      ],
      group: ['sessionId'],
      order: [[fn('MAX', col('createdAt')), 'DESC']],
      raw: true,
    });
    return res.json({ success: true, data: sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions.' });
  }
};

/**
 * GET /api/v1/copilot/sessions/:sessionId
 */
const getSessionMessages = async (req, res) => {
  try {
    const messages = await ChatHistory.findAll({
      where: { userId: req.id, sessionId: req.params.sessionId },
      order: [['createdAt', 'ASC']],
    });
    if (messages.length === 0) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.json({ success: true, data: messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

/**
 * DELETE /api/v1/copilot/sessions/:sessionId
 */
const deleteSession = async (req, res) => {
  try {
    const deleted = await ChatHistory.destroy({
      where: { userId: req.id, sessionId: req.params.sessionId },
    });
    if (deleted === 0) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete session.' });
  }
};

module.exports = { chat, getSessions, getSessionMessages, deleteSession };
