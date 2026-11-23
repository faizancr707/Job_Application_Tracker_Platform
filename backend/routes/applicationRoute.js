

const express = require('express');
const isAuth = require('../middlewares/isAuth');
const {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
} = require('../controllers/applicationController');

const router = express.Router();


router.post('/apply/:id', isAuth, applyJob);

router.get('/get', isAuth, getAppliedJobs);

router.get('/:id/applicants', isAuth, getApplicants);

router.post('/status/:id/update', isAuth, updateStatus);
router.patch('/status/:id/update', isAuth, updateStatus);
router.post('/status/:id', isAuth, updateStatus);
router.patch('/status/:id', isAuth, updateStatus);

module.exports = router;
