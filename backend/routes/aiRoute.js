const express = require('express');
const isAuth = require('../middlewares/isAuth');
const { aiRateLimiter } = require('../middlewares/rateLimiter');
const promptGuard = require('../middlewares/promptGuard');
const { analyzeJob, matchResume, skillGap, coverLetter, semanticSearch, dashboardInsights, getUsageStats } = require('../controllers/aiController');

const router = express.Router();

// All AI routes require auth + rate limiting + prompt guard
router.post('/analyze-job', isAuth, aiRateLimiter, promptGuard, analyzeJob);
router.post('/match', isAuth, aiRateLimiter, matchResume);
router.post('/skill-gap', isAuth, aiRateLimiter, skillGap);
router.post('/cover-letter', isAuth, aiRateLimiter, promptGuard, coverLetter);
router.post('/semantic-search', isAuth, aiRateLimiter, promptGuard, semanticSearch);
router.get('/dashboard-insights', isAuth, aiRateLimiter, dashboardInsights);
router.get('/usage', isAuth, getUsageStats);

module.exports = router;
