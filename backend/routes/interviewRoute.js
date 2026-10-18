const express = require('express');
const isAuth = require('../middlewares/isAuth');
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const { generateInterview, evaluateInterview, getInterviewHistory, getInterviewById } = require('../controllers/interviewController');

const router = express.Router();

router.post('/generate', isAuth, aiRateLimiter, generateInterview);
router.post('/:id/evaluate', isAuth, aiRateLimiter, evaluateInterview);
router.get('/history', isAuth, getInterviewHistory);
router.get('/:id', isAuth, getInterviewById);

module.exports = router;
