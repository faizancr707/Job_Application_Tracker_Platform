const express = require('express');
const isAuth = require('../middlewares/isAuth');
const { singleUpload } = require('../middlewares/multer');
const { uploadResumeController, getResumes, getResumeById, getResumeAnalysis, deleteResume, setPrimaryResume } = require('../controllers/resumeController');

const router = express.Router();

router.post('/upload', isAuth, singleUpload, uploadResumeController);
router.get('/', isAuth, getResumes);
router.get('/:id', isAuth, getResumeById);
router.get('/:id/analysis', isAuth, getResumeAnalysis);
router.delete('/:id', isAuth, deleteResume);
router.patch('/:id/set-primary', isAuth, setPrimaryResume);

module.exports = router;
