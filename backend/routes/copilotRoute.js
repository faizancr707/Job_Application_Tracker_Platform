const express = require('express');
const isAuth = require('../middlewares/isAuth');
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const promptGuard = require('../middlewares/promptGuard');
const { chat, getSessions, getSessionMessages, deleteSession } = require('../controllers/copilotController');

const router = express.Router();

router.post('/chat', isAuth, aiRateLimiter, promptGuard, chat);
router.get('/sessions', isAuth, getSessions);
router.get('/sessions/:sessionId', isAuth, getSessionMessages);
router.delete('/sessions/:sessionId', isAuth, deleteSession);

module.exports = router;
