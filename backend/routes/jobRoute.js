

const express = require("express");
const isAuth = require('../middlewares/isAuth');
const { getAdminJobs, getAllJobs, getJobById, postJob, deleteJob } = require('../controllers/jobController');

const router = express.Router();


router.post('/post', isAuth, postJob);// Post a new job
router.get('/get', getAllJobs);// Get all jobs
router.get('/getadminjobs', isAuth, getAdminJobs);// Get all jobs posted by the admin/company
router.get('/get/:id', getJobById);// Get a single job by ID
router.delete('/delete/:id', isAuth, deleteJob);// Delete a job

module.exports = router;